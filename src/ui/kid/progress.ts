import type { DB } from '../../store/types';
import { UNITS, REVIEWS, FUN_ZONE } from '../../content';

/** Tudo liberado: como no livro, a criança e a professora abrem qualquer capítulo a qualquer hora.
 *  (A provinha continua sendo só com a professora.) */
export function unitOpen(_db: DB, _studentId: string, _unitId: number): boolean {
  return true;
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
/** Próxima lição sugerida: continua o capítulo em que a criança mexeu por último (tudo é livre,
 *  então ela pode ter pulado para outro); se ele acabou, segue a ordem da apostila a partir dali. */
export function nextLesson(db: DB, studentId: string): { unitId: number; lessonId: string } | null {
  const last = db.results.filter((r) => r.studentId === studentId && r.mode === 'lesson').sort((a, b) => b.at.localeCompare(a.at))[0];
  const startIdx = Math.max(0, UNITS.findIndex((u) => u.id === last?.unitId));
  const order = [...UNITS.slice(startIdx), ...UNITS.slice(0, startIdx)];
  for (const u of order) {
    for (const l of u.lessons) if (!lessonDone(db, studentId, l.id)) return { unitId: u.id, lessonId: l.id };
    const rv = REVIEWS.find((r) => r.afterUnit === u.id);
    if (rv && !lessonDone(db, studentId, rv.lesson.id)) return { unitId: u.id, lessonId: rv.lesson.id };
  }
  if (!lessonDone(db, studentId, FUN_ZONE.id)) return { unitId: 11, lessonId: FUN_ZONE.id };
  return null;
}
