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
