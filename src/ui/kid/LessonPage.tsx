// A "página da apostila" que abre antes dos exercícios: cada tipo de lição tem um desenho próprio.
import { useEffect, useRef, useState } from 'react';
import type { Lesson, Unit, StoryLine, Ex } from '../../content/types';
import { itemsWithIds } from '../../content';
import { askFor } from '../../content/instructions';
import { personalizeDeep, type Who } from '../../engine/personalize';
import { KIND_LABEL } from '../../content';
import { RefTag } from '../common';
import { say, sayLines, stopVoice, type Speaker } from '../../lib/speech';
import { Mascot } from '../Mascot';

// Personagens da apostila, com voz de homem, mulher, menino ou menina.
const CAST: Record<string, { face: string; side: 'l' | 'r'; v: Speaker }> = {
  Leo: { face: '👦', side: 'l', v: 'boy' }, Maya: { face: '👧', side: 'r', v: 'girl' }, Teacher: { face: '👩‍🏫', side: 'r', v: 'f' }, Class: { face: '🧒', side: 'l', v: 'boy' },
  'Mrs. Brown': { face: '👵', side: 'r', v: 'f' }, Coach: { face: '🧢', side: 'r', v: 'm' }, Mum: { face: '👩', side: 'r', v: 'f' }, Butterfly: { face: '🦋', side: 'r', v: 'girl' },
  'Zoo keeper': { face: '🧑‍🌾', side: 'r', v: 'm' }, 'Leo & Maya': { face: '👦👧', side: 'l', v: 'boy' }, Student: { face: '🙋', side: 'l', v: 'girl' }, You: { face: '🙋', side: 'l', v: 'girl' },
};
const voiceOf = (l: StoryLine): Speaker => (l.who ? CAST[l.who]?.v ?? 'f' : 'm'); // narrador: voz masculina

export function Comic({ title, lines, color }: { title: string; lines: StoryLine[]; color: string }) {
  const [cur, setCur] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const stop = useRef<() => void>(() => {});
  useEffect(() => () => stop.current(), []);
  const playAll = () => {
    stop.current();
    setPlaying(true);
    stop.current = sayLines(lines.map((l) => l.text), (i) => setCur(i), () => { setPlaying(false); setCur(null); }, lines.map(voiceOf));
  };
  const halt = () => { stop.current(); setPlaying(false); setCur(null); };
  const one = (i: number) => { stop.current(); setPlaying(false); setCur(i); say(lines[i].text, { who: voiceOf(lines[i]) }); };
  return (
    <div className="comic" style={{ ['--uc' as string]: color }}>
      <div className="comic-head">
        <h3>{title}</h3>
        <button className={`btn sm ${playing ? 'red' : ''}`} onClick={playing ? halt : playAll}>{playing ? '■ Parar' : '▶ Ouvir a história'}</button>
      </div>
      <div className="comic-body">
        {lines.map((l, i) => {
          const c = l.who ? CAST[l.who] ?? { face: '🙂', side: 'r' as const, v: 'f' as Speaker } : null;
          if (!c) return <button key={i} className={`narr${cur === i ? ' on' : ''}`} onClick={() => one(i)}>{l.text}</button>;
          return (
            <button key={i} className={`speech ${c.side}${cur === i ? ' on' : ''}`} onClick={() => one(i)}>
              <span className="face" aria-hidden="true">{c.face}</span>
              <span className="bubble2"><b>{l.who}</b>{l.text}</span>
            </button>
          );
        })}
      </div>
      <p className="small mute" style={{ textAlign: 'center' }}>Toque num balão para ouvir só aquela frase.</p>
    </div>
  );
}

/** "Como fazer": a professora resolve 2 ou 3 exercícios da própria lição antes da criança tentar. */
function Examples({ lesson, unit, who }: { lesson: Lesson; unit: Unit; who: Who }) {
  const items = itemsWithIds(lesson).map((it) => personalizeDeep(it, who));
  const picked: Ex[] = [];
  const seen = new Set<string>();
  for (const it of items) { if (it.t === 'speak' || seen.has(it.t)) continue; seen.add(it.t); picked.push(it); if (picked.length === 3) break; }
  if (!picked.length) return null;
  const row = (it: Ex, i: number) => {
    const ask = askFor(it, unit.id);
    let body: React.ReactNode = null, audio = '';
    switch (it.t) {
      case 'match': body = it.pairs.slice(0, 2).map((p) => <div key={p[0]} className="exline"><b lang="en">{p[0]}</b> ➜ {p[1]}</div>); audio = it.pairs[0][0]; break;
      case 'build': body = <div className="exline">{it.q} ➜ <b>{it.a}</b></div>; audio = it.dir === 'pe' ? it.a : it.q; break;
      case 'fill': { const [a, b] = it.q.split('___'); body = <div className="exline" lang="en">{a}<mark>{it.a}</mark>{b}</div>; audio = it.q.replace('___', it.a); break; }
      case 'choice': body = <div className="exline">{it.q} ➜ <b>{it.a}</b></div>; audio = /[a-z]{3}/i.test(it.a) ? it.a : ''; break;
      case 'pic': body = <div className="exline"><span style={{ fontSize: 26 }}>{it.emoji}</span> ➜ <b lang="en">{it.a}</b></div>; audio = it.a; break;
      case 'hear': body = <div className="exline">🔊 ouvi <b>{it.say ?? it.a}</b> ➜ toco em <b>{it.a}</b></div>; audio = it.say ?? it.a; break;
      case 'scramble': body = <div className="exline">{it.a.split('').sort().join(' ')} ➜ <b>{it.a}</b></div>; audio = it.a.toLowerCase(); break;
      case 'order': body = <div className="exline">{it.a.slice(0, 3).join(' → ')} …</div>; audio = it.a.slice(0, 3).join(', '); break;
      case 'sort': body = <div className="exline">{it.groups.map((g) => `${g[0]}: ${g[1].slice(0, 2).join(', ')}`).join('  ·  ')}</div>; break;
      case 'type': body = <div className="exline">{it.q.replace(/\s*=\s*\?$/, '')} ➜ <b>{it.a}</b></div>; audio = it.a; break;
    }
    return (
      <div key={i} className="excard">
        <span className="exn">{i + 1}</span>
        <div className="grow">
          <p className="exq"><span lang="en">{ask.en}</span> <span className="mute">· {ask.pt}</span></p>
          {body}
        </div>
        {audio && <button className="chipbtn" onClick={() => say(audio)} aria-label="Ouvir o exemplo">🔊</button>}
      </div>
    );
  };
  return (
    <div className="examples">
      <div className="row" style={{ gap: 8 }}><span style={{ fontSize: 22 }}>👩‍🏫</span><b>Como fazer — veja a Camila resolvendo</b></div>
      {picked.map(row)}
      <p className="small mute">Agora é a sua vez! Os exercícios são parecidos com estes.</p>
    </div>
  );
}

export function LessonPage({ lesson, unit, onStart, extraColor, who }: { lesson: Lesson; unit: Unit; onStart: () => void; extraColor?: string; who: Who }) {
  const color = extraColor ?? unit.color;
  useEffect(() => () => stopVoice(), []);
  return (
    <>
      <div className="stage lpage pad">
        <div className="pagehead" style={{ background: color }}>
          <span>Unit {String(unit.id).padStart(2, '0')} · {KIND_LABEL[lesson.kind]}</span>
          <h2>{lesson.title}</h2>
          <span className="pg">{lesson.ref.printed ? `Apostila p. ${lesson.ref.printed}` : `Apostila · ${lesson.ref.section}`}</span>
        </div>

        {lesson.kind === 'vocab' && (
          <>
            <p className="qpt">Toque em cada cartão para ouvir. Depois repita em voz alta!</p>
            <div className="vgrid">
              {unit.vocab.map((v) => (
                <button key={v.en} className="vcard" style={{ borderColor: color }} onClick={() => say(v.en)}>
                  {v.emoji && <span className="ve" aria-hidden="true">{v.emoji}</span>}
                  <b lang="en">{v.en}</b>
                  <span>{v.pt}</span>
                </button>
              ))}
            </div>
            <div className="tipcard">💡 <b>Teacher tip:</b> {unit.teacherTip}</div>
          </>
        )}

        {lesson.story && <Comic title={lesson.story.title} lines={lesson.story.lines} color={color} />}

        {lesson.kind === 'translate' && (
          <div className="sheetcard">
            <b>💬 {lesson.title}</b>
            <p>Na folha da apostila você escreve a tradução na linha. Aqui você monta a frase com as peças: português → inglês e inglês → português.</p>
          </div>
        )}

        {lesson.kind === 'homework' && (
          <div className="sheetcard home">
            <b>👨‍👩‍👧 Tarefa em casa — para os pais</b>
            <p>{unit.parentNote}</p>
          </div>
        )}

        <Examples lesson={lesson} unit={unit} who={who} />

        {lesson.classActivity && (
          <div className="classnote">
            <small>Na sala com a Camila · {lesson.classActivity.title}</small>
            <span>{lesson.classActivity.text}</span>
          </div>
        )}
        <RefTag r={lesson.ref} />
      </div>
      <div className="pfoot lstart pad">
        <Mascot size={72} say={lesson.kind === 'read' ? 'Story time!' : "Let's practice!"} />
        <button className="btn block up" onClick={() => { stopVoice(); onStart(); }}>Começar os exercícios</button>
      </div>
    </>
  );
}
