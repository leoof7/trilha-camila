import { useApp, studentXp } from '../../state';
import { UNITS, REVIEWS, FUN_ZONE, KIND_ICON, KIND_LABEL, type Lesson } from '../../content';
import { levelOf, streak, STICKERS, DAILY_GOAL, dayKey } from '../../engine/game';
import { Avatar, LetterBadge, fmtDate } from '../common';
import { Mascot } from '../Mascot';
import { useState } from 'react';
import { Modal } from '../common';
import { ApostilaShelf } from '../Apostila';
import { bestQuiz, bestStars, lessonDone, nextLesson, unitOpen, unitProgress } from './progress';
import { letter, LETTER_TEXT, average } from '../../engine/grade';

export function KidHome({ studentId, tab = 'trail', withTeacher }: { studentId: string; tab?: 'trail' | 'album' | 'me' | 'book'; withTeacher?: boolean }) {
  const { db, go } = useApp();
  const s = db.students.find((x) => x.id === studentId);
  if (!s) return null;
  const xp = studentXp(db, s.id);
  const lv = levelOf(xp);
  const st = streak(db.studyDays[s.id] ?? []);
    const setTab = (t: 'trail' | 'album' | 'me' | 'book') => go({ name: 'kid', studentId, tab: t, withTeacher });

  return (
    <div className={`kid kid-${s.gender}`}>
      <div className="kcol">
        <header className="ktop pad">
          <div className="row">
            <Avatar s={s} size={46} />
            <div className="grow">
              <div className="hello">Hi, {s.name}!</div>
              <div className="lv">{lv.emoji} {lv.name}{lv.next ? ` · faltam ${lv.next.xp - xp} XP para ${lv.next.name}` : ''}</div>
            </div>
            <button className="btn sm ghost" style={{ background: 'rgba(255,255,255,.2)', color: '#fff', border: 0, boxShadow: 'none' }} onClick={() => go({ name: 'profiles' })} aria-label="Trocar de perfil">Sair</button>
          </div>
          <div className="xpbar" aria-hidden="true"><i style={{ width: `${lv.pct * 100}%` }} /></div>
          <div className="chips">
            <span className="chip" title="Dias seguidos">🔥 {st} {st === 1 ? 'dia' : 'dias'}</span>
            <span className="chip" title="Pontos de experiência">⭐ {xp} XP</span>
            <span className="chip" title="Figurinhas">🏅 {db.stickers.filter((x) => x.studentId === s.id).length}</span>
          </div>
        </header>
        <nav className="ktabs" aria-label="Seções">
          <button aria-current={tab === 'trail'} onClick={() => setTab('trail')}><span>🗺️</span>Trilha</button>
          <button aria-current={tab === 'book'} onClick={() => setTab('book')}><span>📖</span>Apostila</button>
          <button aria-current={tab === 'album'} onClick={() => setTab('album')}><span>🏅</span>Figurinhas</button>
          <button aria-current={tab === 'me'} onClick={() => setTab('me')}><span>📒</span>Minhas notas</button>
        </nav>

        {tab === 'trail' && <Trail studentId={s.id} withTeacher={withTeacher} todayN={db.results.filter((r) => r.studentId === s.id && r.date === dayKey()).length} />}
        {tab === 'album' && <Album studentId={s.id} />}
        {tab === 'me' && <Me studentId={s.id} />}
        {tab === 'book' && <main className="me pad"><ApostilaShelf name={s.name} color={s.gender === 'm' ? '#1F5AE2' : '#E8458B'} /></main>}

      </div>
    </div>
  );
}

function Trail({ studentId, withTeacher, todayN }: { studentId: string; withTeacher?: boolean; todayN: number }) {
  const { db, go } = useApp();
  const nxt = nextLesson(db, studentId);
  const play = (unitId: number, lessonId: string, mode: 'lesson' | 'quiz' = 'lesson') => go({ name: 'play', studentId, unitId, lessonId, mode, withTeacher });

  const nodeFor = (unitId: number, l: Lesson, i: number, open: boolean, color: string) => {
    const done = lessonDone(db, studentId, l.id);
    const isNext = nxt?.lessonId === l.id;
    const offs = [0, 46, 70, 46, 0, -46, -70][i % 7];
    return (
      <div key={l.id} className="node-wrap" style={{ transform: `translateX(${offs}px)` }}>
        <button
          className={`node ${open ? (done ? 'done' : 'todo') : 'lock'}${isNext ? ' next' : ''}`}
          style={{ background: done ? color : open ? color : undefined, opacity: open && !done && !isNext ? 0.75 : 1 }}
          disabled={!open}
          onClick={() => play(unitId, l.id)}
          aria-label={`${l.title}${done ? ', feita' : ''}`}
        >
          {done ? '✓' : KIND_ICON[l.kind]}
        </button>
        <div className="node-info">
          <b>{l.title}</b>
          <span>{KIND_LABEL[l.kind]} · {l.ref.printed ? `p. ${l.ref.printed}` : 'Apostila'}</span>
          {done && <div className="starrow" aria-label={`${bestStars(db, studentId, l.id)} estrelas`}>{'⭐'.repeat(bestStars(db, studentId, l.id))}</div>}
        </div>
      </div>
    );
  };

  const [quizAsk, setQuizAsk] = useState<number | null>(null);
  return (
    <main className="pad">
      {quizAsk !== null && <QuizGate unitId={quizAsk} onClose={() => setQuizAsk(null)} onOk={() => { const u = quizAsk; setQuizAsk(null); play(u, `quiz-u${u}`, 'quiz'); }} />}
      {withTeacher && <div className="withteacher">👩‍🏫 Aula com a Camila: os exercícios de fala são avaliados por ela.</div>}
      <div className="mission">
        <Mascot size={78} mood={todayN >= DAILY_GOAL ? 'cheer' : 'idle'} />
        <div className="grow">
          <b>Missão de hoje</b>
          <p className="small mute">{todayN >= DAILY_GOAL ? 'Missão cumprida! Você é demais! 🎉' : `Faça ${DAILY_GOAL} atividades hoje. Faltam ${DAILY_GOAL - todayN}.`}</p>
          <div className="dots" aria-label={`${Math.min(todayN, DAILY_GOAL)} de ${DAILY_GOAL}`}>{Array.from({ length: DAILY_GOAL }).map((_, i) => <i key={i} className={i < todayN ? 'on' : ''}>{i < todayN ? '★' : i + 1}</i>)}</div>
        </div>
        {nxt && <button className="btn sm up" onClick={() => play(nxt.unitId, nxt.lessonId)}>Começar</button>}
      </div>

      <div className="trail">
        {UNITS.map((u) => {
          const open = !!withTeacher || unitOpen(db, studentId, u.id); // professora: tudo liberado
          const prog = unitProgress(db, studentId, u.id);
          const quiz = bestQuiz(db, studentId, u.id);
          const quizOpen = open; // provinha: sempre com a professora (modo aula ou senha)
          const rv = REVIEWS.find((r) => r.afterUnit === u.id);
          return (
            <section key={u.id} className="col" style={{ gap: 18 }}>
              <div className={`uband${open ? '' : ' locked'}`} style={{ background: u.color }}>
                <div>
                  <small>Unit {String(u.id).padStart(2, '0')} · {open ? `${prog.done}/${prog.total} lições` : 'bloqueada'}</small>
                  <h2>{u.title}</h2>
                </div>
                <span className="uemoji" aria-hidden="true">{open ? u.emoji : '🔒'}</span>
              </div>
              {open && (
                <div className="nodes">
                  {u.lessons.map((l, i) => nodeFor(u.id, l, i, true, u.color))}
                  <button className={`quiznode${quizOpen ? '' : ' lock'}`} style={{ borderColor: u.color }} disabled={!quizOpen} onClick={() => (withTeacher ? play(u.id, `quiz-u${u.id}`, 'quiz') : setQuizAsk(u.id))}>
                    <span className="big">{quiz ? '🏆' : '📝'}</span>
                    <span className="grow">
                      <b>Provinha da Unit {u.id}</b>
                      <span className="small mute" style={{ display: 'block' }}>
                        {quiz ? `Melhor nota: ${quiz.points} pontos` : withTeacher ? '10 questões · vale nota!' : '🔒 Só com a professora'}
                      </span>
                    </span>
                    {quiz && <LetterBadge points={quiz.points} scale={db.settings.scale} sm />}
                  </button>
                </div>
              )}
              {rv && (
                <>
                  <div className={`uband${open && unitOpen(db, studentId, rv.afterUnit) ? '' : ' locked'}`} style={{ background: rv.color }}>
                    <div><small>Review</small><h2>{rv.title}</h2></div><span className="uemoji">🔄</span>
                  </div>
                  {open && <div className="nodes">{nodeFor(u.id, rv.lesson, 0, !!withTeacher || prog.done >= prog.total - 1, rv.color)}</div>}
                </>
              )}
            </section>
          );
        })}
        <div className="uband" style={{ background: '#FF5C5C' }}><div><small>Fun Zone</small><h2>Game Time!</h2></div><span className="uemoji">🎮</span></div>
        <div className="nodes">{nodeFor(11, FUN_ZONE, 0, !!withTeacher || unitOpen(db, studentId, 6), '#FF5C5C')}</div>
      </div>
    </main>
  );
}

function Album({ studentId }: { studentId: string }) {
  const { db } = useApp();
  const mine = db.stickers.filter((x) => x.studentId === studentId);
  return (
    <main className="album pad">
      <h2 style={{ fontSize: 26 }}>Meu álbum de figurinhas</h2>
      <p className="mute">Ganhe figurinhas fazendo lições sem erro, lendo histórias e usando frases em inglês na aula com a Camila.</p>
      <div className="sgrid">
        {STICKERS.map((st) => {
          const n = mine.filter((m) => m.sticker === st.id).length;
          return (
            <div key={st.id}>
              <div className={`sticker${n ? ' got' : ''}`}>{st.emoji}{n > 1 && <em>×{n}</em>}</div>
              <div className="slabel">{st.label}</div>
            </div>
          );
        })}
      </div>
      {mine.length > 0 && (
        <div className="col" style={{ gap: 6 }}>
          <h3>Últimas conquistas</h3>
          {mine.slice(-5).reverse().map((m) => {
            const st = STICKERS.find((x) => x.id === m.sticker);
            return <p key={m.id} className="small">{st?.emoji} <b>{st?.label}</b> · {fmtDate(m.date)}{m.by === 'camila' ? ' · dada pela Camila 💛' : ''}</p>;
          })}
        </div>
      )}
    </main>
  );
}

function Me({ studentId }: { studentId: string }) {
  const { db } = useApp();
  const grades = db.grades.filter((g) => g.studentId === studentId).sort((a, b) => b.date.localeCompare(a.date));
  const avg = average(grades.map((g) => g.points));
  const goals = db.goals.filter((g) => g.studentId === studentId && !g.done);
  const fb = db.feedback.filter((f) => f.studentId === studentId);
  return (
    <main className="me pad">
      <h2 style={{ fontSize: 26 }}>Minhas notas</h2>
      {avg !== null ? (
        <div className="gradecard" style={{ borderColor: 'var(--t)' }}>
          <LetterBadge points={avg} scale={db.settings.scale} />
          <div className="grow"><b style={{ fontSize: 18 }}>Média: {avg} pontos</b><p className="small mute">{LETTER_TEXT[letter(avg, db.settings.scale)]}</p></div>
        </div>
      ) : (
        <p className="mute">Faça a primeira provinha para ganhar sua nota!</p>
      )}
      {goals.length > 0 && (
        <div className="col" style={{ gap: 8 }}>
          <h3>🎯 Meus próximos objetivos</h3>
          {goals.map((g) => <div key={g.id} className="gradecard"><span style={{ fontSize: 26 }}>🎯</span><div className="grow"><b>Unit {g.unitId}</b><p className="small">{g.text}</p></div></div>)}
        </div>
      )}
      {fb.length > 0 && (
        <div className="col" style={{ gap: 8 }}>
          <h3>Teacher's feedback</h3>
          {fb.map((f) => <div key={f.unitId} className="gradecard"><b>Unit {f.unitId}</b><span className="grow">{'⭐'.repeat(f.stars)}</span>{f.note && <span className="small mute">{f.note}</span>}</div>)}
        </div>
      )}
      <div className="col" style={{ gap: 8 }}>
        {grades.map((g) => (
          <div key={g.id} className="gradecard">
            <LetterBadge points={g.points} scale={db.settings.scale} sm />
            <div className="grow"><b>{g.title}</b><p className="small mute">{fmtDate(g.date)} · {g.source === 'provinha' ? 'Provinha no app' : g.source === 'homework' ? 'Homework' : 'Nota da Camila'}</p></div>
            <b className="tnum">{g.points}</b>
          </div>
        ))}
      </div>
    </main>
  );
}

/** Provinha só com a professora: pede a senha dela. */
function QuizGate({ unitId, onOk, onClose }: { unitId: number; onOk: () => void; onClose: () => void }) {
  const { db } = useApp();
  const [v, setV] = useState('');
  const [bad, setBad] = useState(false);
  const pin = db.settings.pin;
  return (
    <Modal label="Liberar provinha" onClose={onClose}>
      <Mascot size={110} mood="listen" say="Teacher time!" />
      <h2>Provinha da Unit {unitId}</h2>
      {pin ? (
        <>
          <p>A provinha é feita com a {db.settings.teacherName}. Professora, digite sua senha para liberar.</p>
          <input className="input" type="password" inputMode="numeric" maxLength={4} autoFocus value={v} aria-label="Senha da professora"
            onChange={(e) => { const x = e.target.value.replace(/\D/g, ''); setV(x); setBad(false); if (x.length === 4) { if (x === pin) onOk(); else { setBad(true); setV(''); } } }} />
          {bad && <p className="err">Senha errada.</p>}
        </>
      ) : (
        <p>A provinha é feita com a {db.settings.teacherName}. Para liberar aqui, ela precisa criar uma senha em <b>Configurações</b>. Na aula, use <b>“Abrir aula com {db.students[0]?.name ?? 'a aluna'}”</b>, que já libera a provinha.</p>
      )}
      <button className="btn ghost" onClick={onClose}>Voltar</button>
    </Modal>
  );
}
