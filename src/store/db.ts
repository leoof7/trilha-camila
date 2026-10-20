// Camada de dados. Hoje: tudo salvo no navegador deste aparelho (IndexedDB).
// Amanhã: trocar SÓ este arquivo por Supabase. O resto do app não sabe onde os dados moram.
import { get, set } from 'idb-keyval';
import type { DB } from './types';
import { DEFAULT_SCALE } from '../engine/grade';

const KEY = 'trilha-camila-db';

export function emptyDB(): DB {
  return {
    version: 1,
    settings: { teacherName: 'Camila', pin: '', scale: { ...DEFAULT_SCALE }, schoolYear: new Date().getFullYear(), setupDone: false, pinOptional: true },
    students: [],
    results: [],
    grades: [],
    classes: [],
    goals: [],
    stickers: [],
    feedback: [],
    keys: {},
    studyDays: {},
  };
}

export async function loadDB(): Promise<DB> {
  try {
    const d = (await get(KEY)) as DB | undefined;
    if (d && d.version === 1) {
      const settings = { ...emptyDB().settings, ...d.settings };
      // v2: a senha virou opcional e a Camila pediu para tirar. Remove uma única vez.
      if (!d.settings?.pinOptional) { settings.pin = ''; settings.pinOptional = true; }
      return { ...emptyDB(), ...d, settings };
    }
  } catch {
    /* navegador sem IndexedDB: tenta localStorage */
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...emptyDB(), ...JSON.parse(raw) };
    } catch { /* ignora */ }
  }
  return emptyDB();
}

export async function saveDB(db: DB): Promise<void> {
  try {
    await set(KEY, db);
  } catch {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* ignora */ }
  }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/** Arquivo de backup que a Camila salva na pasta dela. */
export function exportBackup(db: DB): Blob {
  return new Blob([JSON.stringify({ app: 'trilha-camila', exportedAt: new Date().toISOString(), db }, null, 1)], { type: 'application/json' });
}

export function parseBackup(text: string): DB {
  const j = JSON.parse(text);
  const d = j?.db ?? j;
  if (!d || d.version !== 1 || !Array.isArray(d.students)) throw new Error('Este arquivo não é um backup da Trilha da Camila.');
  return { ...emptyDB(), ...d };
}
