// Os tipos de exercício. Cada um avisa o Player quando dá para "Verificar" (setCheck)
// ou termina sozinho (done), como o combinar pares e a fala.
import { isNameScramble, splitLead } from '../../content/instructions';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Prepared } from '../../engine/session';
import { norm, sameAnswer, shuffle, speechScore } from '../../engine/check';
import { canListen, listen, say } from '../../lib/speech';
import { sfx } from '../../lib/sound';
import { meaningOf } from '../../content/help';

export interface Verdict { ok: boolean; answer: string; skipped?: boolean }
export interface ExProps {
  ex: Prepared;
  locked: boolean;
  setCheck: (fn: (() => Verdict) | null) => void;
  done: (v: Verdict) => void;
  withTeacher?: boolean;
}

export const TYPE_LABEL: Record<Prepared['t'], string> = {
  match: 'Combine os pares', pic: 'Qual é?', build: 'Monte a frase', fill: 'Complete', choice: 'Escolha',
  speak: 'Fale em voz alta', scramble: 'Desembaralhe', hear: 'Ouça e escolha', order: 'Coloque em ordem', sort: 'Separe em grupos', type: 'Escreva',
};

export function Exercise(p: ExProps) {
  switch (p.ex.t) {
    case 'match': return <Match {...p} />;
    case 'build': return <Build {...p} />;
    case 'fill': return <Fill {...p} />;
    case 'choice': case 'pic': case 'hear': return <Choice {...p} />;
    case 'speak': return <Speak {...p} />;
    case 'scramble': return <Scramble {...p} />;
    case 'order': return <Order {...p} />;
    case 'sort': return <Sort {...p} />;
    case 'type': return <TypeIn {...p} />;
  }
}

/* ───── combinar pares ───── */
function Match({ ex, done }: ExProps) {
  if (ex.t !== 'match') return null;
  const left = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ t: p[0], k: i }))), [ex.id]);
  const right = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ t: p[1], k: i }))), [ex.id]);
  const [sel, setSel] = useState<{ side: 'L' | 'R'; k: number } | null>(null);
  const [ok, setOk] = useState<Set<number>>(new Set());
  const [no, setNo] = useState<string[]>([]);
  const missed = useRef(false);
  const isEn = (s: string) => /^[A-Za-z0-9 ,.'!?…-]+$/.test(s) && !/^\d+$/.test(s);

  const tap = (side: 'L' | 'R', k: number, text: string) => {
    if (isEn(text)) say(text);
    if (!sel || sel.side === side) return setSel({ side, k });
    if (sel.k === k) {
      sfx.ok();
      const n = new Set(ok); n.add(k); setOk(n); setSel(null);
      if (n.size === ex.pairs.length) setTimeout(() => done({ ok: !missed.current, answer: '' }), 300);
    } else {
      sfx.bad();
      missed.current = true;
      setNo([`${sel.side}${sel.k}`, `${side}${k}`]);
      setSel(null);
      setTimeout(() => setNo([]), 400);
    }
  };
  const cls = (side: 'L' | 'R', k: number) => `pair${ok.has(k) ? ' ok' : ''}${sel && sel.side === side && sel.k === k ? ' sel' : ''}${no.includes(`${side}${k}`) ? ' no' : ''}`;
  return (
    <div className="pairs">
      <div className="c">{left.map((x) => <button key={x.k} className={cls('L', x.k)} onClick={() => tap('L', x.k, x.t)}>{x.t}</button>)}</div>
      <div className="c">{right.map((x) => <button key={x.k} className={cls('R', x.k)} onClick={() => tap('R', x.k, x.t)}>{x.t}</button>)}</div>
    </div>
  );
}

/* ───── montar frase (tradução) ───── */
function Build({ ex, locked, setCheck }: ExProps) {
  if (ex.t !== 'build') return null;
  const bank = ex.bank!;
  const [picked, setPicked] = useState<number[]>([]);
  const toEn = ex.dir === 'pe';
  useEffect(() => {
    setCheck(picked.length ? () => {
      const given = picked.map((i) => bank[i]).join(' ');
      return { ok: sameAnswer(given, ex.a, ex.alt), answer: ex.a };
    } : null);
  }, [picked.join(',')]);
  useEffect(() => { if (!toEn) say(ex.q); }, [ex.id]);
  return (
    <>
      <div className="bubble">
        {!toEn && <button className="abtn sm" onClick={() => say(ex.q)} aria-label="Ouvir em inglês">🔊</button>}
        <div className="say"><small>{splitLead(ex.q).lead ? `${splitLead(ex.q).lead} · ` : ''}{toEn ? 'Português → English' : 'English → Português'}</small>{splitLead(ex.q).text}</div>
      </div>
      <div className="answerline" aria-label="Sua resposta">
        {picked.map((i, pos) => (
          <button key={pos} className="tile" disabled={locked} onClick={() => setPicked(picked.filter((_, j) => j !== pos))}>{bank[i]}</button>
        ))}
      </div>
      <div className="answerline second" aria-hidden="true" />
      <div className="bank">
        {bank.map((w, i) => (
          <button key={i} className={`tile${picked.includes(i) ? ' ghost' : ''}`} disabled={locked} onClick={() => { if (toEn) say(w); else sfx.tap(); setPicked([...picked, i]); }}>{w}</button>
        ))}
      </div>
    </>
  );
}

/* ───── completar (com ou sem áudio) ───── */
function Fill({ ex, locked, setCheck }: ExProps) {
  if (ex.t !== 'fill') return null;
  const [pick, setPick] = useState<string | null>(null);
  const full = ex.q.replace('___', ex.a);
  useEffect(() => { if (ex.listen) setTimeout(() => say(full), 250); }, [ex.id]);
  useEffect(() => { setCheck(pick ? () => ({ ok: pick === ex.a, answer: full }) : null); }, [pick]);
  const parts = ex.q.split('___');
  return (
    <>
      {ex.listen && (
        <div className="row">
          <button className="abtn" onClick={() => say(full)} aria-label="Ouvir">🔊</button>
          <button className="abtn sm slow" onClick={() => say(full, { slow: true })} aria-label="Ouvir devagar">🐢</button>
        </div>
      )}
      {ex.who && <span className="who">{ex.who}</span>}
      <div className="fillq">
        <span>{parts[0]}</span>
        <span className="blank">{pick ?? ' '}</span>
        <span>{parts[1]}</span>
      </div>
      <div className="bank">
        {ex.options!.map((o) => (
          <button key={o} className={`tile${pick === o ? ' sel' : ''}`} disabled={locked} onClick={() => { sfx.tap(); setPick(o); }}>{o}</button>
        ))}
      </div>
    </>
  );
}

/* ───── escolher (choice, figura, ouvir) ───── */
function Choice({ ex, locked, setCheck }: ExProps) {
  const [pick, setPick] = useState<string | null>(null);
  const audio = ex.t === 'hear' ? (ex.say ?? ex.a) : '';
  useEffect(() => { if (ex.t === 'hear') setTimeout(() => say(audio), 250); }, [ex.id]);
  useEffect(() => {
    if (ex.t !== 'choice' && ex.t !== 'pic' && ex.t !== 'hear') return;
    setCheck(pick ? () => ({ ok: pick === ex.a, answer: ex.a }) : null);
  }, [pick]);
  if (ex.t !== 'choice' && ex.t !== 'pic' && ex.t !== 'hear') return null;
  const isEn = (s: string) => /[a-z]/i.test(s) && !/[ãçéêíóôú]/i.test(s);
  return (
    <>
      {ex.t === 'pic' && <div className="pic" aria-hidden="true">{ex.emoji}</div>}
      {ex.t === 'hear' && (
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="abtn" onClick={() => say(audio)} aria-label="Ouvir">🔊</button>
          <button className="abtn sm slow" onClick={() => say(audio, { slow: true })} aria-label="Ouvir devagar">🐢</button>
        </div>
      )}
      <div className={ex.options!.length > 3 || ex.options!.every((o) => o.length < 12) ? 'optgrid' : 'opts'}>
        {ex.options!.map((o) => (
          <button key={o} className="opt" aria-pressed={pick === o} disabled={locked} onClick={() => { if (isEn(o) && ex.t !== 'hear') say(o); else sfx.tap(); setPick(o); }}>{o}</button>
        ))}
      </div>
    </>
  );
}

/* ───── falar ───── */
function Speak({ ex, done, withTeacher }: ExProps) {
  if (ex.t !== 'speak') return null;
  const free = ex.a.includes('___');
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const stop = useRef<() => void>(() => {});
  const mic = canListen();
  useEffect(() => { setTimeout(() => say(ex.a), 300); return () => stop.current(); }, [ex.id]);

  const start = () => {
    setHeard(null); setScore(null); setListening(true);
    stop.current = listen(
      (t) => {
        const best = t ? Math.max(...t.split(' | ').map((alt) => speechScore(alt, ex.a))) : 0;
        setHeard(t.split(' | ')[0] || '');
        setScore(best);
        if (!free && best >= 0.7) { sfx.ok(); setTimeout(() => done({ ok: true, answer: ex.a }), 700); }
      },
      () => setListening(false),
    );
  };

  return (
    <div className="speakcard">
      {ex.tip && <p className="who">{ex.tip}</p>}
      <div className="big">{ex.a.replace(/___/g, '…')}</div>
      <div className="row">
        <button className="abtn sm" onClick={() => say(ex.a)} aria-label="Ouvir o modelo">🔊</button>
        <button className="abtn sm slow" onClick={() => say(ex.a, { slow: true })} aria-label="Ouvir devagar">🐢</button>
      </div>
      {mic && !free && (
        <>
          <button className={`mic${listening ? ' on' : ''}`} onClick={start} aria-label="Falar agora">🎤</button>
          <p className="small mute">{listening ? 'Estou ouvindo… fale bem alto!' : 'Toque no microfone e fale'}</p>
          {heard !== null && (
            <p className="small"><b>Ouvi:</b> “{heard || '…não consegui ouvir'}” {score !== null && score < 0.7 && '· tente de novo!'}</p>
          )}
        </>
      )}
      {(withTeacher || free || !mic) ? (
        <div className="judge">
          <b>{withTeacher ? '👩‍🏫 Camila, como ela falou?' : free ? 'Fale com as suas palavras!' : 'Fale em voz alta e depois toque:'}</b>
          <div className="row">
            <button className="btn ghost sm grow" onClick={() => { say(ex.a); }}>🔁 Ouvir de novo</button>
            <button className="btn ok sm grow" onClick={() => { sfx.ok(); done({ ok: true, answer: ex.a }); }}>{withTeacher ? '👍 Falou bem!' : 'Falei!'}</button>
          </div>
        </div>
      ) : (
        <button className="link small" onClick={() => done({ ok: true, answer: ex.a, skipped: true })}>Não posso falar agora</button>
      )}
    </div>
  );
}

/* ───── desembaralhar letras ───── */
function Scramble({ ex, locked, setCheck }: ExProps) {
  if (ex.t !== 'scramble') return null;
  const bank = ex.bank!;
  const [picked, setPicked] = useState<number[]>([]);
  const target = ex.a.replace(/\s/g, '');
  const isName = isNameScramble(ex);
  const meaning = isName ? 'o seu nome' : meaningOf(ex.a);
  useEffect(() => {
    setCheck(picked.length === bank.length ? () => ({ ok: picked.map((i) => bank[i]).join('') === target, answer: ex.a }) : null);
  }, [picked.join(',')]);
  return (
    <>
      <div className="scrhint">
        {ex.hint && <span className="scremoji" aria-hidden="true">{ex.hint}</span>}
        <div>
          {meaning && <p><span className="mute">Palavra em inglês que significa</span><br /><b>{meaning}</b></p>}
          {!isName && <button className="chipbtn" onClick={() => say(ex.a.toLowerCase())}>🔊 Ouvir a palavra</button>}
        </div>
      </div>
      <div className="slots" aria-label="Sua palavra">
        {bank.map((_, pos) => {
          const i = picked[pos];
          return i === undefined
            ? <span key={pos} className="slot" />
            : <button key={pos} className="slot full" disabled={locked} onClick={() => setPicked(picked.filter((_, j) => j !== pos))}>{bank[i]}</button>;
        })}
      </div>
      <p className="small mute" style={{ textAlign: 'center' }}>{bank.length} letras · toque numa letra para colocar, toque de novo para tirar</p>
      <div className="bank letters">
        {bank.map((l, i) => <button key={i} className={`tile${picked.includes(i) ? ' ghost' : ''}`} disabled={locked} onClick={() => { sfx.tap(); setPicked([...picked, i]); }}>{l}</button>)}
      </div>
    </>
  );
}

/* ───── colocar em ordem ───── */
function Order({ ex, locked, setCheck }: ExProps) {
  if (ex.t !== 'order') return null;
  const bank = ex.bank!;
  const [picked, setPicked] = useState<number[]>([]);
  useEffect(() => {
    setCheck(picked.length === bank.length ? () => ({ ok: picked.map((i) => bank[i]).join('|') === ex.a.join('|'), answer: ex.a.join(' → ') }) : null);
  }, [picked.join(',')]);
  return (
    <>
      <div className="answerline">
        {picked.map((i, pos) => <button key={pos} className="tile" disabled={locked} onClick={() => setPicked(picked.filter((_, j) => j !== pos))}><small className="mute">{pos + 1}.</small> {bank[i]}</button>)}
      </div>
      <div className="bank">
        {bank.map((w, i) => <button key={i} className={`tile${picked.includes(i) ? ' ghost' : ''}`} disabled={locked} onClick={() => { say(w); setPicked([...picked, i]); }}>{w}</button>)}
      </div>
    </>
  );
}

/* ───── separar em grupos ───── */
function Sort({ ex, locked, setCheck }: ExProps) {
  if (ex.t !== 'sort') return null;
  const items = ex.bank!;
  const [place, setPlace] = useState<Record<string, number>>({});
  const [cur, setCur] = useState<string | null>(null);
  const left = items.filter((w) => place[w] === undefined);
  useEffect(() => {
    setCheck(left.length === 0 ? () => ({ ok: ex.groups.every(([, ws], gi) => ws.every((w) => place[w] === gi)), answer: ex.groups.map(([g, ws]) => `${g}: ${ws.join(', ')}`).join(' · ') }) : null);
  }, [JSON.stringify(place)]);
  return (
    <>
      <p className="small mute">Toque numa palavra e depois no grupo certo.</p>
      <div className="bank">
        {left.map((w) => <button key={w} className={`tile${cur === w ? ' sel' : ''}`} disabled={locked} onClick={() => { say(w); setCur(w); }}>{w}</button>)}
      </div>
      <div className="sortbox">
        {ex.groups.map(([label], gi) => (
          <div key={label} className="sortcol">
            <h4>{label}</h4>
            {cur && <button className="target" onClick={() => { setPlace({ ...place, [cur]: gi }); setCur(null); sfx.tap(); }}>+ colocar aqui</button>}
            {items.filter((w) => place[w] === gi).map((w) => (
              <button key={w} className="tile" disabled={locked} onClick={() => { const n = { ...place }; delete n[w]; setPlace(n); }}>{w}</button>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

/* ───── escrever ───── */
function TypeIn({ ex, locked, setCheck }: ExProps) {
  if (ex.t !== 'type') return null;
  const [v, setV] = useState('');
  useEffect(() => { setCheck(norm(v) ? () => ({ ok: sameAnswer(v, ex.a, ex.alt), answer: ex.a }) : null); }, [v]);
  return (
    <>
      {!/^Crossword/.test(ex.q) && <div className="say" style={{ fontSize: /^\P{L}+$/u.test(ex.q.replace(/\s*=\s*\?$/, '')) && !/\d/.test(ex.q) ? 72 : 30, textAlign: 'center', fontFamily: 'var(--f-display)', fontWeight: 800 }}>{ex.q.replace(/\s*=\s*\?$/, '')}</div>}
      <input className="typein" autoFocus autoCapitalize="none" autoComplete="off" spellCheck={false} disabled={locked} value={v} onChange={(e) => setV(e.target.value)} placeholder="Escreva em inglês" aria-label="Sua resposta" />
    </>
  );
}
