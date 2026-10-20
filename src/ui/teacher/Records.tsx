// Provas, Trabalhos, Notas e Faltas: as visões de "caderneta" da professora.
import { useState } from 'react';
import { tomb } from '../../store/merge';
import { useApp } from '../../state';
import { Avatar, LetterBadge, fmtDate, MONTHS_PT, toast, RefTag, PresencePick, Modal } from '../common';
import { unitById, itemById, refLabel } from '../../content';
import { pickExamItems } from '../../engine/session';
import { askFor } from '../../content/instructions';
import { examHtml } from './examPaper';
import { download } from '../../lib/image';
import { uid } from '../../store/db';
import { UNITS } from '../../content';
import { bestQuiz, unitProgress, lessonDone } from '../kid/progress';
import { average, letter } from '../../engine/grade';
import { attendance } from './stats';
import { dayKey } from '../../engine/game';
import type { HomeworkMark, Exam } from '../../store/types';

/* ───────── Provas ───────── */
export function Exams() {
  const { db, go, update } = useApp();
  const students = db.students.filter((s) => !s.archived);
  const [creating, setCreating] = useState(false);
  const exams = [...(db.exams ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <div className="thead">
        <div className="grow"><div className="eyebrow">Sempre com a professora</div><h1>Provas</h1></div>
        <button className="btn yellow" onClick={() => setCreating(true)}>+ Criar prova</button>
      </div>
      <section className="card">
        <div className="row"><h3 className="grow">📚 Caderno de provas</h3><span className="pill p-ok">{exams.length} {exams.length === 1 ? 'prova' : 'provas'}</span></div>
        {exams.length === 0 && <p className="mute">Crie uma prova escolhendo as units: o app sorteia as questões da apostila. Dá para aplicar no app ou imprimir a folha para mandar aos pais.</p>}
        <div className="examgrid">
          {exams.map((e) => <ExamCard key={e.id} e={e} />)}
        </div>
      </section>
      <section className="card">
        <h3>📝 Provinhas de cada unit (no app)</h3>
        <p className="small mute">10 questões sorteadas da unit. Toque em <b>Aplicar</b> para abrir com o aluno no modo aula. Vale a melhor nota e libera a próxima unit.</p>
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
      {creating && <CreateExam onClose={() => setCreating(false)} onSave={(e) => { update((d) => ({ ...d, exams: [...(d.exams ?? []), e] })); setCreating(false); toast('Prova salva no caderno.'); }} />}
    </>
  );
}

function openPrint(html: string, file: string) {
  const w = window.open('', '_blank');
  if (w) { w.document.open(); w.document.write(html); w.document.close(); setTimeout(() => { try { w.focus(); w.print(); } catch { /* ok */ } }, 600); return; }
  download(new Blob([html], { type: 'text/html' }), file);
}

function ExamCard({ e }: { e: Exam }) {
  const { db, go, update } = useApp();
  const students = db.students.filter((s) => !s.archived);
  const [del, setDel] = useState(false);
  const file = (who?: string) => `${e.title.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}${who ? `-${who.toLowerCase()}` : ''}.html`;
  return (
    <article className="examcard">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div className="grow">
          <b className="etitle">{e.title}</b>
          <div className="row wrap" style={{ gap: 4, marginTop: 6 }}>{e.unitIds.map((u) => <span key={u} className="upill" style={{ background: unitById(u).color }}>Unit {u}</span>)}<span className="small mute">· {e.itemIds.length} questões · {fmtDate(e.createdAt.slice(0, 10))}</span></div>
        </div>
      </div>
      {students.map((s) => {
        const rs = db.results.filter((r) => r.studentId === s.id && r.lessonId === `exam-${e.id}`);
        const best = rs.reduce<number | null>((a, r) => (a === null || r.points > a ? r.points : a), null);
        return (
          <div key={s.id} className="row wrap examrow">
            <Avatar s={s} size={28} /><b className="grow">{s.name}</b>
            {best !== null && <><LetterBadge points={best} scale={db.settings.scale} sm /><b className="tnum">{best}</b></>}
            <button className="chipbtn" onClick={() => go({ name: 'play', studentId: s.id, unitId: e.unitIds[0], lessonId: `exam-${e.id}`, mode: 'quiz', withTeacher: true })}>▶ {best !== null ? 'Refazer' : 'Aplicar'} no app</button>
            <button className="chipbtn" onClick={() => openPrint(examHtml(e, { student: s, teacher: db.settings.teacherName, keys: db.keys }), file(s.name))}>🖨️ Folha de {s.name}</button>
          </div>
        );
      })}
      <div className="row wrap" style={{ gap: 6 }}>
        <button className="btn sm ghost" onClick={() => download(new Blob([examHtml(e, { teacher: db.settings.teacherName, keys: db.keys })], { type: 'text/html' }), file())}>⬇ Baixar folha em branco</button>
        <button className="btn sm ghost" onClick={() => openPrint(examHtml(e, { teacher: db.settings.teacherName, keys: db.keys, withKey: true }), file('gabarito'))}>✅ Folha com gabarito</button>
        {!del ? <button className="link small" onClick={() => setDel(true)}>excluir</button> : <button className="btn sm red" onClick={() => update((d) => tomb({ ...d, exams: (d.exams ?? []).filter((x) => x.id !== e.id) }, e.id))}>Confirmar exclusão</button>}
      </div>
    </article>
  );
}

function CreateExam({ onClose, onSave }: { onClose: () => void; onSave: (e: Exam) => void }) {
  const { db } = useApp();
  const cur = db.students.find((s) => !s.archived)?.currentUnit ?? 1;
  const [units, setUnits] = useState<number[]>([cur]);
  const [size, setSize] = useState(10);
  const [title, setTitle] = useState('');
  const [ids, setIds] = useState<string[]>(() => pickExamItems([cur], 10));
  const redo = (u = units, n = size) => setIds(u.length ? pickExamItems(u, n) : []);
  const autoTitle = units.length === 1 ? `Prova · Unit ${units[0]}` : `Prova · Units ${[...units].sort((a, b) => a - b).join(', ')}`;
  return (
    <Modal label="Criar prova" onClose={onClose}>
      <h2>📝 Criar prova</h2>
      <div className="field"><span className="lbl">Quais units da apostila?</span>
        <div className="lessonpick">{UNITS.map((u) => <button key={u.id} aria-pressed={units.includes(u.id)} onClick={() => { const nu = units.includes(u.id) ? units.filter((x) => x !== u.id) : [...units, u.id]; setUnits(nu); redo(nu); }}><i className="udot" style={{ background: u.color }} /> Unit {u.id} · {u.title}</button>)}</div>
      </div>
      <div className="row wrap">
        <div className="field"><span className="lbl">Questões</span><div className="seg">{[5, 8, 10, 12, 15].map((n) => <button key={n} aria-pressed={size === n} onClick={() => { setSize(n); redo(units, n); }}>{n}</button>)}</div></div>
        <div className="field grow"><label htmlFor="et">Nome da prova</label><input id="et" className="input" value={title} placeholder={autoTitle} onChange={(e) => setTitle(e.target.value)} /></div>
      </div>
      <div className="field">
        <div className="row"><span className="lbl grow">Questões sorteadas (só da apostila · sem fala e sem áudio, para funcionar no papel)</span><button className="link small" onClick={() => redo()}>🔄 sortear de novo</button></div>
        <ol className="examlist">
          {ids.map((id) => { const f = itemById(id); if (!f) return null; const a = askFor(f.item, f.unitId); return (
            <li key={id}><span className="grow"><b>{a.en}</b> <span className="small mute">{'q' in f.item && f.item.q && f.item.q !== a.en ? `· ${f.item.q}` : ''}</span><br /><span className="small mute">Unit {f.unitId} · {f.lessonTitle} · {refLabel(f.item.ref)}</span></span><button className="link small" aria-label="Tirar questão" onClick={() => setIds(ids.filter((x) => x !== id))}>✕</button></li>
          ); })}
        </ol>
      </div>
      <div className="row"><button className="btn ghost" onClick={onClose}>Cancelar</button><button className="btn blue grow" disabled={!ids.length} onClick={() => onSave({ id: uid(), title: title.trim() || autoTitle, unitIds: [...units].sort((a, b) => a - b), itemIds: ids, createdAt: new Date().toISOString() })}>Salvar no caderno de provas</button></div>
    </Modal>
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
                <PresencePick value={c.attendance[s.id]} onChange={(p) => update((d) => ({ ...d, classes: d.classes.map((x) => (x.id === c.id ? { ...x, attendance: { ...x.attendance, [s.id]: p } } : x)) }))} />
              </span>
            ))}
          </div>
        ))}
        <p className="small mute">Marque “justificada” dentro da falta quando a família avisou.</p>
      </section>
    </>
  );
}

export { letter };
