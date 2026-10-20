import type { DB } from '../../store/types';
import { average } from '../../engine/grade';
import { studentStatus } from '../../engine/game';
import { itemsWithIds, allLessons, refLabel } from '../../content';
import { personalize } from '../../engine/personalize';

export function attendance(db: DB, studentId: string, year?: number) {
  const cls = db.classes.filter((c) => c.attendance[studentId] && (!year || c.date.startsWith(String(year))));
  const P = cls.filter((c) => c.attendance[studentId] === 'P').length;
  const F = cls.filter((c) => c.attendance[studentId] === 'F').length;
  const J = cls.filter((c) => c.attendance[studentId] === 'J').length;
  const total = cls.length;
  return { total, P, F, J, pct: total ? Math.round((P / total) * 100) : null };
}

export function gradeAvg(db: DB, studentId: string) {
  return average(db.grades.filter((g) => g.studentId === studentId).map((g) => g.points));
}

export function statusOf(db: DB, studentId: string) {
  const rs = db.results.filter((r) => r.studentId === studentId).sort((a, b) => a.at.localeCompare(b.at));
  const last = rs.length ? rs[rs.length - 1].date : null;
  return studentStatus(last, rs.map((r) => r.correctFirst / Math.max(1, r.total)));
}

/** Itens que o aluno mais erra, com texto e página da apostila. */
export function weakItems(db: DB, studentId: string, limit = 8) {
  const s = db.students.find((x) => x.id === studentId)!;
  const count: Record<string, number> = {};
  for (const r of db.results.filter((r) => r.studentId === studentId)) for (const id of r.missed) count[id] = (count[id] ?? 0) + 1;
  const index: Record<string, { text: string; ref: string }> = {};
  for (const { lesson } of allLessons())
    for (const it of itemsWithIds(lesson)) {
      let text = '';
      if (it.t === 'match') text = it.pairs.map((p) => p[0]).join(' · ');
      else if (it.t === 'build') text = `${it.q} → ${it.a}`;
      else if (it.t === 'order' || it.t === 'sort') text = it.q;
      else if ('q' in it && it.q) text = `${it.q} → ${'a' in it ? it.a : ''}`;
      else if ('a' in it) text = String(it.a);
      index[it.id!] = { text: personalize(text, s), ref: refLabel(it.ref) };
    }
  return Object.entries(count)
    .filter(([id]) => index[id])
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, n]) => ({ id, n, ...index[id] }));
}
