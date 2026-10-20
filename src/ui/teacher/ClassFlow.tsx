// Fluxo da aula: Iniciar aula (dia, horário e presença salvos sozinhos) → aula em andamento → Finalizar aula
// (o app traz as lições feitas na aula e a professora escreve a descrição e o próximo objetivo).
import { useState } from 'react';
import { useApp } from '../../state';
import { Avatar, Modal, toast, PresencePick } from '../common';
import type { ClassRecord, Modality, Presence } from '../../store/types';
import { uid } from '../../store/db';
import { dayKey } from '../../engine/game';
import { findLesson, refLabel, unitById } from '../../content';
import { lessonDone, bestQuiz } from '../kid/progress';
import { weakItems } from './stats';
import type { DB } from '../../store/types';
import { ThanksCard } from './ThanksCard';

/** Sugestões para o plano da aula: próximas lições da unit de cada aluno presente, lições onde mais erra e a provinha quando a unit acabou. */
export function suggestPlan(db: DB, studentIds: string[]) {
  const out: { id: string; why: string }[] = [];
  const add = (id: string, why: string) => { if (!out.some((x) => x.id === id)) out.push({ id, why }); };
  for (const sid of studentIds) {
    const s = db.students.find((x) => x.id === sid);
    if (!s) continue;
    const u = unitById(s.currentUnit);
    const todo = u.lessons.filter((l) => !lessonDone(db, sid, l.id));
    todo.slice(0, 3).forEach((l) => add(l.id, `próxima de ${s.name}`));
    if (!todo.length && !bestQuiz(db, sid, u.id)) add(`quiz-u${u.id}`, `${s.name} terminou a Unit ${u.id}`);
    weakItems(db, sid, 4).forEach((w) => add(w.id.split('#')[0], `${s.name} errou aqui`));
  }
  return out.slice(0, 7);
}
export const planLabel = (id: string) => (id.startsWith('quiz-u') ? `📝 Provinha da Unit ${id.slice(6)}` : findLesson(id)?.lesson.title ?? id);

const hhmm = (d = new Date()) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export function useActiveClass() {
  const { db } = useApp();
  return db.classes.find((c) => c.id === db.settings.activeClassId && c.status === 'aberta') ?? null;
}

export function StartClass({ onClose }: { onClose: () => void }) {
  const { db, update } = useApp();
  const students = db.students.filter((s) => !s.archived);
  const [att, setAtt] = useState<Record<string, Presence>>(Object.fromEntries(students.map((s) => [s.id, 'P' as Presence])));
  const [mod, setMod] = useState<Modality>('presencial');
  const sugg = suggestPlan(db, Object.keys(att).filter((k) => att[k] === 'P'));
  const [plan, setPlan] = useState<string[]>(sugg.slice(0, 3).map((x) => x.id));
  const start = () => {
    const c: ClassRecord = { id: uid(), date: dayKey(), start: hhmm(), startedAt: new Date().toISOString(), modality: mod, attendance: att, lessons: [], notes: '', nextGoal: '', status: 'aberta', plan };
    update((d) => ({ ...d, classes: [...d.classes, c], settings: { ...d.settings, activeClassId: c.id, noClassDays: (d.settings.noClassDays ?? []).filter((x) => x !== c.date) } }));
    toast(`Aula iniciada às ${c.start}.`);
    onClose();
  };
  return (
    <Modal label="Iniciar aula" onClose={onClose}>
      <h2>▶ Iniciar aula</h2>
      <p className="mute">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} · começa agora, às {hhmm()}.</p>
      <div className="field"><span className="lbl">Modalidade</span>
        <div className="seg"><button aria-pressed={mod === 'presencial'} onClick={() => setMod('presencial')}>🏫 Presencial</button><button aria-pressed={mod === 'online'} onClick={() => setMod('online')}>💻 Online</button></div>
      </div>
      <div className="field"><span className="lbl">Quem veio?</span>
        {students.map((s) => (
          <div key={s.id} className="row" style={{ justifyContent: 'space-between' }}>
            <span className="row"><Avatar s={s} size={34} /><b>{s.name}</b></span>
            <PresencePick value={att[s.id]} onChange={(p) => setAtt({ ...att, [s.id]: p })} />
          </div>
        ))}
      </div>
      {sugg.length > 0 && (
        <div className="field"><span className="lbl">Plano de hoje · sugestões do app (toque para tirar ou pôr)</span>
          <div className="lessonpick">
            {sugg.map((x) => <button key={x.id} aria-pressed={plan.includes(x.id)} onClick={() => setPlan(plan.includes(x.id) ? plan.filter((y) => y !== x.id) : [...plan, x.id])}>{planLabel(x.id)} <small>· {x.why}</small></button>)}
          </div>
        </div>
      )}
      <div className="row"><button className="btn ghost" onClick={onClose}>Cancelar</button><button className="btn blue grow" onClick={start}>Começar a aula</button></div>
    </Modal>
  );
}

export function FinishClass({ c, onClose, onDone }: { c: ClassRecord; onClose: () => void; onDone?: (c: ClassRecord) => void }) {
  const { db, update } = useApp();
  // lições feitas no modo aula desde que a aula começou
  const done = db.results.filter((r) => r.withTeacher && c.startedAt && r.at >= c.startedAt);
  const auto = Array.from(new Set(done.filter((r) => r.mode === 'lesson').map((r) => r.lessonId)));
  const quizzes = done.filter((r) => r.mode === 'quiz');
  const [notes, setNotes] = useState(c.notes);
  const [goal, setGoal] = useState(c.nextGoal);
  const [lessons, setLessons] = useState<string[]>(Array.from(new Set([...c.lessons, ...auto])));
  const [asGoal, setAsGoal] = useState(true);
  const finish = () => {
    const fin: ClassRecord = { ...c, notes: notes.trim(), nextGoal: goal.trim(), lessons, status: 'finalizada', end: hhmm() };
    update((d) => ({
      ...d,
      classes: d.classes.map((x) => (x.id === c.id ? fin : x)),
      settings: { ...d.settings, activeClassId: undefined },
      goals: asGoal && goal.trim()
        ? [...d.goals, ...Object.entries(c.attendance).filter(([, p]) => p === 'P').map(([sid]) => ({ id: uid(), studentId: sid, unitId: (lessons[0] && findLesson(lessons[0])?.unitId) || 1, text: goal.trim(), done: false, createdAt: new Date().toISOString() }))]
        : d.goals,
    }));
    toast('Aula finalizada e salva no calendário.');
    onClose();
    onDone?.(fin);
  };
  return (
    <Modal label="Finalizar aula" onClose={onClose}>
      <h2>■ Finalizar aula</h2>
      <p className="mute">Começou às {c.start} · termina agora, às {hhmm()} · {c.modality === 'online' ? '💻 online' : '🏫 presencial'}</p>
      <div className="field"><span className="lbl">O que foi feito na aula (o app marcou sozinho)</span>
        {lessons.length === 0 && <p className="small mute">Nenhuma lição feita no modo aula. Você pode descrever abaixo.</p>}
        <div className="lessonpick">
          {lessons.map((id) => { const f = findLesson(id); return f ? <button key={id} aria-pressed onClick={() => setLessons(lessons.filter((x) => x !== id))}>{f.lesson.title} · {refLabel(f.lesson.ref).replace('Apostila ', '')} ✕</button> : null; })}
        </div>
        {quizzes.length > 0 && <p className="small">📝 Provinhas na aula: {quizzes.map((q) => `${db.students.find((s) => s.id === q.studentId)?.name} · Unit ${q.unitId}: ${q.points} pts`).join(' · ')}</p>}
      </div>
      <div className="field"><label htmlFor="fn">Descrição da aula</label><textarea id="fn" className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: Anne leu Leo's First Day sozinha e acertou todos os cumprimentos. Ainda confunde evening e afternoon." /></div>
      <div className="field"><label htmlFor="fg">Próximo objetivo</label><input id="fg" className="input" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Ex.: Fazer o Homework da Unit 1 com os pais" /></div>
      <label className="row small"><input type="checkbox" checked={asGoal} onChange={() => setAsGoal(!asGoal)} /> Mostrar o próximo objetivo para os alunos no app</label>
      <div className="row"><button className="btn ghost" onClick={onClose}>Voltar para a aula</button><button className="btn blue grow" onClick={finish}>Finalizar e salvar</button></div>
    </Modal>
  );
}

/** Faixa que aparece enquanto a aula está acontecendo (na área da professora e na trilha do aluno). */
export function ClassBar({ compact }: { compact?: boolean }) {
  const c = useActiveClass();
  const { go } = useApp();
  const [fin, setFin] = useState(false);
  const [card, setCard] = useState<ClassRecord | null>(null);
  if (card) return <ThanksCard c={card} onClose={() => setCard(null)} />;
  if (!c) return null;
  return (
    <>
      <div className={`classbar${compact ? ' compact' : ''}`} role="status">
        <span className="dot" aria-hidden="true" />
        <b>Aula em andamento</b><span className="mute">desde {c.start}</span>
        {compact && <button className="btn sm ghost" style={{ marginLeft: 'auto', boxShadow: 'none' }} onClick={() => go({ name: 'teacher' })}>🏠 Meu menu</button>}
        <button className="btn sm red" style={{ marginLeft: compact ? 0 : 'auto', boxShadow: 'none' }} onClick={() => setFin(true)}>■ Finalizar aula</button>
      </div>
      {fin && <FinishClass c={c} onClose={() => setFin(false)} onDone={setCard} />}
    </>
  );
}
