// Provas, Trabalhos, Notas e Faltas: as visões de "caderneta" da professora.
import { useState } from 'react';
import { useApp } from '../../state';
import { Avatar, LetterBadge, fmtDate, MONTHS_PT, toast, RefTag } from '../common';
import { UNITS } from '../../content';
import { bestQuiz, unitProgress, lessonDone } from '../kid/progress';
import { average, letter } from '../../engine/grade';
import { attendance } from './stats';
import { dayKey } from '../../engine/game';
import type { HomeworkMark } from '../../store/types';

/* ───────── Provas ───────── */
export function Exams() {
  const { db, go } = useApp();
  const students = db.students.filter((s) => !s.archived);
  return (
    <>
      <div className="thead"><div className="grow"><div className="eyebrow">Provinha de cada unit · sempre com a professora</div><h1>Provas</h1></div></div>
      <section className="card">
        <p className="small mute">Cada provinha tem 10 questões sorteadas da unit. Toque em <b>Aplicar</b> para abrir com o aluno no modo aula. Vale a melhor nota.</p>
        <div className="table-wrap"><table className="t">
          <thead><tr><th>Unit</th>{students.map((s) => <th key={s.id}><span className="row" style={{ gap: 6 }}><Avatar s={s} size={24} />{s.name}</span></th>)}</tr></thead>
          <tbody>{UNITS.map((u) => (
            <tr key={u.id}>
              <td><b style={{ color: u.color }}>Unit {u.id}</b> {u.title}</td>
              {students.map((s) => {
                const q = bestQuiz(db, s.id, u.id);
                const p = unitProgress(db, s.id, u.id);
                return (
                  <td key={s.id}>
                    <div className="row" style={{ gap: 6 }}>
                      {q ? <><LetterBadge points={q.points} scale={db.settings.scale} sm /><b className="tnum">{q.points}</b></> : <span className="small mute">{p.done}/{p.total} lições</span>}
                      <button className="chipbtn" onClick={() => go({ name: 'play', studentId: s.id, unitId: u.id, lessonId: `quiz-u${u.id}`, mode: 'quiz', withTeacher: true })}>{q ? 'Refazer' : 'Aplicar'}</button>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}</tbody>
        </table></div>
      </section>
    </>
  );
}

/* ───────── Trabalhos (homework) ───────── */
export function Homeworks() {
  const { db, update } = useApp();
  const students = db.students.filter((s) => !s.archived);
  const [sid, setSid] = useState(students[0]?.id ?? '');
  const marks = db.homework ?? [];
  const get = (unitId: number) => marks.find((m) => m.studentId === sid && m.unitId === unitId);
  const set = (unitId: number, patch: Partial<HomeworkMark>) =>
    update((d) => {
      const all = d.homework ?? [];
      const cur = all.find((m) => m.studentId === sid && m.unitId === unitId) ?? { studentId: sid, unitId, delivered: false, signed: false, stars: 0, date: dayKey() };
      return { ...d, homework: [...all.filter((m) => !(m.studentId === sid && m.unitId === unitId)), { ...cur, ...patch, date: dayKey() }] };
    });
  return (
    <>
      <div className="thead"><div className="grow"><div className="eyebrow">Homework de cada unit da apostila</div><h1>Trabalhos</h1></div></div>
      <div className="seg" style={{ maxWidth: 520 }}>{students.map((s) => <button key={s.id} aria-pressed={sid === s.id} onClick={() => setSid(s.id)}>{s.name}</button>)}</div>
      <div className="col">
        {UNITS.map((u) => {
          const hw = u.lessons.find((l) => l.kind === 'homework')!;
          const m = get(u.id);
          const app = lessonDone(db, sid, hw.id);
          return (
            <section key={u.id} className="card hwrow" style={{ borderLeft: `6px solid ${u.color}` }}>
              <div className="grow">
                <b>Unit {u.id} · {u.title}</b>
                <div className="row wrap" style={{ gap: 6, marginTop: 4 }}><RefTag r={hw.ref} /><span className={`pill ${app ? 'p-ok' : 'p-away'}`}>{app ? '✓ feito no app' : 'não feito no app'}</span></div>
              </div>
              <label className="row small"><input type="checkbox" checked={!!m?.delivered} onChange={() => set(u.id, { delivered: !m?.delivered })} /> Entregou a folha</label>
              <label className="row small"><input type="checkbox" checked={!!m?.signed} onChange={() => set(u.id, { signed: !m?.signed })} /> Assinatura dos pais</label>
              <div className="stars5">{[1, 2, 3, 4, 5].map((n) => <button key={n} className={n <= (m?.stars ?? 0) ? 'on' : ''} onClick={() => { set(u.id, { stars: n }); toast('Salvo.'); }} aria-label={`${n} estrelas`}>⭐</button>)}</div>
            </section>
          );
        })}
      </div>
    </>
  );
}

/* ───────── Notas (quadro geral) ───────── */
export function GradesBoard() {
  const { db } = useApp();
  const students = db.students.filter((s) => !s.archived);
  return (
    <>
      <div className="thead"><div className="grow"><div className="eyebrow">A ≥ {db.settings.scale.A} · B ≥ {db.settings.scale.B} · C ≥ {db.settings.scale.C} · D abaixo</div><h1>Notas</h1></div></div>
      <section className="card">
        <div className="table-wrap"><table className="t">
          <thead><tr><th>Aluno</th>{UNITS.map((u) => <th key={u.id} style={{ color: u.color }}>U{u.id}</th>)}<th>Outras</th><th>Média</th></tr></thead>
          <tbody>{students.map((s) => {
            const gs = db.grades.filter((g) => g.studentId === s.id);
            const others = gs.filter((g) => g.source !== 'provinha');
            const avg = average(gs.map((g) => g.points));
            return (
              <tr key={s.id}>
                <td><span className="row" style={{ gap: 6 }}><Avatar s={s} size={28} /><b>{s.name}</b></span></td>
                {UNITS.map((u) => { const q = bestQuiz(db, s.id, u.id); return <td key={u.id}>{q ? <span title={`${q.points} pontos`}><LetterBadge points={q.points} scale={db.settings.scale} sm /></span> : <span className="mute">·</span>}</td>; })}
                <td className="small">{others.length ? others.map((g) => `${g.title}: ${g.points}`).join(' · ') : '—'}</td>
                <td>{avg !== null ? <span className="row" style={{ gap: 6 }}><LetterBadge points={avg} scale={db.settings.scale} sm /><b>{avg}</b></span> : '—'}</td>
              </tr>
            );
          })}</tbody>
        </table></div>
        <p className="small mute">Para lançar nota de avaliação ou de trabalho, abra a ficha do aluno → Notas.</p>
      </section>
    </>
  );
}

/* ───────── Faltas ───────── */
export function Absences() {
  const { db, update } = useApp();
  const students = db.students.filter((s) => !s.archived);
  const year = db.settings.schoolYear;
  const classes = db.classes.filter((c) => c.date.startsWith(String(year))).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <div className="thead"><div className="grow"><div className="eyebrow">Ano letivo {year}</div><h1>Faltas</h1></div></div>
      <div className="grid3">
        {students.map((s) => { const a = attendance(db, s.id, year); return (
          <section key={s.id} className="card"><div className="row"><Avatar s={s} size={40} /><h3 className="grow">{s.name}</h3><b className="tnum" style={{ fontSize: 24 }}>{a.pct ?? '—'}{a.pct !== null ? '%' : ''}</b></div>
            <p className="small mute">{a.total} aulas · {a.P} presenças · {a.F} faltas · {a.J} justificadas</p></section>
        ); })}
      </div>
      <section className="card">
        <h3>Mês a mês</h3>
        <div className="table-wrap"><table className="t">
          <thead><tr><th>Aluno</th>{MONTHS_PT.map((m) => <th key={m}>{m.slice(0, 3)}</th>)}</tr></thead>
          <tbody>{students.map((s) => (
            <tr key={s.id}><td><b>{s.name}</b></td>{MONTHS_PT.map((_, i) => {
              const k = `${year}-${String(i + 1).padStart(2, '0')}`;
              const f = db.classes.filter((c) => c.date.startsWith(k) && c.attendance[s.id] && c.attendance[s.id] !== 'P').length;
              const t = db.classes.filter((c) => c.date.startsWith(k) && c.attendance[s.id]).length;
              return <td key={i} className="tnum">{t ? <span style={{ color: f ? 'var(--bad)' : 'var(--ok)', fontWeight: 800 }}>{f}/{t}</span> : <span className="mute">·</span>}</td>;
            })}</tr>
          ))}</tbody>
        </table></div>
        <p className="small mute">Número de faltas / aulas no mês.</p>
      </section>
      <section className="card">
        <h3>Corrigir presença</h3>
        {classes.length === 0 && <p className="mute">Nenhuma aula registrada ainda.</p>}
        {classes.slice(0, 20).map((c) => (
          <div key={c.id} className="row wrap" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBlock: 6 }}>
            <b className="tnum">{fmtDate(c.date)}</b>
            {students.filter((s) => c.attendance[s.id]).map((s) => (
              <span key={s.id} className="row" style={{ gap: 6 }}><span className="small">{s.name}</span>
                <span className="presence">{(['P', 'F', 'J'] as const).map((p) => <button key={p} className={p} aria-pressed={c.attendance[s.id] === p} onClick={() => update((d) => ({ ...d, classes: d.classes.map((x) => (x.id === c.id ? { ...x, attendance: { ...x.attendance, [s.id]: p } } : x)) }))}>{p}</button>)}</span>
              </span>
            ))}
          </div>
        ))}
        <p className="small mute">P = presente · F = falta · J = falta justificada.</p>
      </section>
    </>
  );
}

export { letter };
