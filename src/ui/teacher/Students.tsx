import { useState } from 'react';
import { useApp, studentXp } from '../../state';
import { Avatar, LetterBadge, Modal, fmtDate, toast } from '../common';
import { StudentFields, GuardiansFields } from '../Profiles';
import type { Student, Gender, Guardian } from '../../store/types';
import { uid } from '../../store/db';
import { UNITS, unitById, KIND_LABEL, findLesson } from '../../content';
import { attendance, gradeAvg, statusOf, weakItems } from './stats';
import { bestQuiz, bestStars, lessonDone, unitProgress } from '../kid/progress';
import { STICKERS, dayKey } from '../../engine/game';
import { letter } from '../../engine/grade';

export const aluno = (s: { gender: Gender }) => (s.gender === 'm' ? 'aluno' : 'aluna');

export function Students({ open }: { open: (tab: string, sid?: string) => void }) {
  const { db, update } = useApp();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Partial<Student>>({ gender: 'f', currentUnit: 1 });
  const [fam, setFam] = useState<Guardian[]>([{ role: 'mae', name: '', phone: '' }, { role: 'pai', name: '', phone: '' }]);
  const [err, setErr] = useState('');
  const save = () => {
    if (!draft.name?.trim()) return setErr('Escreva o nome.');
    if (!draft.age) return setErr('Coloque a idade.');
    const s: Student = { id: uid(), name: draft.name.trim(), age: draft.age, gender: draft.gender as Gender, photo: draft.photo, guardians: fam.filter((g) => g.name.trim()), currentUnit: draft.currentUnit ?? 1, createdAt: new Date().toISOString() };
    update((d) => ({ ...d, students: [...d.students, s] }));
    setAdding(false); setDraft({ gender: 'f', currentUnit: 1 }); setErr('');
    toast(`${s.name} cadastrad${s.gender === 'm' ? 'o' : 'a'}!`);
  };
  return (
    <>
      <div className="thead"><h1 className="grow">Alunos</h1><button className="btn yellow" onClick={() => setAdding(true)}>+ Novo aluno</button></div>
      <div className="col">
        {db.students.filter((s) => !s.archived).map((s) => {
          const st = statusOf(db, s.id);
          const avg = gradeAvg(db, s.id);
          const att = attendance(db, s.id, db.settings.schoolYear);
          return (
            <button key={s.id} className="srow" onClick={() => open('student', s.id)}>
              <Avatar s={s} size={48} />
              <div className="grow">
                <b>{s.name}</b>
                <p className="small mute">{s.age} anos · Unit {s.currentUnit} · {studentXp(db, s.id)} XP · frequência {att.pct ?? '—'}{att.pct !== null ? '%' : ''}</p>
              </div>
              {avg !== null && <LetterBadge points={avg} scale={db.settings.scale} sm />}
              <span className={`pill p-${st.s}`}>{st.label}</span>
            </button>
          );
        })}
      </div>
      {adding && (
        <Modal label="Novo aluno" onClose={() => setAdding(false)}>
          <h2>Novo aluno</h2>
          <StudentFields value={draft} onChange={setDraft} />
          <h3>Família</h3>
          <GuardiansFields value={fam} onChange={setFam} />
          {err && <p className="err">{err}</p>}
          <div className="row"><button className="btn ghost" onClick={() => setAdding(false)}>Cancelar</button><button className="btn navy grow" onClick={save}>Salvar</button></div>
        </Modal>
      )}
    </>
  );
}

export function StudentFile({ id, open }: { id: string; open: (tab: string, sid?: string) => void }) {
  const { db, update, go } = useApp();
  const s = db.students.find((x) => x.id === id);
  const [tab, setTab] = useState('progress');
  if (!s) return <p>Aluno não encontrado.</p>;
  const tabs = [['progress', 'Progresso'], ['grades', 'Notas'], ['attendance', 'Frequência'], ['goals', 'Objetivos'], ['weak', 'O que mais erra'], ['stickers', 'Figurinhas e feedback'], ['data', 'Dados']];
  return (
    <>
      <div className="thead">
        <button className="link" onClick={() => open('students')}>← Alunos</button>
      </div>
      <div className="row wrap">
        <Avatar s={s} size={72} />
        <div className="grow">
          <h1 style={{ fontSize: 30 }}>{s.name}</h1>
          <p className="mute">{s.age} anos · {studentXp(db, s.id)} XP</p>
          {(s.guardians ?? []).length > 0 && <p className="small">{s.guardians!.map((g) => `${g.role === 'mae' ? 'Mãe' : g.role === 'pai' ? 'Pai' : 'Responsável'}: ${g.name}${g.phone ? ` · ${g.phone}` : ''}`).join('   ·   ')}</p>}
        </div>
        <button className="btn navy" style={{ boxShadow: '0 5px 0 #171A45' }} onClick={() => go({ name: 'kid', studentId: s.id, withTeacher: true })}>▶ Trilha de {s.name} (modo aula)</button>
      </div>
      <div className="ttabs" role="tablist">
        {tabs.map(([k, l]) => <button key={k} role="tab" aria-current={tab === k} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      {tab === 'progress' && <Progress id={id} />}
      {tab === 'grades' && <Grades id={id} />}
      {tab === 'attendance' && <Attendance id={id} />}
      {tab === 'goals' && <Goals id={id} />}
      {tab === 'weak' && <Weak id={id} />}
      {tab === 'stickers' && <StickersFeedback id={id} />}
      {tab === 'data' && <Data s={s} onArchive={() => { update((d) => ({ ...d, students: d.students.map((x) => (x.id === id ? { ...x, archived: true } : x)) })); open('students'); }} />}
    </>
  );
}

function Progress({ id }: { id: string }) {
  const { db, update } = useApp();
  const s = db.students.find((x) => x.id === id)!;
  const rs = db.results.filter((r) => r.studentId === id).sort((a, b) => b.at.localeCompare(a.at));
  const tot = rs.reduce((a, r) => a + r.total, 0);
  const first = rs.reduce((a, r) => a + r.correctFirst, 0);
  const errs = rs.reduce((a, r) => a + r.mistakes, 0);
  const lessons = new Set(rs.filter((r) => r.mode === 'lesson').map((r) => r.lessonId)).size;
  const mins = Math.round(rs.reduce((a, r) => a + r.seconds, 0) / 60);
  return (
    <div className="col">
      <div className="grid3 kpis">
        <section className="card stat"><b>{lessons}</b><span>Lições feitas</span></section>
        <section className="card stat"><b style={{ color: 'var(--ok)' }}>{tot ? Math.round((first / tot) * 100) : '—'}{tot ? '%' : ''}</b><span>Acertos de primeira ({first} de {tot})</span></section>
        <section className="card stat"><b style={{ color: 'var(--bad)' }}>{errs}</b><span>Erros no total</span></section>
        <section className="card stat"><b>{mins}</b><span>Minutos estudando</span></section>
      </div>
      <section className="card">
        <h3>Últimas atividades</h3>
        {rs.length === 0 ? <p className="mute">Quando {s.name} fizer lições, cada acerto e erro aparece aqui.</p> : (
          <div className="table-wrap"><table className="t">
            <thead><tr><th>Quando</th><th>Atividade</th><th>Acertos de primeira</th><th>Erros</th><th>Pontos</th><th>Onde</th></tr></thead>
            <tbody>{rs.slice(0, 10).map((r) => (
              <tr key={r.id}><td className="tnum">{fmtDate(r.date)}</td><td>{r.mode === 'quiz' ? (r.lessonId.startsWith('exam-') ? db.exams?.find((e) => `exam-${e.id}` === r.lessonId)?.title ?? 'Prova' : `Provinha · Unit ${r.unitId}`) : findLesson(r.lessonId)?.lesson.title}</td><td className="tnum">{r.correctFirst}/{r.total}</td><td className="tnum">{r.mistakes}</td><td className="tnum"><b>{r.points}</b></td><td>{r.withTeacher ? <span className="pill p-ok">Na aula</span> : <span className="pill p-away">Sozinh{s.gender === 'm' ? 'o' : 'a'}</span>}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
      <section className="card">
        <div className="row wrap">
          <h3 className="grow">Unit liberada até</h3>
          <select className="input" style={{ width: 'auto' }} value={s.currentUnit} onChange={(e) => update((d) => ({ ...d, students: d.students.map((x) => (x.id === id ? { ...x, currentUnit: Number(e.target.value) } : x)) }))}>
            {UNITS.map((u) => <option key={u.id} value={u.id}>Unit {u.id} · {u.title}</option>)}
          </select>
        </div>
        <p className="small mute">A criança também libera a próxima unit sozinha quando tira C ou mais na provinha.</p>
      </section>
      <section className="card">
        <h3>Units da apostila</h3>
        {UNITS.map((u) => {
          const p = unitProgress(db, id, u.id);
          const q = bestQuiz(db, id, u.id);
          return (
            <div key={u.id} className="upbar">
              <span>Unit {u.id} {u.emoji}</span>
              <div className="mini" title={`${p.done}/${p.total}`}><i style={{ width: `${p.pct * 100}%`, background: u.color }} /></div>
              <span className="tnum small">{q ? <LetterBadge points={q.points} scale={db.settings.scale} sm /> : `${p.done}/${p.total}`}</span>
            </div>
          );
        })}
      </section>
      <section className="card">
        <h3>Lições da Unit {s.currentUnit}</h3>
        <div className="table-wrap"><table className="t">
          <thead><tr><th>Lição</th><th>Tipo</th><th>Página</th><th>Estrelas</th></tr></thead>
          <tbody>{unitById(s.currentUnit).lessons.map((l) => (
            <tr key={l.id}><td>{l.title}</td><td>{KIND_LABEL[l.kind]}</td><td>{l.ref.printed ? `p. ${l.ref.printed}` : l.ref.section}</td><td>{lessonDone(db, id, l.id) ? '⭐'.repeat(bestStars(db, id, l.id)) : <span className="mute">ainda não</span>}</td></tr>
          ))}</tbody>
        </table></div>
      </section>
    </div>
  );
}

function Grades({ id }: { id: string }) {
  const { db, update } = useApp();
  const [f, setF] = useState({ title: '', points: '', unitId: String(db.students.find((x) => x.id === id)!.currentUnit), date: dayKey(), source: 'manual' as 'manual' | 'homework' });
  const gs = db.grades.filter((g) => g.studentId === id).sort((a, b) => b.date.localeCompare(a.date));
  const add = () => {
    const p = Number(f.points);
    if (!f.title.trim() || isNaN(p) || p < 0 || p > 100) return toast('Coloque um título e uma nota de 0 a 100.');
    update((d) => ({ ...d, grades: [...d.grades, { id: uid(), studentId: id, date: f.date, unitId: Number(f.unitId), title: f.title.trim(), points: p, source: f.source }] }));
    setF({ ...f, title: '', points: '' });
    toast('Nota salva.');
  };
  return (
    <div className="grid2" style={{ alignItems: 'start' }}>
      <section className="card">
        <h3>Notas</h3>
        <p className="small mute">Escala: A ≥ {db.settings.scale.A} · B ≥ {db.settings.scale.B} · C ≥ {db.settings.scale.C} · D abaixo.</p>
        {gs.length === 0 ? <p className="mute">Nenhuma nota ainda.</p> : (
          <div className="table-wrap"><table className="t">
            <thead><tr><th>Data</th><th>Avaliação</th><th>Pontos</th><th>Letra</th><th></th></tr></thead>
            <tbody>{gs.map((g) => (
              <tr key={g.id}><td className="tnum">{fmtDate(g.date)}</td><td>{g.title}<div className="small mute">{g.source === 'provinha' ? 'Provinha no app' : g.source === 'prova' ? 'Prova do caderno' : g.source === 'homework' ? 'Homework' : 'Lançada por você'}</div></td><td className="tnum"><b>{g.points}</b></td><td><LetterBadge points={g.points} scale={db.settings.scale} sm /></td>
                <td><button className="link small" onClick={() => update((d) => ({ ...d, grades: d.grades.filter((x) => x.id !== g.id) }))}>remover</button></td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
      <section className="card">
        <h3>Lançar nota</h3>
        <div className="field"><label htmlFor="gt">Avaliação</label><input id="gt" className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Ex.: Speaking — My Family!" /></div>
        <div className="row wrap">
          <div className="field" style={{ width: 120 }}><label htmlFor="gp">Pontos (0–100)</label><input id="gp" className="input" inputMode="numeric" value={f.points} onChange={(e) => setF({ ...f, points: e.target.value.replace(/\D/g, '').slice(0, 3) })} /></div>
          <div className="field grow"><label htmlFor="gu">Unit</label><select id="gu" className="input" value={f.unitId} onChange={(e) => setF({ ...f, unitId: e.target.value })}>{UNITS.map((u) => <option key={u.id} value={u.id}>Unit {u.id} · {u.title}</option>)}</select></div>
        </div>
        <div className="row wrap">
          <div className="field"><label htmlFor="gd">Data</label><input id="gd" type="date" className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
          <div className="field grow"><span className="lbl">Tipo</span><div className="seg"><button aria-pressed={f.source === 'manual'} onClick={() => setF({ ...f, source: 'manual' })}>Avaliação</button><button aria-pressed={f.source === 'homework'} onClick={() => setF({ ...f, source: 'homework' })}>Homework</button></div></div>
        </div>
        {f.points && <p className="small">Vai aparecer como <b>{letter(Number(f.points), db.settings.scale)}</b> para a aluna.</p>}
        <button className="btn navy" style={{ boxShadow: '0 5px 0 #171A45' }} onClick={add}>Salvar nota</button>
      </section>
    </div>
  );
}

function Attendance({ id }: { id: string }) {
  const { db } = useApp();
  const att = attendance(db, id, db.settings.schoolYear);
  const cls = db.classes.filter((c) => c.attendance[id]).sort((a, b) => b.date.localeCompare(a.date));
  const lbl = { P: 'Presente', F: 'Falta', J: 'Falta justificada' };
  return (
    <div className="col">
      <div className="grid3">
        <section className="card stat"><b>{att.total}</b><span>Aulas em {db.settings.schoolYear}</span></section>
        <section className="card stat"><b>{att.P}</b><span>Presenças</span></section>
        <section className="card stat"><b>{att.F + att.J}</b><span>Faltas ({att.J} justificadas)</span></section>
        <section className="card stat"><b>{att.pct ?? '—'}{att.pct !== null ? '%' : ''}</b><span>Frequência</span></section>
      </div>
      <section className="card">
        <h3>Aulas</h3>
        {cls.length === 0 ? <p className="mute">Registre aulas no Diário de aula.</p> : (
          <div className="table-wrap"><table className="t"><thead><tr><th>Data</th><th>Modalidade</th><th>Presença</th><th>Observação</th></tr></thead>
            <tbody>{cls.map((c) => <tr key={c.id}><td className="tnum">{fmtDate(c.date)}</td><td>{c.modality === 'online' ? '💻 Online' : '🏫 Presencial'}</td><td><span className={`pill ${c.attendance[id] === 'P' ? 'p-ok' : c.attendance[id] === 'F' ? 'p-help' : 'p-away'}`}>{lbl[c.attendance[id]]}</span></td><td className="small">{c.notes}</td></tr>)}</tbody>
          </table></div>
        )}
      </section>
    </div>
  );
}

function Goals({ id }: { id: string }) {
  const { db, update } = useApp();
  const s = db.students.find((x) => x.id === id)!;
  const [text, setText] = useState('');
  const [unitId, setUnitId] = useState(String(s.currentUnit));
  const goals = db.goals.filter((g) => g.studentId === id).sort((a, b) => Number(a.done) - Number(b.done) || b.createdAt.localeCompare(a.createdAt));
  const u = unitById(Number(unitId));
  const suggestions = [
    ...u.lessons.filter((l) => !lessonDone(db, id, l.id)).slice(0, 3).map((l) => `Fazer "${l.title}" (${l.ref.printed ? `p. ${l.ref.printed}` : l.ref.section})`),
    `Tirar A na Provinha da Unit ${u.id}`,
    u.parentNote ? 'Fazer a Tarefa em casa com a família' : '',
  ].filter(Boolean);
  return (
    <div className="grid2" style={{ alignItems: 'start' }}>
      <section className="card">
        <h3>Próximos objetivos</h3>
        {goals.length === 0 && <p className="mute">Nenhum objetivo ainda. Eles aparecem para a criança em "Minhas notas".</p>}
        {goals.map((g) => (
          <label key={g.id} className="row" style={{ opacity: g.done ? 0.55 : 1 }}>
            <input type="checkbox" checked={g.done} onChange={() => update((d) => ({ ...d, goals: d.goals.map((x) => (x.id === g.id ? { ...x, done: !x.done } : x)) }))} />
            <span className="grow"><b>Unit {g.unitId}</b> · {g.text}</span>
          </label>
        ))}
      </section>
      <section className="card">
        <h3>Novo objetivo</h3>
        <div className="field"><label htmlFor="ou">Capítulo da apostila</label><select id="ou" className="input" value={unitId} onChange={(e) => setUnitId(e.target.value)}>{UNITS.map((x) => <option key={x.id} value={x.id}>Unit {x.id} · {x.title}</option>)}</select></div>
        <div className="field"><label htmlFor="ot">Objetivo</label><textarea id="ot" className="input" value={text} onChange={(e) => setText(e.target.value)} /></div>
        <div className="lessonpick">{suggestions.map((sg) => <button key={sg} onClick={() => setText(sg)}>{sg}</button>)}</div>
        <button className="btn navy" style={{ boxShadow: '0 5px 0 #171A45' }} disabled={!text.trim()} onClick={() => { update((d) => ({ ...d, goals: [...d.goals, { id: uid(), studentId: id, unitId: Number(unitId), text: text.trim(), done: false, createdAt: new Date().toISOString() }] })); setText(''); toast('Objetivo salvo.'); }}>Salvar objetivo</button>
      </section>
    </div>
  );
}

function Weak({ id }: { id: string }) {
  const { db } = useApp();
  const w = weakItems(db, id);
  return (
    <section className="card">
      <h3>O que mais erra</h3>
      {w.length === 0 ? <p className="mute">Ainda sem erros registrados. 🎉</p> : (
        <div className="table-wrap"><table className="t"><thead><tr><th>Exercício</th><th>Onde na apostila</th><th>Erros</th></tr></thead>
          <tbody>{w.map((x) => <tr key={x.id}><td>{x.text}</td><td className="small">{x.ref}</td><td className="tnum"><b>{x.n}</b></td></tr>)}</tbody></table></div>
      )}
    </section>
  );
}

function StickersFeedback({ id }: { id: string }) {
  const { db, update } = useApp();
  const mine = db.stickers.filter((x) => x.studentId === id);
  const give = (sticker: string) => {
    update((d) => ({ ...d, stickers: [...d.stickers, { id: uid(), studentId: id, sticker, date: dayKey(), by: 'camila' }] }));
    toast('Figurinha entregue! 🏅');
  };
  const setStars = (unitId: number, stars: number) =>
    update((d) => ({ ...d, feedback: [...d.feedback.filter((f) => !(f.studentId === id && f.unitId === unitId)), { studentId: id, unitId, stars }] }));
  return (
    <div className="grid2" style={{ alignItems: 'start' }}>
      <section className="card">
        <h3>Dar figurinha (Phrase Hunter)</h3>
        <p className="small mute">A apostila sugere dar figurinha quando a criança usa uma frase em inglês na aula.</p>
        <div className="sgrid">
          {STICKERS.map((st) => (
            <button key={st.id} className="sticker got" style={{ border: '3px solid var(--yellow)' }} onClick={() => give(st.id)} aria-label={`Dar figurinha ${st.label}`}>
              {st.emoji}{mine.filter((m) => m.sticker === st.id).length > 0 && <em>×{mine.filter((m) => m.sticker === st.id).length}</em>}
            </button>
          ))}
        </div>
      </section>
      <section className="card">
        <h3>Teacher's feedback ⭐</h3>
        <p className="small mute">As 5 estrelas do fim de cada Translate! e Homework da apostila. A criança vê no app.</p>
        {UNITS.map((u) => {
          const cur = db.feedback.find((f) => f.studentId === id && f.unitId === u.id)?.stars ?? 0;
          return (
            <div key={u.id} className="row" style={{ justifyContent: 'space-between' }}>
              <span className="small"><b>Unit {u.id}</b> · {u.title}</span>
              <div className="stars5">{[1, 2, 3, 4, 5].map((n) => <button key={n} className={n <= cur ? 'on' : ''} onClick={() => setStars(u.id, n)} aria-label={`${n} estrelas`}>⭐</button>)}</div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function Data({ s, onArchive }: { s: Student; onArchive: () => void }) {
  const { update } = useApp();
  const [v, setV] = useState<Partial<Student>>(s);
  const [fam, setFam] = useState<Guardian[]>(s.guardians?.length ? s.guardians : [{ role: 'mae', name: s.guardian ?? '', phone: '' }, { role: 'pai', name: '', phone: '' }]);
  const [confirm, setConfirm] = useState(false);
  return (
    <section className="card" style={{ maxWidth: 560 }}>
      <StudentFields value={v} onChange={setV} />
      <div className="field" style={{ maxWidth: 320 }}><label htmlFor="spin">Senha do aluno</label><input id="spin" className="input" maxLength={20} value={v.pin ?? ''} onChange={(e) => setV({ ...v, pin: e.target.value || undefined })} placeholder={`padrão: ${v.name || s.name}`} /><span className="small mute">Vazio = a senha é o nome ({v.name || s.name}). Maiúscula e acento não importam.</span></div>
      <h3>Família</h3>
      <GuardiansFields value={fam} onChange={setFam} />
      <button className="btn navy" style={{ boxShadow: '0 5px 0 #171A45' }} onClick={() => { update((d) => ({ ...d, students: d.students.map((x) => (x.id === s.id ? { ...x, ...v, guardians: fam.filter((g) => g.name.trim()), name: (v.name || x.name).trim() } as Student : x)) })); toast('Dados salvos.'); }}>Salvar</button>
      {!confirm ? <button className="link small" onClick={() => setConfirm(true)}>Arquivar {aluno(s)}</button> : (
        <div className="row"><span className="small grow">Arquivar tira {s.name} da tela inicial. As notas continuam guardadas.</span><button className="btn red sm" onClick={onArchive}>Arquivar</button><button className="btn ghost sm" onClick={() => setConfirm(false)}>Cancelar</button></div>
      )}
    </section>
  );
}
