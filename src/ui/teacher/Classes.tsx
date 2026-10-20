import { useState } from 'react';
import { useApp } from '../../state';
import { Avatar, Modal, fmtDate, toast, PresencePick } from '../common';
import type { ClassRecord, Presence } from '../../store/types';
import { uid } from '../../store/db';
import { UNITS, REVIEWS, findLesson, refLabel } from '../../content';
import { dayKey } from '../../engine/game';

export function Classes() {
  const { db } = useApp();
  const [edit, setEdit] = useState<ClassRecord | null>(null);
  const list = [...db.classes].sort((a, b) => b.date.localeCompare(a.date));
  const blank = (): ClassRecord => ({
    id: uid(), date: dayKey(), start: '', modality: 'presencial',
    attendance: Object.fromEntries(db.students.filter((s) => !s.archived).map((s) => [s.id, 'P' as Presence])),
    lessons: [], notes: '', nextGoal: '',
  });
  return (
    <>
      <div className="thead"><h1 className="grow">Diário de aula</h1><button className="btn yellow" onClick={() => setEdit(blank())}>+ Registrar aula</button></div>
      {list.length === 0 && <section className="card"><p className="mute">Nenhuma aula registrada. Registre a presença, as páginas da apostila trabalhadas e o próximo objetivo.</p></section>}
      <div className="col">
        {list.map((c) => {
          const pres = Object.entries(c.attendance);
          return (
            <button key={c.id} className="srow" onClick={() => setEdit(c)}>
              <div style={{ textAlign: 'center', minWidth: 58 }}>
                <b style={{ fontFamily: 'var(--f-display)', fontSize: 26, display: 'block', lineHeight: 1 }}>{c.date.slice(8)}</b>
                <span className="small mute">{new Date(c.date + 'T12:00').toLocaleDateString('pt-BR', { month: 'short' })}</span>
              </div>
              <div className="grow">
                <b>{c.lessons.map((l) => findLesson(l)?.lesson.title).filter(Boolean).join(' · ') || 'Aula'}</b>
                <p className="small mute">{c.modality === 'online' ? '💻 Online' : '🏫 Presencial'}{c.start ? ` · ${c.start}` : ''} · {pres.filter(([, p]) => p === 'P').length} presente(s), {pres.filter(([, p]) => p !== 'P').length} falta(s)</p>
                {c.nextGoal && <p className="small">🎯 {c.nextGoal}</p>}
              </div>
              <div className="row" style={{ gap: 4 }}>{pres.map(([sid, p]) => { const s = db.students.find((x) => x.id === sid); return s ? <span key={sid} style={{ opacity: p === 'P' ? 1 : 0.35 }}><Avatar s={s} size={30} /></span> : null; })}</div>
            </button>
          );
        })}
      </div>
      {edit && <ClassForm value={edit} onClose={() => setEdit(null)} />}
    </>
  );
}

export function ClassForm({ value, onClose }: { value: ClassRecord; onClose: () => void }) {
  const { db, update } = useApp();
  const [c, setC] = useState<ClassRecord>(value);
  const [unitView, setUnitView] = useState(() => {
    const first = value.lessons[0] && findLesson(value.lessons[0]);
    return first ? first.unitId : db.students[0]?.currentUnit ?? 1;
  });
  const [asGoal, setAsGoal] = useState(true);
  const students = db.students.filter((s) => !s.archived || c.attendance[s.id]);
  const exists = db.classes.some((x) => x.id === c.id);
  const unit = UNITS.find((u) => u.id === unitView)!;
  const lessons = [...unit.lessons, ...REVIEWS.filter((r) => r.afterUnit === unit.id).map((r) => r.lesson)];
  const toggle = (id: string) => setC({ ...c, lessons: c.lessons.includes(id) ? c.lessons.filter((x) => x !== id) : [...c.lessons, id] });

  const save = () => {
    update((d) => {
      const classes = exists ? d.classes.map((x) => (x.id === c.id ? c : x)) : [...d.classes, c];
      const goals = asGoal && c.nextGoal.trim() && !exists
        ? [...d.goals, ...Object.entries(c.attendance).map(([sid]) => ({ id: uid(), studentId: sid, unitId: unitView, text: c.nextGoal.trim(), done: false, createdAt: new Date().toISOString() }))]
        : d.goals;
      return { ...d, classes, goals };
    });
    toast('Aula salva.');
    onClose();
  };
  const del = () => { update((d) => ({ ...d, classes: d.classes.filter((x) => x.id !== c.id) })); onClose(); };

  return (
    <Modal label="Registrar aula" onClose={onClose}>
      <h2>{exists ? 'Aula de ' + fmtDate(c.date) : 'Registrar aula'}</h2>
      <div className="row wrap">
        <div className="field"><label htmlFor="cd">Data</label><input id="cd" type="date" className="input" value={c.date} onChange={(e) => setC({ ...c, date: e.target.value })} /></div>
        <div className="field" style={{ width: 120 }}><label htmlFor="ch">Horário</label><input id="ch" type="time" className="input" value={c.start ?? ''} onChange={(e) => setC({ ...c, start: e.target.value })} /></div>
        <div className="field grow"><span className="lbl">Modalidade</span>
          <div className="seg"><button aria-pressed={c.modality === 'presencial'} onClick={() => setC({ ...c, modality: 'presencial' })}>🏫 Presencial</button><button aria-pressed={c.modality === 'online'} onClick={() => setC({ ...c, modality: 'online' })}>💻 Online</button></div>
        </div>
      </div>

      <div className="field"><span className="lbl">Presença</span>
        {students.map((s) => (
          <div key={s.id} className="row" style={{ justifyContent: 'space-between' }}>
            <span className="row"><Avatar s={s} size={32} /><b>{s.name}</b></span>
            <PresencePick value={c.attendance[s.id]} onChange={(p) => setC({ ...c, attendance: { ...c.attendance, [s.id]: p } })} />
          </div>
        ))}
      </div>

      <div className="field"><span className="lbl">O que foi trabalhado na apostila</span>
        <select className="input" value={unitView} onChange={(e) => setUnitView(Number(e.target.value))}>{UNITS.map((u) => <option key={u.id} value={u.id}>Unit {u.id} · {u.title}</option>)}</select>
        <div className="lessonpick">{lessons.map((l) => <button key={l.id} aria-pressed={c.lessons.includes(l.id)} onClick={() => toggle(l.id)}>{l.title} · {l.ref.printed ? `p. ${l.ref.printed}` : 'folha'}</button>)}</div>
        {c.lessons.length > 0 && <p className="small mute">{c.lessons.map((l) => refLabel(findLesson(l)?.lesson.ref)).join(' · ')}</p>}
      </div>
      <div className="field"><label htmlFor="cn">Observações</label><textarea id="cn" className="input" value={c.notes} onChange={(e) => setC({ ...c, notes: e.target.value })} placeholder="Ex.: Anne leu a história sozinha. Confunde thirteen e thirty." /></div>
      <div className="field"><label htmlFor="cg">Próximo objetivo</label><input id="cg" className="input" value={c.nextGoal} onChange={(e) => setC({ ...c, nextGoal: e.target.value })} placeholder="Ex.: Fazer o Homework da Unit 2 com os pais" /></div>
      {!exists && <label className="row small"><input type="checkbox" checked={asGoal} onChange={() => setAsGoal(!asGoal)} /> Mostrar esse objetivo para as alunas no app</label>}
      <div className="row">
        {exists && <button className="btn red sm" onClick={del}>Apagar</button>}
        <span className="grow" />
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn navy" style={{ boxShadow: '0 5px 0 #171A45' }} onClick={save}>Salvar aula</button>
      </div>
    </Modal>
  );
}
