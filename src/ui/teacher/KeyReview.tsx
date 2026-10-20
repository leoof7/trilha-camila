import { useState } from 'react';
import { useApp } from '../../state';
import { suggestedKeyItems } from '../../engine/session';
import { RefTag, toast } from '../common';
import { UNITS } from '../../content';

export function KeyReview() {
  const { db, update } = useApp();
  const items = suggestedKeyItems();
  const [unit, setUnit] = useState(1);
  const shown = items.filter((x) => x.unitId === unit);
  const approved = items.filter((x) => db.keys[x.item.id]?.approved).length;
  return (
    <>
      <div className="thead">
        <div className="grow"><div className="eyebrow">{approved} de {items.length} conferidas</div><h1>Gabarito sugerido</h1></div>
      </div>
      <section className="card">
        <p>Nos exercícios "Translate!" e em alguns Homework a apostila deixa a linha em branco. Para o app corrigir, estas respostas foram escritas e revisadas (19/10/2026) usando só palavras da apostila. Elas já valem. Se quiser outra resposta, escreva e toque em <b>Salvar</b>.</p>
        <p className="small mute">Palavras que estão na resposta viram as peças do "monte a frase". Use palavras que a turma já viu na apostila.</p>
      </section>
      <div className="seg">{UNITS.map((u) => {
        const n = items.filter((x) => x.unitId === u.id);
        if (!n.length) return null;
        const ok = n.filter((x) => db.keys[x.item.id]?.approved).length;
        return <button key={u.id} aria-pressed={unit === u.id} onClick={() => setUnit(u.id)}>Unit {u.id} {ok === n.length ? '✓' : `${ok}/${n.length}`}</button>;
      })}</div>
      <div className="col">
        {shown.map(({ item, lessonTitle }) => <KeyRow key={item.id} id={item.id} q={'q' in item ? String(item.q) : ''} a={'a' in item ? String(item.a) : ''} lessonTitle={lessonTitle} refx={item.ref} saved={db.keys[item.id]} onSave={(answer, ok) => { update((d) => ({ ...d, keys: { ...d.keys, [item.id]: { answer, approved: ok, at: new Date().toISOString() } } })); if (ok) toast('Resposta salva.'); }} />)}
      </div>
    </>
  );
}

function KeyRow({ id, q, a, lessonTitle, refx, saved, onSave }: { id: string; q: string; a: string; lessonTitle: string; refx: any; saved?: { answer: string; approved: boolean }; onSave: (a: string, ok: boolean) => void }) {
  const [v, setV] = useState(saved?.answer || a);
  return (
    <div className={`keyitem${saved?.approved ? ' approved' : ''}`}>
      <div className="row wrap"><b className="grow">{q}</b><RefTag r={refx} /></div>
      <span className="small mute">{lessonTitle}</span>
      <div className="row">
        <input className="input grow" value={v} onChange={(e) => setV(e.target.value)} aria-label={`Resposta para ${q}`} id={`k-${id}`} />
        <button className={`btn sm ${saved?.approved && saved.answer === v ? 'ok' : 'navy'}`} style={{ boxShadow: 'none' }} onClick={() => onSave(v.trim(), true)}>{saved?.approved && saved.answer === v ? '✓ Salvo' : 'Salvar'}</button>
      </div>
    </div>
  );
}
