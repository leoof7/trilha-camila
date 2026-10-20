// Monta a lição: personaliza com o nome do aluno, aplica o gabarito revisado pela Camila,
// gera opções e banco de palavras (sempre com palavras da própria unit).
import type { Ex, Lesson, Unit } from '../content/types';
import { itemsWithIds, unitById, UNITS, itemById } from '../content';
import { personalizeDeep, type Who } from './personalize';
import { distractors, shuffle, tiles } from './check';

export type Prepared = Ex & { id: string; bank?: string[]; options?: string[] };

export interface KeyMap { [itemId: string]: { answer: string; approved: boolean } }

function unitPools(unit: Unit) {
  const en: string[] = [];
  const pt: string[] = [];
  const pics: { emoji: string; en: string }[] = [];
  for (const v of unit.vocab) {
    tiles(v.en).forEach((w) => en.push(w));
    tiles(v.pt).forEach((w) => pt.push(w));
    if (v.emoji) pics.push({ emoji: v.emoji, en: v.en });
  }
  for (const l of unit.lessons)
    for (const it of l.items) {
      if (it.t === 'build') {
        (it.dir === 'pe' ? en : pt).push(...tiles(it.a));
        (it.dir === 'pe' ? pt : en).push(...tiles(it.q));
      }
    }
  return { en: en.filter((w) => !w.includes('{')), pt: pt.filter((w) => !w.includes('{')), pics };
}

export function prepareItem(it: Ex, unitId: number, who: Who, keys: KeyMap = {}, rnd: () => number = Math.random): Prepared {
  let ex = personalizeDeep(it, who) as Prepared;
  const k = ex.id ? keys[ex.id] : undefined;
  if (k && 'a' in ex && typeof ex.a === 'string' && k.answer.trim()) ex = { ...ex, a: personalizeDeep(k.answer, who) } as Prepared;
  const unit = unitById(Math.min(Math.max(unitId, 1), UNITS.length));
  const pools = unitPools(unit);

  if (ex.t === 'build') {
    const ans = tiles(ex.a);
    const pool = ex.dir === 'pe' ? pools.en : pools.pt;
    const extra = distractors(ans, pool, ans.length > 5 ? 3 : 2, rnd);
    ex.bank = shuffle([...ans, ...extra], rnd);
  }
  if (ex.t === 'pic' && !ex.opts) {
    const others = pools.pics.filter((p) => p.en !== ex.a).map((p) => p.en);
    ex.options = shuffle([ex.a, ...shuffle(others, rnd).slice(0, 2)], rnd);
  } else if (ex.t === 'pic' || ex.t === 'choice' || ex.t === 'hear' || ex.t === 'fill') {
    ex.options = shuffle(ex.opts!, rnd);
  }
  if (ex.t === 'order') ex.bank = shuffle(ex.a, rnd);
  if (ex.t === 'sort') ex.bank = shuffle(ex.groups.flatMap((g) => g[1]), rnd);
  if (ex.t === 'scramble') {
    let letters = shuffle(ex.a.replace(/\s/g, '').split(''), rnd);
    if (letters.join('') === ex.a && ex.a.length > 1) letters = [...letters.slice(1), letters[0]];
    ex.bank = letters;
  }
  return ex;
}

export function prepareLesson(lesson: Lesson, unitId: number, who: Who, keys: KeyMap = {}, rnd: () => number = Math.random): Prepared[] {
  return itemsWithIds(lesson).map((it) => prepareItem(it, unitId, who, keys, rnd));
}

/** Provinha: 10 questões da unit, sem fala (fala é avaliada pela Camila na aula), sem repetir tipo em sequência. */
export function buildQuiz(unit: Unit, who: Who, keys: KeyMap = {}, size = 10, rnd: () => number = Math.random): Prepared[] {
  const all = unit.lessons.flatMap((l) => itemsWithIds(l)).filter((it) => it.t !== 'speak' && !(it.t === 'scramble' && it.a.includes('{')));
  const picked = shuffle(all, rnd).slice(0, size);
  return picked.map((it) => prepareItem(it, unit.id, who, keys, rnd));
}

/** Para a tela de revisão de gabarito da Camila. */
export function suggestedKeyItems() {
  const out: { unitId: number; lessonTitle: string; item: Ex & { id: string } }[] = [];
  for (const u of UNITS)
    for (const l of u.lessons)
      for (const it of itemsWithIds(l)) if (it.s) out.push({ unitId: u.id, lessonTitle: l.title, item: it as Ex & { id: string } });
  return out;
}

/** Prova da professora: exercícios que funcionam no app e no papel (sem fala e sem áudio). */
export const examFriendly = (it: Ex) => it.t !== 'speak' && it.t !== 'hear' && !(it.t === 'scramble' && it.a.includes('{'));

export function pickExamItems(unitIds: number[], size: number, rnd: () => number = Math.random): string[] {
  const pool = UNITS.filter((u) => unitIds.includes(u.id)).flatMap((u) => u.lessons.flatMap((l) => itemsWithIds(l))).filter(examFriendly);
  // espalha entre as units escolhidas
  const byUnit = unitIds.map((uid) => shuffle(pool.filter((it) => unitById(uid).lessons.some((l) => it.id!.startsWith(`${l.id}#`))), rnd));
  const out: string[] = [];
  for (let i = 0; out.length < Math.min(size, pool.length); i++) {
    const col = byUnit[i % byUnit.length];
    const nx = col.shift();
    if (nx && !out.includes(nx.id!)) out.push(nx.id!);
    if (byUnit.every((c) => !c.length)) break;
  }
  return out;
}

export function buildExam(itemIds: string[], who: Who, keys: KeyMap = {}, rnd: () => number = Math.random): Prepared[] {
  return itemIds.map((id) => itemById(id)).filter(Boolean).map((x) => prepareItem(x!.item, x!.unitId, who, keys, rnd));
}
