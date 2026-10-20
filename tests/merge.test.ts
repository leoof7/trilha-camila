import { describe, it, expect } from 'vitest';
import { mergeDB, tomb, draftTomb } from '../src/store/merge';
import { emptyDB } from '../src/store/db';
import type { LessonResult } from '../src/store/types';

const res = (id: string, studentId = 's', points = 100): LessonResult => ({ id, studentId, lessonId: 'u1-vocab', unitId: 1, mode: 'lesson', date: '2026-10-20', at: '2026-10-20T10:00:00Z', total: 5, correctFirst: 5, mistakes: 0, points, xp: 10, stars: 3, seconds: 30, missed: [] });

describe('sincronização entre aparelhos', () => {
  it('soma o que cada aparelho fez, sem perder nada', () => {
    const pc = { ...emptyDB(), results: [res('a')] };
    const cel = { ...emptyDB(), results: [res('b')] };
    expect(mergeDB(pc, cel).results.map((r) => r.id).sort()).toEqual(['a', 'b']);
  });
  it('no mesmo item, vale o lado preferido', () => {
    const a = { ...emptyDB(), results: [res('x', 's', 50)] };
    const b = { ...emptyDB(), results: [res('x', 's', 90)] };
    expect(mergeDB(a, b).results[0].points).toBe(90);
  });
  it('o que foi apagado de propósito não volta', () => {
    const velho = { ...emptyDB(), grades: [{ id: 'g', studentId: 's', date: '', title: 'T', points: 80, source: 'manual' as const }] };
    const novo = tomb({ ...emptyDB(), grades: [] }, 'g');
    expect(mergeDB(velho, novo).grades).toEqual([]);
    expect(mergeDB(novo, velho).grades).toEqual([]);
  });
  it('lição terminada não volta a pedir "continuar"', () => {
    const d = { queue: ['q'], idx: 1, hearts: 5, firstTry: {}, missed: [], mistakes: 0, at: 'T1' };
    const velho = { ...emptyDB(), drafts: { 's:u1-vocab': d } };
    const novo = tomb({ ...emptyDB(), drafts: {} }, draftTomb('s:u1-vocab', 'T1'));
    expect(mergeDB(velho, novo).drafts).toEqual({});
  });
  it('dias de estudo somam', () => {
    const a = { ...emptyDB(), studyDays: { s: ['2026-10-19'] } };
    const b = { ...emptyDB(), studyDays: { s: ['2026-10-20'] } };
    expect(mergeDB(a, b).studyDays.s).toEqual(['2026-10-19', '2026-10-20']);
  });
});
