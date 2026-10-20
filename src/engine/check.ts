// Correção de respostas. Generosa com criança: ignora maiúsculas, pontuação, acentos e espaços.
import { stripAccents } from './personalize';

export function norm(s: string): string {
  return stripAccents(s)
    .toLowerCase()
    .replace(/[’`´]/g, "'")
    .replace(/\(a\)|\(o\)/g, '')
    .replace(/[^a-z0-9' ]/g, ' ')
    .replace(/\bi am\b/g, "i'm")
    .replace(/\bdo not\b/g, "don't")
    .replace(/\bwhat is\b/g, "what's")
    .replace(/\bit is\b/g, "it's")
    .replace(/\bthat is\b/g, "that's")
    .replace(/\byou are\b/g, "you're")
    .replace(/\bfavorite\b/g, 'favourite')
    .replace(/\bcolour\b/g, 'color')
    .replace(/\bmom\b/g, 'mum')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sameAnswer(given: string, expected: string, alt: string[] = []): boolean {
  const g = norm(given);
  return [expected, ...alt].some((e) => norm(e) === g);
}

/** Divide uma frase em peças (tiles) mantendo a pontuação grudada na palavra. */
export function tiles(sentence: string): string[] {
  return sentence.split(/\s+/).filter(Boolean);
}

/** Nota de fala: % de palavras esperadas que apareceram na transcrição. */
export function speechScore(heard: string, expected: string): number {
  const exp = norm(expected).split(' ').filter((w) => w && w !== '___');
  if (!exp.length) return 1;
  const got = new Set(norm(heard).split(' '));
  const hit = exp.filter((w) => got.has(w) || got.has(w.replace(/'/g, ''))).length;
  return hit / exp.length;
}

export function shuffle<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Palavras extras para o banco de palavras: sempre tiradas do próprio conteúdo da unit. */
export function distractors(answerTiles: string[], pool: string[], n = 3, rnd: () => number = Math.random): string[] {
  const used = new Set(answerTiles.map((t) => norm(t)));
  const cand = Array.from(new Set(pool.filter((w) => !used.has(norm(w)) && norm(w).length > 1)));
  return shuffle(cand, rnd).slice(0, n);
}
