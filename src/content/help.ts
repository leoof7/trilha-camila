// Botão "Ajuda / Relembrar": junta o estudo com o exercício.
// A apostila não traz explicação de gramática; ela ensina por vocabulário, frases-modelo,
// histórias e dicas da professora. Então a ajuda mostra exatamente isso, tirado da própria apostila:
// a página, as palavras do vocabulário que aparecem no exercício e frases-exemplo das histórias.
import type { Ex, Vocab } from './types';
import { UNITS } from './index';
import { norm } from '../engine/check';

export interface Help { vocab: Vocab[]; examples: { who?: string; text: string; from: string }[]; tip?: string }

function words(s: string) {
  return norm(s).split(' ').filter((w) => w.length > 1);
}

export function helpFor(ex: Ex, unitId: number): Help {
  const unit = UNITS.find((u) => u.id === unitId) ?? UNITS[0];
  const texts: string[] = [];
  if ('a' in ex) texts.push(Array.isArray(ex.a) ? ex.a.join(' ') : String(ex.a));
  if ('q' in ex && ex.q) texts.push(String(ex.q));
  if (ex.t === 'match') ex.pairs.forEach((p) => texts.push(p[0], p[1]));
  if (ex.t === 'sort') ex.groups.forEach((g) => texts.push(g[1].join(' ')));
  if ((ex.t === 'fill' || ex.t === 'choice' || ex.t === 'pic' || ex.t === 'hear') && ex.opts) texts.push(ex.opts.join(' '));
  const key = new Set(texts.flatMap(words));
  const answerWords = new Set('a' in ex ? words(Array.isArray(ex.a) ? ex.a.join(' ') : String(ex.a)) : []);

  const vocab = unit.vocab
    .map((v) => ({ v, score: words(v.en).filter((w) => key.has(w)).length + words(v.pt).filter((w) => key.has(w)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.v);

  const examples: Help['examples'] = [];
  for (const l of unit.lessons) {
    if (!l.story) continue;
    for (const line of l.story.lines) {
      const lw = words(line.text);
      if (lw.some((w) => answerWords.has(w) && w.length > 2) || (answerWords.size <= 2 && lw.some((w) => answerWords.has(w)))) {
        examples.push({ who: line.who, text: line.text, from: l.story.title });
      }
    }
  }
  return { vocab: vocab.length ? vocab : unit.vocab.slice(0, 6), examples: examples.slice(0, 3), tip: unit.teacherTip };
}

/** Significado da palavra desembaralhada, tirado do vocabulário da apostila. */
export function meaningOf(word: string): string | undefined {
  const w = norm(word);
  // a Unit 4 (alfabeto) traduz a palavra pela letra ("Cat" → "C"); ela fica por último
  for (const u of [...UNITS.filter((x) => x.id !== 4), ...UNITS.filter((x) => x.id === 4)]) for (const v of u.vocab) {
    if (u.id === 4 && v.pt.trim().length <= 2) continue;
    if (norm(v.en) === w || norm(v.en).replace(/[^a-z ]/g, '').trim() === w) return u.id === 2 ? `o número ${v.pt}` : v.pt;
  }
  const extra: Record<string, string> = { hello: 'Olá!', bye: 'Tchau!', good: 'Bom / Boa (good morning)', thanks: 'Obrigado(a)!', notebook: 'caderno', tuesday: 'terça-feira', father: 'pai' };
  return extra[w];
}
