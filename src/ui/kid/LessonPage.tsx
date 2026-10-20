// A "página da apostila" que abre antes dos exercícios: cada tipo de lição tem um desenho próprio.
import { useEffect, useRef, useState } from 'react';
import type { Lesson, Unit, StoryLine } from '../../content/types';
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

export function LessonPage({ lesson, unit, onStart, extraColor }: { lesson: Lesson; unit: Unit; onStart: () => void; extraColor?: string }) {
  const color = extraColor ?? unit.color;
  useEffect(() => () => stopVoice(), []);
  return (
    <>
      <div className="stage pad">
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

        {lesson.classActivity && (
          <div className="classnote">
            <small>Na sala com a Camila · {lesson.classActivity.title}</small>
            <span>{lesson.classActivity.text}</span>
          </div>
        )}
        <RefTag r={lesson.ref} />
      </div>
      <div className="pfoot pad">
        <Mascot size={72} say={lesson.kind === 'read' ? 'Story time!' : "Let's practice!"} />
        <button className="btn block up" onClick={() => { stopVoice(); onStart(); }}>Começar os exercícios</button>
      </div>
    </>
  );
}
