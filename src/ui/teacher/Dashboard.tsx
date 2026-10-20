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
import { StartClass, useActiveClass, FinishClass, planLabel } from './ClassFlow';
import { ThanksCard } from './ThanksCard';
import { Mascot } from '../Mascot';
import { TeacherAvatar } from './TeacherAvatar';

export function Dashboard({ open }: { open: (tab: string, sid?: string) => void }) {
  const { db, go, update } = useApp();
  const active = useActiveClass();
  const [starting, setStarting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [card, setCard] = useState<ClassRecord | null>(null);
  const students = db.students.filter((s) => !s.archived);
  const today = dayKey();
  const todayClass = db.classes.find((c) => c.date === today && c.status !== 'aberta');
  const noClass = (db.settings.noClassDays ?? []).includes(today);
  const recent = [...db.results].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
  const [form, setForm] = useState<ClassRecord | null>(null);
  const greeting = new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <>
      <div className="hero">
        <TeacherAvatar size={64} />
        <div className="grow">
          <div className="eyebrow">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <h1>{greeting}, {db.settings.teacherName}!</h1>
          <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
            <span className="hpill">👧 {students.length} {students.length === 1 ? 'aluno' : 'alunos'}</span>
            <span className="hpill">📅 {db.classes.filter((c) => c.date.slice(0, 7) === today.slice(0, 7)).length} aulas no mês</span>
            <span className="hpill">🏆 {(db.exams ?? []).length} no caderno de provas</span>
            <span className="hpill">✏️ {db.results.filter((r) => r.date === today).length} atividades hoje</span>
          </div>
        </div>
      </div>

      <section className="card today" style={{ borderColor: active ? '#19B98E' : 'var(--line)' }}>
        <Mascot size={90} mood={active ? 'happy' : 'listen'} />
        <div className="grow col" style={{ gap: 8 }}>
          {active ? (
            <>
              <h2>🟢 Aula em andamento desde {active.start}</h2>
              <p className="mute">{Object.values(active.attendance).filter((p) => p === 'P').length} presente(s) · {active.modality === 'online' ? 'online' : 'presencial'}. Abra a trilha do aluno: tudo fica liberado e o que ele fizer entra no registro da aula.</p>
              {(active.plan ?? []).length > 0 && (
                <div className="col" style={{ gap: 6 }}>
                  <span className="lbl">Plano de hoje</span>
                  <div className="lessonpick">
                    {active.plan!.map((id) => {
                      const sid = students.find((s) => active.attendance[s.id] === 'P')?.id;
                      const f = findLesson(id);
                      const done = sid && db.results.some((r) => r.studentId === sid && r.lessonId === id && active.startedAt && r.at >= active.startedAt);
                      return <button key={id} aria-pressed={!!done} disabled={!sid} onClick={() => sid && go(id.startsWith('quiz-u') ? { name: 'play', studentId: sid, unitId: Number(id.slice(6)), lessonId: id, mode: 'quiz', withTeacher: true } : { name: 'play', studentId: sid, unitId: f!.unitId, lessonId: id, mode: 'lesson', withTeacher: true })}>{done ? '✓ ' : '▶ '}{planLabel(id)}</button>;
                    })}
                  </div>
                </div>
              )}
              <div className="row wrap">
                {students.filter((s) => active.attendance[s.id] === 'P').map((s) => (
                  <button key={s.id} className="btn blue sm" onClick={() => go({ name: 'kid', studentId: s.id, withTeacher: true })}>▶ Trilha de {s.name}</button>
                ))}
                <button className="btn red sm" onClick={() => setFinishing(true)}>■ Finalizar aula</button>
              </div>
            </>
          ) : todayClass ? (
            <>
              <h2>✓ Aula de hoje registrada</h2>
              <p className="mute">{todayClass.start}{todayClass.end ? `–${todayClass.end}` : ''} · {(() => { const t = todayClass.lessons.map((l) => findLesson(l)?.lesson.title).filter(Boolean); return t.length ? `${t.slice(0, 5).join(', ')}${t.length > 5 ? ` e mais ${t.length - 5}` : ''}` : 'sem lições marcadas'; })()}</p>
              {todayClass.notes && <p className="small">“{todayClass.notes}”</p>}
              <div className="row wrap"><button className="btn wa sm" onClick={() => setCard(todayClass)}>💬 Card para os pais</button><button className="btn ghost sm" onClick={() => setForm(todayClass)}>Ver ou editar</button><button className="btn blue sm" onClick={() => setStarting(true)}>▶ Iniciar outra aula</button></div>
            </>
          ) : noClass ? (
            <>
              <h2>Hoje não tem aula</h2>
              <p className="mute">Os alunos podem praticar sozinhos no app.</p>
              <div className="row"><button className="btn blue sm" onClick={() => setStarting(true)}>▶ Tem aula sim, iniciar</button></div>
            </>
          ) : (
            <>
              <h2>Tem aula hoje?</h2>
              <p className="mute">Ao iniciar, o dia, o horário e a presença ficam salvos no calendário.</p>
              <div className="row wrap">
                <button className="btn blue" onClick={() => setStarting(true)}>▶ Iniciar aula</button>
                <button className="btn ghost" onClick={() => update((d) => ({ ...d, settings: { ...d.settings, noClassDays: [...(d.settings.noClassDays ?? []), today] } }))}>Hoje não tem aula</button>
              </div>
            </>
          )}
        </div>
      </section>
      {starting && <StartClass onClose={() => setStarting(false)} />}
      {finishing && active && <FinishClass c={active} onClose={() => setFinishing(false)} onDone={setCard} />}
      {card && <ThanksCard c={card} onClose={() => setCard(null)} />}

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
                <button className="btn navy sm" style={{ boxShadow: '0 3px 0 #000' }} onClick={() => go({ name: 'kid', studentId: s.id, withTeacher: true })}>▶ Trilha de {s.name} (modo aula)</button>
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
