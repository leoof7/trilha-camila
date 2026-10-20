import { useState } from 'react';
import { useApp } from '../../state';
import { Avatar, LetterBadge, MONTHS_PT } from '../common';
import { dayKey } from '../../engine/game';
import { average } from '../../engine/grade';
import { ClassForm } from './Classes';
import type { ClassRecord, Presence } from '../../store/types';
import { uid } from '../../store/db';
import { attendance } from './stats';

const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function YearCalendar() {
  const { db, update } = useApp();
  const [year, setYear] = useState(db.settings.schoolYear);
  const [who, setWho] = useState<string>('all');
  const [edit, setEdit] = useState<ClassRecord | null>(null);
  const today = dayKey();
  const students = db.students.filter((s) => !s.archived);
  const byDate: Record<string, ClassRecord> = {};
  for (const c of db.classes) byDate[c.date] = c;
  const gradeDays = new Set(db.grades.filter((g) => who === 'all' || g.studentId === who).map((g) => g.date));

  const open = (date: string) => {
    const c = byDate[date];
    setEdit(c ?? { id: uid(), date, start: '', modality: 'presencial', attendance: Object.fromEntries(students.map((s) => [s.id, 'P' as Presence])), lessons: [], notes: '', nextGoal: '' });
  };

  const monthStats = (m: number) => {
    const key = `${year}-${String(m + 1).padStart(2, '0')}`;
    const cls = db.classes.filter((c) => c.date.startsWith(key));
    const faltas = cls.reduce((a, c) => a + Object.entries(c.attendance).filter(([sid, p]) => (who === 'all' || sid === who) && p !== 'P').length, 0);
    const gs = db.grades.filter((g) => g.date.startsWith(key) && (who === 'all' || g.studentId === who));
    return { aulas: cls.length, faltas, avg: average(gs.map((g) => g.points)) };
  };

  const sel = who === 'all' ? null : db.students.find((s) => s.id === who);
  const att = sel ? attendance(db, sel.id, year) : null;
  const yearGrades = db.grades.filter((g) => g.date.startsWith(String(year)) && (who === 'all' || g.studentId === who));
  const yearAvg = average(yearGrades.map((g) => g.points));
  const yearClasses = db.classes.filter((c) => c.date.startsWith(String(year))).length;

  return (
    <>
      <div className="thead">
        <div className="grow"><div className="eyebrow">Ano letivo</div><h1>Calendário {year}</h1></div>
        <div className="row">
          <button className="btn ghost sm" onClick={() => setYear(year - 1)} aria-label="Ano anterior">←</button>
          <button className="btn ghost sm" onClick={() => setYear(year + 1)} aria-label="Próximo ano">→</button>
          {year !== db.settings.schoolYear && <button className="link small" onClick={() => update((d) => ({ ...d, settings: { ...d.settings, schoolYear: year } }))}>Usar {year} como ano letivo</button>}
        </div>
      </div>

      <div className="row wrap">
        <div className="seg" style={{ maxWidth: 560 }}>
          <button aria-pressed={who === 'all'} onClick={() => setWho('all')}>Turma toda</button>
          {students.map((s) => <button key={s.id} aria-pressed={who === s.id} onClick={() => setWho(s.id)}>{s.name}</button>)}
        </div>
      </div>

      <div className="grid3">
        <section className="card stat"><b>{yearClasses}</b><span>Aulas no ano</span></section>
        {att && <section className="card stat"><b>{att.pct ?? '—'}{att.pct !== null ? '%' : ''}</b><span>Frequência de {sel!.name}</span></section>}
        <section className="card stat"><b>{att ? att.F + att.J : db.classes.filter((c) => c.date.startsWith(String(year))).reduce((a, c) => a + Object.values(c.attendance).filter((p) => p !== 'P').length, 0)}</b><span>Faltas</span></section>
        <section className="card stat">{yearAvg !== null ? <div className="row" style={{ gap: 8 }}><LetterBadge points={yearAvg} scale={db.settings.scale} sm /><b>{yearAvg}</b></div> : <b>—</b>}<span>Média de notas</span></section>
      </div>

      <div className="legend">
        <span><i style={{ background: '#EEF0FF' }} />Aula</span>
        {sel && <><span><i style={{ background: 'var(--ok-bg)' }} />Presente</span><span><i style={{ background: 'var(--bad-bg)' }} />Falta</span><span><i style={{ background: 'var(--warn-bg)' }} />Justificada</span></>}
        <span><i style={{ background: 'var(--navy)', borderRadius: '50%', width: 8, height: 8 }} />Online</span>
        <span><i style={{ background: '#8E6CF0', borderRadius: '50%', width: 8, height: 8 }} />Nota lançada</span>
        <span className="mute">Toque num dia para registrar ou ver a aula.</span>
      </div>

      <div className="year">
        {MONTHS_PT.map((mName, m) => {
          const first = new Date(year, m, 1).getDay();
          const days = new Date(year, m + 1, 0).getDate();
          const st = monthStats(m);
          return (
            <section key={m} className="month">
              <h4>{mName}<span>{st.aulas} aula{st.aulas === 1 ? '' : 's'} · {st.faltas} falta{st.faltas === 1 ? '' : 's'}{st.avg !== null ? ` · média ${st.avg}` : ''}</span></h4>
              <div className="mgrid">
                {DOW.map((d, i) => <span key={i} className="dow">{d}</span>)}
                {Array.from({ length: first }).map((_, i) => <span key={'e' + i} className="day empty" />)}
                {Array.from({ length: days }).map((_, i) => {
                  const date = `${year}-${String(m + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
                  const c = byDate[date];
                  const p = c && sel ? c.attendance[sel.id] : undefined;
                  const cls = ['day', c ? (p ? p : 'cls') : '', c?.modality === 'online' ? 'online' : '', date === today ? 'today' : '', gradeDays.has(date) ? 'grade' : ''].join(' ');
                  return <button key={date} className={cls} onClick={() => open(date)} aria-label={`${i + 1} de ${mName}${c ? ', aula' : ''}`}>{i + 1}</button>;
                })}
              </div>
            </section>
          );
        })}
      </div>
      {sel && (
        <section className="card">
          <div className="row"><Avatar s={sel} size={40} /><h3>Boletim de {sel.name} · {year}</h3></div>
          <div className="table-wrap"><table className="t">
            <thead><tr><th>Mês</th><th>Aulas</th><th>Faltas</th><th>Média</th></tr></thead>
            <tbody>{MONTHS_PT.map((mn, m) => { const st = monthStats(m); return st.aulas || st.avg !== null ? <tr key={m}><td>{mn}</td><td className="tnum">{st.aulas}</td><td className="tnum">{st.faltas}</td><td>{st.avg !== null ? <span className="row" style={{ gap: 6 }}><LetterBadge points={st.avg} scale={db.settings.scale} sm /> {st.avg}</span> : '—'}</td></tr> : null; })}</tbody>
          </table></div>
        </section>
      )}
      {edit && <ClassForm value={edit} onClose={() => setEdit(null)} />}
    </>
  );
}
