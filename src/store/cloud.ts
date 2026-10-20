// Banco na nuvem (Supabase).
// Professora: entra com e-mail e senha; a escola dela é UMA linha protegida (só ela lê e escreve).
// Aluno: entra no celular dele com código da turma + nome + senha. Ele nunca vê a escola inteira:
// o banco devolve só os dados dele (aluno_dados) e só aceita gravar o que é dele (aluno_salvar).
// Sem internet, tudo continua salvo no aparelho e sobe quando a conexão volta.
// Dois aparelhos ao mesmo tempo: antes de gravar, junta com o que está na nuvem (mergeDB).
import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';
import type { DB } from './types';
import { mergeDB } from './merge';

const URL = 'https://cijebckqlxtfleoedgsi.supabase.co';
const KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? '';

export const cloudOn = !!KEY;
let client: SupabaseClient | null = null;
const sb = () => (client ??= createClient(URL, KEY, { auth: { persistSession: true, storageKey: 'trilha-camila-auth' } }));

export async function currentSession(): Promise<Session | null> {
  if (!cloudOn) return null;
  try { return (await sb().auth.getSession()).data.session; } catch { return null; }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await sb().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message.includes('Invalid') ? 'E-mail ou senha errados.' : error.message.includes('confirm') ? 'Confirme o e-mail primeiro (veja sua caixa de entrada).' : error.message);
  return data.session;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await sb().auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } });
  if (error) throw new Error(error.message.includes('already') ? 'Esse e-mail já tem conta. Use "Entrar".' : error.message);
  return data.session; // null quando o Supabase pede para confirmar o e-mail
}

export async function signOut() { try { await sb().auth.signOut(); } catch { /* ignora */ } }

/** Código da turma: 6 letras/números fáceis de ditar (sem 0/O, 1/I/L). */
export function newSchoolCode(rnd: () => number = Math.random) {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => A[Math.floor(rnd() * A.length)]).join('');
}

export async function pull(): Promise<{ data: DB; updated_at: string } | null> {
  const s = await currentSession();
  if (!s) return null;
  const { data, error } = await sb().from('trilha_escola').select('data, updated_at').eq('owner', s.user.id).maybeSingle();
  if (error) throw error;
  return data as { data: DB; updated_at: string } | null;
}

/** Marca da última versão que este aparelho conhece (para saber se outro aparelho mudou algo). */
export let lastStamp = '';
export function markSeen(stamp: string) { lastStamp = stamp; }

let timer: ReturnType<typeof setTimeout> | undefined;
let pending: DB | null = null;
export const hasPending = () => !!pending;
export type SyncState = 'off' | 'saving' | 'saved' | 'offline';
let listener: (s: SyncState) => void = () => {};
export function onSync(fn: (s: SyncState) => void) { listener = fn; }
let mergedListener: (d: DB) => void = () => {};
/** Chamado quando a nuvem tinha coisa que este aparelho não tinha (ex.: lição que a Anne fez em casa). */
export function onMerged(fn: (d: DB) => void) { mergedListener = fn; }

async function flush() {
  if (!pending) return;
  const s = await currentSession();
  if (!s) { listener('off'); return; }
  if (student) return;
  const mine = pending;
  listener('saving');
  try {
    for (let attempt = 0; attempt < 4; attempt++) {
      const { data: remote, error: e1 } = await sb().from('trilha_escola').select('data, updated_at').eq('owner', s.user.id).maybeSingle();
      if (e1) throw e1;
      let merged = remote?.data?.version === 1 ? mergeDB(remote.data as DB, mine) : mine;
      if (!merged.settings.schoolCode) merged = { ...merged, settings: { ...merged.settings, schoolCode: newSchoolCode() } };
      const stamp = new Date().toISOString();
      const row = { data: merged, updated_at: stamp, code: merged.settings.schoolCode };
      if (remote) {
        // só grava se ninguém gravou no meio do caminho; senão junta de novo
        const { data: ok, error } = await sb().from('trilha_escola').update(row).eq('owner', s.user.id).eq('updated_at', remote.updated_at).select('updated_at');
        if (error) throw error;
        if (!ok?.length) continue;
      } else {
        const { error } = await sb().from('trilha_escola').insert({ owner: s.user.id, ...row });
        if (error) { if (String(error.message).includes('code')) { merged.settings.schoolCode = ''; continue; } throw error; }
      }
      lastStamp = stamp;
      if (pending === mine) pending = null;
      mergedListener(merged);
      listener('saved');
      return;
    }
    throw new Error('conflito');
  } catch {
    listener('offline');
    timer = setTimeout(flush, 15000);
  }
}

/** Agenda o envio (junta várias mudanças seguidas num envio só). */
export function push(db: DB) {
  if (!cloudOn) return;
  pending = db;
  if (timer) clearTimeout(timer);
  timer = setTimeout(student ? flushStudent : flush, 1500);
}

/* ───────────── Aluno no celular dele ───────────── */
export interface StudentSession { code: string; name: string; pass: string }
const SKEY = 'trilha-aluno';
let student: StudentSession | null = (() => { try { return JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch { return null; } })();
export const studentSession = () => student;

const ERR: Record<string, string> = {
  codigo: 'Não achei esse código da turma. Confira com a professora.',
  aluno: 'Não achei esse nome na turma. Escreva como a professora cadastrou.',
  senha: 'Quase! A senha não está certa.',
};
function niceError(e: unknown) {
  const m = String((e as { message?: string })?.message ?? e);
  for (const k of Object.keys(ERR)) if (m.includes(k)) return new Error(ERR[k]);
  return new Error('Sem internet agora. Tente de novo.');
}

export async function studentPull(sess = student): Promise<DB> {
  if (!sess) throw new Error('sem aluno');
  const { data, error } = await sb().rpc('aluno_dados', { p_code: sess.code, p_nome: sess.name, p_senha: sess.pass });
  if (error) throw niceError(error);
  return data as DB;
}

export async function studentLogin(code: string, name: string, pass: string): Promise<DB> {
  const sess = { code: code.trim().toUpperCase(), name: name.trim(), pass };
  const d = await studentPull(sess);
  student = sess;
  try { localStorage.setItem(SKEY, JSON.stringify(sess)); } catch { /* ignora */ }
  return d;
}

export function studentLogout() {
  student = null;
  try { localStorage.removeItem(SKEY); } catch { /* ignora */ }
}

async function flushStudent() {
  if (!pending || !student) return;
  const mine = pending;
  listener('saving');
  const slice = { results: mine.results, stickers: mine.stickers, grades: mine.grades, studyDays: mine.studyDays, drafts: mine.drafts ?? {}, removed: mine.removed ?? [] };
  const { error } = await sb().rpc('aluno_salvar', { p_code: student.code, p_nome: student.name, p_senha: student.pass, p_data: slice });
  if (error) { listener('offline'); timer = setTimeout(flushStudent, 15000); return; }
  if (pending === mine) pending = null;
  listener('saved');
}

if (typeof window !== 'undefined') window.addEventListener('online', () => { if (pending) (student ? flushStudent : flush)(); });
