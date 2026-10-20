import { NUMBER_WORDS } from '../content';

const PT_NUMBERS = ['um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte'];

export interface Who { name: string; age: number }

/** Troca {name}, {NAME}, {age}, {agePt}, {initial}, {spelled} pelos dados do aluno. */
export function personalize(text: string, who: Who): string {
  const name = (who.name || 'Leo').trim().split(/\s+/)[0];
  const age = who.age >= 1 && who.age <= 20 ? NUMBER_WORDS[who.age - 1] : String(who.age);
  const agePt = who.age >= 1 && who.age <= 20 ? PT_NUMBERS[who.age - 1] : String(who.age);
  return text
    .replace(/\{name\}/g, name)
    .replace(/\{NAME\}/g, stripAccents(name).toUpperCase())
    .replace(/\{age\}/g, age)
    .replace(/\{agePt\}/g, agePt)
    .replace(/\{initial\}/g, stripAccents(name)[0]?.toUpperCase() ?? 'A')
    .replace(/\{spelled\}/g, stripAccents(name).toUpperCase().split('').join(' - '));
}

export function stripAccents(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Aplica personalize em todos os campos de texto de um exercício. */
export function personalizeDeep<T>(obj: T, who: Who): T {
  if (typeof obj === 'string') return personalize(obj, who) as unknown as T;
  if (Array.isArray(obj)) return obj.map((x) => personalizeDeep(x, who)) as unknown as T;
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = k === 'id' || k === 'ref' ? v : personalizeDeep(v, who);
    return out as T;
  }
  return obj;
}
