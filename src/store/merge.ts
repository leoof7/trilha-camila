// Junta duas cópias da escola (ex.: o PC da Camila e o celular da Anne) sem perder nada.
// Regra: tudo que tem id é somado; se o mesmo id está nos dois lados, vale o lado "preferido".
// O que foi apagado de propósito vai para `removed` (lápide) e não volta na próxima junção.
import type { DB } from './types';

type WithId = { id: string };

function byId<T extends WithId>(a: T[] = [], b: T[] = [], gone: Set<string>): T[] {
  const m = new Map<string, T>();
  for (const x of a) m.set(x.id, x);
  for (const x of b) m.set(x.id, x); // b é o preferido
  return [...m.values()].filter((x) => !gone.has(x.id));
}

function byKey<T>(a: T[] = [], b: T[] = [], key: (x: T) => string): T[] {
  const m = new Map<string, T>();
  for (const x of a) m.set(key(x), x);
  for (const x of b) m.set(key(x), x);
  return [...m.values()];
}

export const draftTomb = (key: string, at: string) => `draft:${key}:${at}`;

/** Junta `base` com `pref`; em conflito no mesmo id, ganha `pref`. Configurações vêm de `pref`. */
export function mergeDB(base: DB, pref: DB): DB {
  const removed = Array.from(new Set([...(base.removed ?? []), ...(pref.removed ?? [])])).slice(-3000);
  const gone = new Set(removed);
  const studyDays: Record<string, string[]> = { ...base.studyDays };
  for (const [k, v] of Object.entries(pref.studyDays ?? {})) studyDays[k] = Array.from(new Set([...(studyDays[k] ?? []), ...v])).sort();
  const drafts = Object.fromEntries(
    Object.entries({ ...(base.drafts ?? {}), ...(pref.drafts ?? {}) }).filter(([k, d]) => !gone.has(draftTomb(k, d.at))),
  );
  return {
    ...base,
    ...pref,
    settings: { ...base.settings, ...pref.settings },
    students: byId(base.students, pref.students, gone),
    results: byId(base.results, pref.results, gone),
    grades: byId(base.grades, pref.grades, gone),
    classes: byId(base.classes, pref.classes, gone),
    goals: byId(base.goals, pref.goals, gone),
    stickers: byId(base.stickers, pref.stickers, gone),
    exams: byId(base.exams, pref.exams, gone),
    feedback: byKey(base.feedback, pref.feedback, (f) => `${f.studentId}:${f.unitId}`),
    homework: byKey(base.homework, pref.homework, (h) => `${h.studentId}:${h.unitId}`),
    keys: { ...base.keys, ...pref.keys },
    studyDays,
    drafts,
    removed,
  };
}

/** Marca ids como apagados de propósito (para não voltarem de outro aparelho). */
export function tomb(d: DB, ...ids: string[]): DB {
  return { ...d, removed: [...(d.removed ?? []), ...ids] };
}
