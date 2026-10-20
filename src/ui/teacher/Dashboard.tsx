import { useApp, studentXp } from '../../state';
import { Avatar, LetterBadge, fmtDate } from '../common';
import { attendance, gradeAvg, statusOf } from './stats';
import { unitById, findLesson } from '../../content';
import { unitProgress, bestQuiz } from '../kid/progress';
import { dayKey } from '../../engine/game';
import { useState } from 'react';
import { ClassForm } from './Classes';
import { uid } from '../../store/db';
import type { ClassRecord, Presence } from '../../store/types';

export function Dashboard({ open }: { open: (tab: string, sid?: string) => void }) {
  const { db, go } = useApp();
  const students = db.students.filter((s) => !s.archived);
  const today = dayKey();
  const todayClass = db.classes.find((c) => c.date === today);
  const recent = [...db.results].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
  const [form, setForm] = useState<ClassRecord | null>(null);
  const newClass = (): ClassRecord => todayClass ?? { id: uid(), date: today, start: '', modality: 'presencial', attendance: Object.fromEntries(students.map((s) => [s.id, 'P' as Presence])), lessons: [], notes: '', nextGoal: '' };
  const greeting = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <>
      <div className="thead">
        <div className="grow">
          <div className="eyebrow">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <h1>{greeting}, {db.settings.teacherName}!</h1>
        </div>
        <button className="btn yellow" onClick={() => setForm(newClass())}>{todayClass ? 'Ver aula de hoje' : '+ Registrar aula de hoje'}</button>
      </div>

      <div className="grid2">
        {students.map((s) => {
          const st = statusOf(db, s.id);
          const prog = unitProgress(db, s.id, s.currentUnit);
          const unit = unitById(s.currentUnit);
          const avg = gradeAvg(db, s.id);
          const att = attendance(db, s.id, db.settings.schoolYear);
          const quiz = bestQuiz(db, s.id, s.currentUnit);
          const goal = db.goals.filter((g) => g.studentId === s.id && !g.done).slice(-1)[0];
          return (
            <section key={s.id} className="card">
              <div className="row">
                <Avatar s={s} size={56} />
                <div className="grow">
                  <h3>{s.name}, {s.age} anos</h3>
                  <p className="small mute">Unit {unit.id} · {unit.title} · {studentXp(db, s.id)} XP</p>
                </div>
                <span className={`pill p-${st.s}`}>{st.label}</span>
              </div>
              <div className="col" style={{ gap: 6 }}>
                <div className="row small" style={{ justifyContent: 'space-between' }}><b>Unit {unit.id}: {prog.done} de {prog.total} lições</b>{quiz && <span>Provinha: {quiz.points} pts</span>}</div>
                <div className="mini"><i style={{ width: `${prog.pct * 100}%`, background: unit.color }} /></div>
              </div>
              <div className="grid3" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div className="stat">{avg !== null ? <div className="row" style={{ gap: 6 }}><LetterBadge points={avg} scale={db.settings.scale} sm /><b>{avg}</b></div> : <b>—</b>}<span>Média</span></div>
                <div className="stat"><b>{att.pct !== null ? `${att.pct}%` : '—'}</b><span>Frequência</span></div>
                <div className="stat"><b>{att.F}</b><span>Faltas</span></div>
              </div>
              {goal && <p className="small">🎯 <b>Próximo objetivo:</b> {goal.text}</p>}
              {prog.done === prog.total && quiz && s.currentUnit < 11 && <p className="small" style={{ color: 'var(--ok)', fontWeight: 800 }}>✓ Terminou a Unit {s.currentUnit}. Pronta para a Unit {s.currentUnit + 1}!</p>}
              <div className="row wrap">
                <button className="btn navy sm" style={{ boxShadow: '0 3px 0 #171A45' }} onClick={() => go({ name: 'kid', studentId: s.id, withTeacher: true })}>▶ Abrir aula com {s.name}</button>
                <button className="btn ghost sm" onClick={() => open('student', s.id)}>Ficha de {s.name}</button>
              </div>
            </section>
          );
        })}
        {students.length === 0 && (
          <section className="card"><h3>Nenhum aluno ainda</h3><button className="btn navy" onClick={() => open('students')}>Cadastrar aluno</button></section>
        )}
      </div>

      <section className="card">
        <h3>Atividade recente no app</h3>
        {recent.length === 0 ? <p className="mute">Quando a aluna fizer lições, elas aparecem aqui.</p> : (
          <div className="table-wrap">
            <table className="t">
              <thead><tr><th>Data</th><th>Aluno</th><th>Atividade</th><th>Pontos</th><th>Com você?</th></tr></thead>
              <tbody>
                {recent.map((r) => {
                  const st = db.students.find((x) => x.id === r.studentId);
                  const title = r.mode === 'quiz' ? `Provinha · Unit ${r.unitId}` : findLesson(r.lessonId)?.lesson.title ?? r.lessonId;
                  return (
                    <tr key={r.id}><td className="tnum">{fmtDate(r.date)}</td><td>{st?.name}</td><td>{title}</td><td className="tnum"><b>{r.points}</b> {'⭐'.repeat(r.stars)}</td><td>{r.withTeacher ? 'Na aula' : 'Sozinha'}</td></tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {form && <ClassForm value={form} onClose={() => setForm(null)} />}
    </>
  );
}
