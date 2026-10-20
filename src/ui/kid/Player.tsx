import { useEffect, useMemo, useRef, useState } from 'react';
import { tomb, draftTomb } from '../../store/merge';
import { useApp } from '../../state';
import { findLesson, unitById, REVIEWS, allLessons, type Lesson } from '../../content';
import { buildQuiz, buildExam, prepareLesson, prepareItem, type KeyMap, type Prepared } from '../../engine/session';
import { itemById } from '../../content';
import { HEARTS, lessonXp, STICKERS } from '../../engine/game';
import { letter, LETTER_TEXT, stars as starsOf, toPoints } from '../../engine/grade';
import { Exercise, TYPE_LABEL, type Verdict } from './Exercises';
import { LetterBadge, RefTag, StarBurst } from '../common';
import { say, stopVoice, setDefaultSpeaker } from '../../lib/speech';
import { sfx } from '../../lib/sound';
import { askFor } from '../../content/instructions';
import { helpFor } from '../../content/help';
import { Mascot } from '../Mascot';
import { LessonPage } from './LessonPage';
import { openApostila, setBookOwner, pageSrc } from '../Apostila';

const PRAISE = ['Muito bom!', 'Parabéns!', 'Ótimo!', 'Mandou bem!', 'Arrasou!', 'Isso aí!', 'Incrível!', 'Perfeito!', 'Great job!', 'Excellent!', 'Well done!', 'Super!'];
const AUTO_NEXT = 3;

export function Player({ studentId, unitId, lessonId, mode, withTeacher }: { studentId: string; unitId: number; lessonId: string; mode: 'lesson' | 'quiz'; withTeacher?: boolean }) {
  const { db, go, saveResult, update } = useApp();
  const exam = lessonId.startsWith('exam-') ? db.exams?.find((e) => `exam-${e.id}` === lessonId) : undefined;
  const quizId = exam ? lessonId : `quiz-u${unitId}`;
  const quizName = exam ? exam.title : `Provinha da Unit ${unitId}`;
  const draftKey = `${studentId}:${mode === 'quiz' ? quizId : lessonId}`;
  const draft = db.drafts?.[draftKey];
  const [askResume, setAskResume] = useState(!!draft && draft.idx > 0);
  const s = db.students.find((x) => x.id === studentId)!;
  const who = { name: s.name, age: s.age };
  setBookOwner(s.name, s.gender === 'm' ? '#1F5AE2' : '#E8458B');
  const keys: KeyMap = db.keys;
  const unit = unitById(unitId);
  const found = mode === 'lesson' ? findLesson(lessonId) : null;
  const lesson: Lesson | null = found?.lesson ?? null;
  const reviewColor = REVIEWS.find((r) => r.lesson.id === lessonId)?.color;

  const items = useMemo<Prepared[]>(() => (mode === 'quiz' ? (exam ? buildExam(exam.itemIds, who, keys) : buildQuiz(unit, who, keys)) : prepareLesson(lesson!, unitId, who, keys)), [lessonId, mode]);
  const [phase, setPhase] = useState<'page' | 'play' | 'out' | 'end'>(mode === 'lesson' ? 'page' : 'play');
  const [queue, setQueue] = useState<Prepared[]>(items);
  const [idx, setIdx] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [hearts, setHearts] = useState(HEARTS);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [checkFn, setCheckFn] = useState<(() => Verdict) | null>(null);
  const [praise, setPraise] = useState(PRAISE[0]);
  const [count, setCount] = useState(0);
  const [help, setHelp] = useState(false);
  const [nonce, setNonce] = useState(0);
  const firstTry = useRef<Record<string, boolean>>({});
  const missed = useRef<Set<string>>(new Set());
  const mistakes = useRef(0);
  const started = useRef(Date.now());
  const [summary, setSummary] = useState<{ points: number; xp: number; stars: 1 | 2 | 3; stickers: string[]; streak: number; unitDone?: boolean } | null>(null);

  const total = items.length;
  const doneCount = Object.keys(firstTry.current).length;
  const ex = queue[idx];
  // Modo de teste automático (só com ?test no endereço): expõe a resposta para o robô de testes.
  if (typeof location !== 'undefined' && location.search.includes('test') && ex) (window as any).__answer = phase === 'play' ? ex : null;
  const exit = () => { stopVoice(); go({ name: 'kid', studentId, withTeacher }); };
  const all = allLessons();
  const pos = all.findIndex((x) => x.lesson.id === lessonId);
  const nextRaw = mode === 'lesson' && pos >= 0 ? all[pos + 1] : undefined;
  // fora do modo aula, só sugere a próxima se for da mesma unit (a próxima unit pode estar fechada)
  const nextL = nextRaw && (withTeacher || nextRaw.unitId === unitId) ? nextRaw : undefined;
  const prevL = mode === 'lesson' && pos > 0 ? all[pos - 1] : undefined;
  const openL = (x?: { unitId: number; lesson: Lesson }) => { if (!x) return; stopVoice(); go({ name: 'play', studentId, unitId: x.unitId, lessonId: x.lesson.id, mode: 'lesson', withTeacher }); };

  // contador de 3 segundos depois do acerto
  useEffect(() => {
    if (!verdict?.ok || verdict.skipped) return;
    setCount(AUTO_NEXT);
    const t = setInterval(() => setCount((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [verdict]);
  useEffect(() => { if (verdict?.ok && !verdict.skipped && count === 0) next(); }, [count]);

  const judge = (v: Verdict) => {
    if (verdict) return;
    setVerdict(v);
    setNonce((n) => n + 1);
    const id = ex.id;
    if (v.ok) { sfx.ok(); setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]); }
    else { sfx.bad(); mistakes.current++; missed.current.add(id); if (ex.t === 'fill' || ex.t === 'hear') say(v.answer); if (mode === 'lesson') setHearts((h) => h - 1); }
    if (firstTry.current[id] === undefined) firstTry.current[id] = v.ok;
  };

  const go2 = (i: number) => { setVerdict(null); setCheckFn(null); setHelp(false); setCount(0); setIdx(i); setAttempt((a) => a + 1); };
  const next = (requeue = false) => {
    if (requeue && mode === 'lesson') setQueue((q) => [...q, { ...ex }]); // errou e seguiu: volta no fim
    if (mode === 'lesson' && hearts <= 0) { setVerdict(null); return setPhase('out'); }
    if (idx + 1 >= queue.length + (requeue ? 1 : 0)) return finish();
    go2(idx + 1);
  };
  const retry = () => { setVerdict(null); setCheckFn(null); setAttempt((a) => a + 1); };
  const back = () => idx > 0 && go2(idx - 1);
  const skip = () => { if (firstTry.current[ex.id] === undefined) firstTry.current[ex.id] = true; next(); };

  const finish = () => {
    const correctFirst = Object.values(firstTry.current).filter(Boolean).length;
    const points = toPoints(correctFirst, total);
    const st = starsOf(correctFirst / total);
    const xp = mode === 'quiz' ? Math.round(points / 2) + 10 : lessonXp(correctFirst, total, mistakes.current);
    const res = saveResult(
      { studentId, lessonId: mode === 'quiz' ? quizId : lessonId, unitId, mode, total, correctFirst, mistakes: mistakes.current, points, xp, stars: st, seconds: Math.round((Date.now() - started.current) / 1000), missed: [...missed.current], withTeacher },
      lesson?.kind ?? 'quiz',
    );
    sfx.win();
    clearDraft();
    // a unit inteira ficou completa com esta lição?
    const doneIds = new Set(db.results.filter((r) => r.studentId === studentId && r.mode === 'lesson').map((r) => r.lessonId));
    if (mode === 'lesson') doneIds.add(lessonId);
    const unitDone = mode === 'lesson' && unit.lessons.every((l) => doneIds.has(l.id)) && !unit.lessons.every((l) => db.results.some((r) => r.studentId === studentId && r.lessonId === l.id));
    setSummary({ points, xp, stars: st, stickers: res.stickers, streak: res.streakDays, unitDone });
    setPhase('end');
  };

  const restart = () => {
    setQueue(items); setIdx(0); setHearts(HEARTS); setVerdict(null); setCheckFn(null); setAttempt((a) => a + 1);
    firstTry.current = {}; missed.current = new Set(); mistakes.current = 0; started.current = Date.now();
    setPhase('play');
  };

  setDefaultSpeaker(idx % 2 ? 'm' : 'f'); // alterna voz de mulher e de homem a cada exercício
  // salva o progresso para continuar depois se ela sair no meio
  useEffect(() => {
    if (phase !== 'play' || askResume) return;
    const d = { queue: queue.map((q) => q.id), idx, hearts, firstTry: { ...firstTry.current }, missed: [...missed.current], mistakes: mistakes.current, at: new Date().toISOString() };
    update((db) => ({ ...db, drafts: { ...(db.drafts ?? {}), [draftKey]: d } }));
  }, [idx, verdict, phase]);
  const clearDraft = () => update((db) => { const dr = { ...(db.drafts ?? {}) }; const old = dr[draftKey]; delete dr[draftKey]; return old ? tomb({ ...db, drafts: dr }, draftTomb(draftKey, old.at)) : { ...db, drafts: dr }; });
  const resume = () => {
    if (!draft) return setAskResume(false);
    const byId = new Map(items.map((it) => [it.id, it]));
    // provinha é sorteada: recupera as mesmas questões pelo id em toda a unit
    for (const id of draft.queue) if (!byId.has(id)) { const f = itemById(id); if (f) byId.set(id, prepareItem(f.item, f.unitId, who, keys)); }
    const q = draft.queue.map((id) => byId.get(id)).filter(Boolean) as Prepared[];
    setQueue(q.length ? q : items); setIdx(Math.min(draft.idx, q.length - 1)); setHearts(draft.hearts);
    firstTry.current = draft.firstTry; missed.current = new Set(draft.missed); mistakes.current = draft.mistakes;
    setPhase('play'); setAskResume(false);
  };
  const ask = ex ? askFor(ex, unitId) : null;
  const hp = ex && help ? helpFor(ex, unitId) : null;

  return (
    <div className={`kid kid-${s.gender}`}>
      <div className="kcol player">
        {!askResume && (phase === 'play' || phase === 'page') && (
          <div className="phead pad">
            <button className="x" onClick={exit} aria-label="Sair da lição">✕</button>
            <div className="pbar" aria-label={`${doneCount} de ${total}`}><i style={{ width: `${phase === 'page' ? 0 : (doneCount / total) * 100}%` }} /></div>
            {mode === 'lesson' ? <span className="hearts" aria-label="Vidas">❤️ {hearts}</span> : <span className="hearts" style={{ color: 'var(--ink)' }}>📝 {Math.min(idx + 1, total)}/{total}</span>}
          </div>
        )}

        {askResume && draft && (
          <div className="result pad">
            <Mascot size={140} mood="listen" say="Welcome back!" />
            <h1 style={{ fontSize: 30 }}>Você parou no meio!</h1>
            <p className="mute">Faltavam {Math.max(0, draft.queue.length - draft.idx)} exercícios em “{lesson?.title ?? quizName}”.</p>
            <button className="btn block up" onClick={resume}>Continuar de onde parei</button>
            <button className="btn block ghost" onClick={() => { clearDraft(); setAskResume(false); }}>Começar do início</button>
          </div>
        )}
        {!askResume && phase === 'page' && withTeacher && (prevL || nextL) && (
          <div className="row pad" style={{ justifyContent: 'space-between' }}>
            <button className="chipbtn" disabled={!prevL} onClick={() => openL(prevL)}>‹ {prevL?.lesson.title ?? ''}</button>
            <button className="chipbtn" disabled={!nextL} onClick={() => openL(nextL)}>{nextL?.lesson.title ?? ''} ›</button>
          </div>
        )}
        {!askResume && phase === 'page' && lesson && <LessonPage lesson={lesson} unit={unit} who={who} extraColor={reviewColor} onStart={() => setPhase('play')} />}

        {!askResume && phase === 'play' && ex && ask && (
          <>
            <div className="stage pad">
              <div className="qhead">
              <div className="col" style={{ gap: 6 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="kind">{mode === 'quiz' ? (exam ? exam.title : `Provinha · Unit ${unitId}`) : TYPE_LABEL[ex.t]}</span>
                  <div className="row" style={{ gap: 6 }}>
                    {idx > 0 && <button className="chipbtn" onClick={back} aria-label="Voltar ao exercício anterior">‹ Voltar</button>}
                    {mode === 'lesson' && <button className="chipbtn help" onClick={() => setHelp(!help)} aria-expanded={help}>💡 Ajuda</button>}
                    {withTeacher && <button className="chipbtn" onClick={skip}>Pular ›</button>}
                  </div>
                </div>
                <h2 className="q" lang="en">{ask.en}</h2>
                <p className="qpt">{ask.pt}</p>
                <RefTag r={ex.ref} />
              </div>
              {hp && (
                <div className="helpbox" role="region" aria-label="Ajuda">
                  <div className="row" style={{ justifyContent: 'space-between' }}><b>Relembre na apostila</b>{ex.ref && <button className="chipbtn" onClick={() => openApostila(ex.ref!.pdf)}>📖 Abrir a página {ex.ref.printed ? ex.ref.printed : ''}</button>}</div>
                  <div className="hvocab">{hp.vocab.map((v) => <button key={v.en} onClick={() => say(v.en)}>{v.emoji} <b lang="en">{v.en}</b> = {v.pt}</button>)}</div>
                  {hp.examples.length > 0 && (
                    <div className="hex">
                      <small>Na história:</small>
                      {hp.examples.map((e, i) => <button key={i} onClick={() => say(e.text)}>“{e.text}”{e.who ? ` — ${e.who}` : ''} <span className="mute">({e.from})</span></button>)}
                    </div>
                  )}
                  {hp.tip && <p className="small">💡 {hp.tip}</p>}
                </div>
              )}
              {ex.ref && (
                <button className="qpage" onClick={() => openApostila(ex.ref!.pdf)} aria-label="Abrir a página da apostila">
                  <img src={pageSrc(ex.ref.pdf)} alt="" loading="lazy" />
                  <span>📖 Página da apostila{ex.ref.printed ? ` ${ex.ref.printed}` : ''}</span>
                </button>
              )}
              </div>
              <div className="qbody">
                {ask.scene && (
                  <div className="scene" lang="en">
                    <b>{ask.scene.en}</b>
                    {ask.scene.pt && <span lang="pt-BR">{ask.scene.pt}</span>}
                  </div>
                )}
                <Exercise key={`${ex.id}-${idx}-${attempt}`} ex={ex} locked={!!verdict} setCheck={(fn) => setCheckFn(() => fn)} done={judge} withTeacher={withTeacher} />
              </div>
            </div>
            <div className={`pfoot pad${verdict ? (verdict.ok ? ' good' : ' bad') : ''}`}>
              <Mascot size={72} mood={verdict ? (verdict.ok ? 'happy' : 'sad') : ex.t === 'hear' || (ex.t === 'fill' && ex.listen) ? 'listen' : 'idle'} nonce={nonce} />
              {verdict && (
                <div className="fb" role="status">
                  <span className={verdict.ok ? 'praise' : ''}>{verdict.ok ? (verdict.skipped ? 'Ok!' : praise) : 'Quase! Vamos de novo?'}</span>
                  {!verdict.ok && <small>Resposta certa: <b>{verdict.answer}</b></small>}
                  {verdict.ok && verdict.skipped && <small>Tudo bem, a gente treina na aula.</small>}
                </div>
              )}
              {verdict ? (
                verdict.ok ? (
                  <div className="row">
                    {idx > 0 && <button className="btn ghost" onClick={back} aria-label="Voltar ao exercício anterior">‹</button>}
                    <button className="btn block up ok grow" onClick={() => next()} autoFocus>Continuar{count > 0 && !verdict.skipped ? ` (${count})` : ''}</button>
                  </div>
                ) : (
                  <div className="row">
                    <button className="btn ghost grow" onClick={() => next(true)}>Continuar</button>
                    <button className="btn up red grow" onClick={retry} autoFocus>↺ Tentar de novo</button>
                  </div>
                )
              ) : ex.t === 'match' ? (
                <button className="btn block ghost up" onClick={() => judge({ ok: true, answer: '', skipped: true })}>Pular</button>
              ) : ex.t === 'speak' ? null : (
                <button className="btn block up ok" disabled={!checkFn} onClick={() => checkFn && judge(checkFn())}>Verificar</button>
              )}
            </div>
          </>
        )}

        {phase === 'out' && (
          <div className="result pad">
            <Mascot size={150} mood="sad" say="Let's try again!" />
            <h1>Acabaram as vidas</h1>
            <p className="mute">Tudo bem, {s.name}! Errar faz parte de aprender. Vamos de novo? Você já sabe mais que antes.</p>
            <button className="btn block up" onClick={restart}>Tentar de novo</button>
            <button className="link" onClick={exit}>Voltar para a trilha</button>
          </div>
        )}

        {phase === 'end' && summary && (
          <div className="result pad">
            <StarBurst big={summary.unitDone} />
            {summary.unitDone && (
              <div className="unitdone" style={{ background: unit.color }}>
                <span className="trophy">🏆</span>
                <b>Unit {unit.id} completa!</b>
                <span>{unit.title} · todas as lições feitas. Agora é a provinha com a {db.settings.teacherName}!</span>
              </div>
            )}
            <Mascot size={150} mood="cheer" say={summary.unitDone ? 'Unit complete!' : summary.stars === 3 ? 'Woof! Perfect!' : 'Good job!'} />
            <div className="bigstars" aria-label={`${summary.stars} estrelas`}>
              {[1, 2, 3].map((i) => <span key={i} className={i <= summary.stars ? '' : 'off'}>⭐</span>)}
            </div>
            <h1>{mode === 'quiz' ? (exam ? 'Prova feita!' : 'Provinha feita!') : 'Lição completa!'}</h1>
            <p style={{ fontSize: 18, fontWeight: 700 }}>{summary.stars === 3 ? `Incrível, ${s.name}!` : summary.stars === 2 ? `Muito bem, ${s.name}!` : `Boa, ${s.name}! Vamos treinar mais?`}</p>
            <div className="rchips">
              <div className="rchip" style={{ borderColor: 'var(--yellow)', color: '#8A6400' }}><span>XP</span><b>+{summary.xp}</b></div>
              <div className="rchip" style={{ borderColor: '#19B98E', color: 'var(--ok)' }}><span>Pontos</span><b>{summary.points}</b></div>
              <div className="rchip" style={{ borderColor: 'var(--coral)', color: 'var(--bad)' }}><span>Sequência</span><b>🔥{summary.streak}</b></div>
            </div>
            {mode === 'quiz' && (
              <div className="gradecard" style={{ width: '100%' }}>
                <LetterBadge points={summary.points} scale={db.settings.scale} />
                <div className="grow" style={{ textAlign: 'left' }}><b>Nota {letter(summary.points, db.settings.scale)} · {summary.points} pontos</b><p className="small mute">{LETTER_TEXT[letter(summary.points, db.settings.scale)]} A nota já foi para a Camila.</p></div>
              </div>
            )}
            {summary.stickers.length > 0 && (
              <div className="classnote" style={{ background: 'var(--yellow)', color: 'var(--ink)' }}>
                <small style={{ color: 'var(--ink)' }}>Figurinha nova!</small>
                <b style={{ fontSize: 20 }}>{summary.stickers.map((id) => { const st = STICKERS.find((x) => x.id === id); return `${st?.emoji} ${st?.label}`; }).join('  ·  ')}</b>
              </div>
            )}
            {nextL ? (
              <div className="row" style={{ width: '100%' }}>
                <button className="btn ghost" onClick={exit}>Trilha</button>
                <button className="btn up grow" onClick={() => openL(nextL)}>Próxima: {nextL.lesson.title} ›</button>
              </div>
            ) : <button className="btn block up" onClick={exit}>Continuar</button>}
          </div>
        )}
      </div>
    </div>
  );
}
