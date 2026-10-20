// Valida o conteúdo da apostila: nenhuma lição quebrada chega na criança.
import { describe, it, expect } from 'vitest';
import { UNITS, allLessons, itemsWithIds } from '../src/content';
import { prepareLesson } from '../src/engine/session';
import { sameAnswer } from '../src/engine/check';

const anne = { name: 'Anne', age: 9 };

describe('conteúdo da apostila', () => {
  it('tem as 11 units da apostila, em ordem', () => {
    expect(UNITS.map((u) => u.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('toda lição aponta para uma página real da apostila (1–52)', () => {
    for (const { lesson } of allLessons()) {
      for (const it of itemsWithIds(lesson)) {
        expect(it.ref!.pdf, it.id).toBeGreaterThanOrEqual(1);
        expect(it.ref!.pdf, it.id).toBeLessThanOrEqual(52);
        expect(it.ref!.section.length, it.id).toBeGreaterThan(0);
      }
    }
  });

  it('toda lição tem pelo menos 3 exercícios', () => {
    for (const { lesson } of allLessons()) expect(lesson.items.length, lesson.id).toBeGreaterThanOrEqual(3);
  });

  it('em fill/choice/hear/pic a resposta certa está entre as opções', () => {
    for (const { lesson } of allLessons())
      for (const it of itemsWithIds(lesson))
        if ((it.t === 'fill' || it.t === 'choice' || it.t === 'hear' || it.t === 'pic') && it.opts)
          expect(it.opts, it.id).toContain(it.a);
  });

  it('match tem pares sem repetição do lado esquerdo', () => {
    for (const { lesson } of allLessons())
      for (const it of itemsWithIds(lesson))
        if (it.t === 'match') {
          const left = it.pairs.map((p) => p[0]);
          expect(new Set(left).size, it.id).toBe(left.length);
          expect(it.pairs.length, it.id).toBeGreaterThanOrEqual(3);
          for (const [a, b] of it.pairs) expect(a.toLowerCase(), `${it.id}: par igual dos dois lados (${a})`).not.toBe(b.toLowerCase());
        }
  });

  it('banco de palavras sempre contém todas as peças da resposta', () => {
    for (const { unitId, lesson } of allLessons()) {
      const prepared = prepareLesson(lesson, unitId, anne);
      for (const p of prepared)
        if (p.t === 'build') {
          const bank = [...p.bank!];
          for (const w of p.a.split(/\s+/)) {
            const i = bank.indexOf(w);
            expect(i, `${p.id}: falta "${w}"`).toBeGreaterThanOrEqual(0);
            bank.splice(i, 1);
          }
        }
    }
  });

  it('nome e idade da aluna entram onde a apostila pede (sem sobrar {chaves})', () => {
    for (const { unitId, lesson } of allLessons()) {
      const txt = JSON.stringify(prepareLesson(lesson, unitId, anne));
      expect(txt, lesson.id).not.toMatch(/\{(name|NAME|age|agePt|initial|spelled)\}/);
    }
    const u1 = prepareLesson(UNITS[0].lessons[0], 1, anne);
    expect(u1.some((p) => p.t === 'build' && p.a === 'My name is Anne.')).toBe(true);
  });

  it('a resposta montada com as peças certas é aceita', () => {
    for (const { unitId, lesson } of allLessons())
      for (const p of prepareLesson(lesson, unitId, anne))
        if (p.t === 'build') expect(sameAnswer(p.a.split(/\s+/).join(' '), p.a, p.alt), p.id).toBe(true);
  });
});

import { askFor } from '../src/content/instructions';
describe('enunciados em inglês e português', () => {
  it('todo exercício tem pergunta clara nas duas línguas (sem cair no texto genérico)', () => {
    for (const { unitId, lesson } of allLessons())
      for (const it of itemsWithIds(lesson)) {
        const a = askFor(it, unitId);
        expect(a.en.length, it.id).toBeGreaterThan(3);
        expect(a.pt.length, it.id).toBeGreaterThan(8);
        if (it.t === 'choice') expect(a.pt, `${it.id}: falta tradução de "${it.q}"`).not.toBe('Escolha a resposta certa.');
        if (it.t === 'pic' && it.q) expect(a.pt, it.id).not.toBe('Toque na resposta certa.');
      }
  });
});

import { pickExamItems, buildExam, examFriendly } from '../src/engine/session';
import { itemById } from '../src/content';
describe('prova da professora', () => {
  it('sorteia só das units escolhidas, sem repetir, sem fala nem áudio', () => {
    const ids = pickExamItems([2, 5], 12);
    expect(ids.length).toBe(12);
    expect(new Set(ids).size).toBe(12);
    for (const id of ids) {
      const f = itemById(id)!;
      expect([2, 5]).toContain(f.unitId);
      expect(examFriendly(f.item)).toBe(true);
    }
    expect(ids.some((id) => itemById(id)!.unitId === 2) && ids.some((id) => itemById(id)!.unitId === 5)).toBe(true);
  });
  it('monta os exercícios com o nome do aluno', () => {
    const ex = buildExam(pickExamItems([1], 8), { name: 'Anne', age: 9 });
    expect(ex.length).toBe(8);
    expect(JSON.stringify(ex)).not.toContain('{name}');
  });
});

import { meaningOf } from '../src/content/help';
import { findLesson, itemsWithIds as iw } from '../src/content';
describe('revisão módulo a módulo (20/10)', () => {
  it('"desembaralhe" mostra o significado da palavra, nunca só a letra', () => {
    expect(meaningOf('CAT')).toBe('gato');
    expect(meaningOf('ZEBRA')).not.toBe('Z');
    expect(meaningOf('PENCIL')).toBe('lápis');
  });
  it('PENCIL não pede "soletre o seu nome"; os itens do nome pedem', () => {
    const p = iw(findLesson('u8-practice')!.lesson).find((x) => x.t === 'scramble' && x.a === 'PENCIL')!;
    expect(askFor(p, 8).en).toBe('Unscramble the letters!');
    const n = iw(findLesson('u4-homework')!.lesson).find((x) => x.t === 'scramble')!;
    expect(askFor({ ...n, a: 'ANNE' } as typeof n, 4).en).toBe('Spell your name!');
  });
  it('exercício de situação usa o enunciado da apostila e mostra a situação num cartão', () => {
    const it0 = iw(findLesson('u7-homework')!.lesson)[0];
    const a = askFor(it0, 7);
    expect(a.en).toContain('How many of each body part');
    expect(a.scene?.en).toBe('fingers on both hands');
  });
  it('na revisão, figura de cor pergunta a cor (e não "Who is it?")', () => {
    const rv = findLesson('review-1')!.lesson;
    for (const x of iw(rv)) if (x.t === 'pic' && !x.q && ['blue', 'red', 'green', 'orange'].includes(x.a)) expect(askFor(x, 5).en).toBe('What color is it?');
  });
  it('nenhum título de exercício termina com dois-pontos', () => {
    for (const { lesson, unitId } of allLessons())
      for (const x of iw(lesson)) expect(askFor(x, unitId).en.trim().endsWith(':')).toBe(false);
  });
});
describe('frase com instrução na frente', () => {
  it('separa a instrução da frase para traduzir', async () => {
    const { splitLead } = await import('../src/content/instructions');
    expect(splitLead('Escreva sua apresentação: Meu nome é Anne.')).toEqual({ lead: 'Escreva sua apresentação', text: 'Meu nome é Anne.' });
    expect(splitLead('Write a sentence with "is": Minha mochila é azul.').text).toBe('Minha mochila é azul.');
    expect(splitLead('Bom dia!')).toEqual({ text: 'Bom dia!' });
  });
});
