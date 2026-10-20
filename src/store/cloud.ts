// Banco na nuvem (Supabase). A Camila entra com e-mail e senha; os dados da escola dela
// ficam numa linha protegida (só ela lê). Sem internet, o app continua salvando no aparelho
// e sobe tudo quando a conexão volta.
import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';
import type { DB } from './types';

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
  const { data, error } = await sb().auth.signUp({ email, password });
  if (error) throw new Error(error.message.includes('already') ? 'Esse e-mail já tem conta. Use "Entrar".' : error.message);
  return data.session; // null quando o Supabase pede para confirmar o e-mail
}

export async function signOut() { try { await sb().auth.signOut(); } catch { /* ignora */ } }

export async function pull(): Promise<{ data: DB; updated_at: string } | null> {
  const s = await currentSession();
  if (!s) return null;
  const { data, error } = await sb().from('trilha_escola').select('data, updated_at').eq('owner', s.user.id).maybeSingle();
  if (error) throw error;
  return data as { data: DB; updated_at: string } | null;
}

let timer: ReturnType<typeof setTimeout> | undefined;
let pending: DB | null = null;
export type SyncState = 'off' | 'saving' | 'saved' | 'offline';
let listener: (s: SyncState) => void = () => {};
export function onSync(fn: (s: SyncState) => void) { listener = fn; }

async function flush() {
  if (!pending) return;
  const s = await currentSession();
  if (!s) { listener('off'); return; }
  const db = pending;
  listener('saving');
  const { error } = await sb().from('trilha_escola').upsert({ owner: s.user.id, data: db, updated_at: new Date().toISOString() });
  if (error) { listener('offline'); timer = setTimeout(flush, 15000); return; }
  if (pending === db) pending = null;
  listener('saved');
}

/** Agenda o envio (junta várias mudanças seguidas num envio só). */
export function push(db: DB) {
  if (!cloudOn) return;
  pending = db;
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, 1500);
}

if (typeof window !== 'undefined') window.addEventListener('online', () => { if (pending) flush(); });
