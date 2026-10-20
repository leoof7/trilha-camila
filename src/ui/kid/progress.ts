import type { DB } from '../../store/types';
import { UNITS, REVIEWS, FUN_ZONE } from '../../content';
import { letter } from '../../engine/grade';

/** A unit abre quando a Camila liberou (unit atual) ou quando a provinha da unit anterior deu C ou mais. */
export function unitOpen(db: DB, studentId: string, unitId: number): boolean {
  const s = db.students.find((x) => x.id === studentId);
  if (!s) return false;
  if (unitId <= s.currentUnit) return true;
  const prevQuiz = db.grades.filter((g) => g.studentId === studentId && g.unitId === unitId - 1 && g.source === 'provinha');
  return prevQuiz.some((g) => letter(g.points, db.settings.scale) !== 'D') && unitOpen(db, studentId, unitId - 1);
}

export function lessonDone(db: DB, studentId: string, lessonId: string) {
  return db.results.some((r) => r.studentId === studentId && r.lessonId === lessonId && r.mode === 'lesson');
}

export function bestStars(db: DB, studentId: string, lessonId: string): number {
  return db.results.filter((r) => r.studentId === studentId && r.lessonId === lessonId && r.mode === 'lesson').reduce((a, r) => Math.max(a, r.stars), 0);
}

export function unitProgress(db: DB, studentId: string, unitId: number) {
  const u = UNITS.find((x) => x.id === unitId)!;
  const done = u.lessons.filter((l) => lessonDone(db, studentId, l.id)).length;
  return { done, total: u.lessons.length, pct: done / u.lessons.length };
}

export function bestQuiz(db: DB, studentId: string, unitId: number) {
  const gs = db.grades.filter((g) => g.studentId === studentId && g.unitId === unitId && g.source === 'provinha');
  return gs.length ? gs.reduce((a, b) => (b.points > a.points ? b : a)) : null;
}

/** Próxima lição sugerida (a primeira não feita, na ordem da apostila). */
export function nextLesson(db: DB, studentId: string): { unitId: number; lessonId: string } | null {
  for (const u of UNITS) {
    if (!unitOpen(db, studentId, u.id)) break;
    for (const l of u.lessons) if (!lessonDone(db, studentId, l.id)) return { unitId: u.id, lessonId: l.id };
    const rv = REVIEWS.find((r) => r.afterUnit === u.id);
    if (rv && !lessonDone(db, studentId, rv.lesson.id)) return { unitId: u.id, lessonId: rv.lesson.id };
  }
  if (!lessonDone(db, studentId, FUN_ZONE.id) && unitOpen(db, studentId, 11)) return { unitId: 11, lessonId: FUN_ZONE.id };
  return null;
}
