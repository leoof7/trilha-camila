import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { DB, LessonResult, Student } from './store/types';
import { emptyDB, loadDB, saveDB, uid } from './store/db';
import { cloudOn, currentSession, pull, push, onSync, onMerged, hasPending, markSeen, lastStamp, studentSession, studentPull, studentLogout, type SyncState } from './store/cloud';
import { mergeDB } from './store/merge';
import { dayKey, streak } from './engine/game';
import { autoStickers } from './engine/game';

export type Screen =
  | { name: 'profiles' }
  | { name: 'login' }
  | { name: 'setup' }
  | { name: 'kid'; studentId: string; tab?: 'trail' | 'album' | 'me' | 'book'; withTeacher?: boolean }
  | { name: 'play'; studentId: string; lessonId: string; mode: 'lesson' | 'quiz'; unitId: number; withTeacher?: boolean }
  | { name: 'teacher'; tab?: string; studentId?: string };

interface Ctx {
  db: DB;
  ready: boolean;
  update: (fn: (d: DB) => DB) => void;
  screen: Screen;
  go: (s: Screen) => void;
  saveResult: (r: Omit<LessonResult, 'id' | 'date' | 'at'>, kind: string) => { stickers: string[]; streakDays: number };
  account: string | null;
  sync: SyncState;
  afterLogin: () => Promise<void>;
  /** aluno entrou no celular dele (código da turma + nome + senha) */
  studentMode: boolean;
  enterStudent: (d: DB) => void;
  leaveStudent: () => void;
}

const AppCtx = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(emptyDB());
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>({ name: 'profiles' });
  const dbRef = useRef(db);

  const [account, setAccount] = useState<string | null>(null);
  const [sync, setSync] = useState<SyncState>('off');
  useEffect(() => onSync(setSync), []);
  const [studentMode, setStudentMode] = useState(!!studentSession());
  const apply = (d: DB) => { dbRef.current = d; setDb(d); saveDB(d); };
  // a nuvem tinha coisa nova (ex.: lição que a Anne fez em casa): junta com o que está na tela
  useEffect(() => onMerged((m) => apply(mergeDB(m, dbRef.current))), []);

  const enterStudent = useCallback((remote: DB) => {
    const d = mergeDB(emptyDB(), { ...emptyDB(), ...remote });
    apply(d); setStudentMode(true); setSync('saved');
    const sid = d.students[0]?.id;
    setScreen(sid ? { name: 'kid', studentId: sid } : { name: 'login' });
  }, []);
  const leaveStudent = useCallback(() => {
    studentLogout(); setStudentMode(false); apply(emptyDB()); setScreen({ name: 'login' });
  }, []);

  /** Depois do login: traz os dados da nuvem; se a nuvem está vazia, sobe o que já existe no aparelho. */
  const afterLogin = useCallback(async () => {
    const s = await currentSession();
    if (!s) return;
    setAccount(s.user.email ?? 'conta');
    try {
      const remote = await pull();
      if (remote?.data && remote.data.version === 1) {
        // junta: o que já estava neste aparelho não se perde; em conflito vale a nuvem
        const local = dbRef.current;
        const d = mergeDB(local.settings.setupDone ? local : emptyDB(), { ...emptyDB(), ...remote.data });
        markSeen(remote.updated_at);
        apply(d); setSync('saved');
        if (local.settings.setupDone && (local.results.length || local.classes.length)) push(d);
        setScreen(d.settings.setupDone ? { name: 'profiles' } : { name: 'setup' });
      } else {
        push(dbRef.current);
        setScreen(dbRef.current.settings.setupDone ? { name: 'profiles' } : { name: 'setup' });
      }
    } catch { setSync('offline'); setScreen({ name: 'profiles' }); }
  }, []);

  useEffect(() => {
    loadDB().then(async (d) => {
      setDb(d);
      dbRef.current = d;
      let localOnly = false;
      try { localOnly = localStorage.getItem('trilha-so-aparelho') === '1'; } catch { /* ignora */ }
      if (cloudOn && studentSession()) {
        const sid = d.students[0]?.id;
        setScreen(sid ? { name: 'kid', studentId: sid } : { name: 'login' });
        try { enterStudent(mergeDB(d, await studentPull())); } catch { /* sem internet: usa o que está no aparelho */ }
      } else if (cloudOn && !localOnly) {
        const s = await currentSession();
        if (s) await afterLogin();
        else setScreen({ name: 'login' });
      } else if (!d.settings.setupDone) setScreen({ name: 'setup' });
      setReady(true);
    });
  }, []);

  // Ao vivo entre aparelhos: a cada poucos segundos (e quando a tela volta a ficar visível) confere se
  // outro aparelho salvou algo mais novo. Se este aparelho tem mudança esperando para subir, ela tem a vez.
  useEffect(() => {
    if (!account && !studentMode) return;
    let busy = false;
    const check = async () => {
      if (busy || hasPending() || document.visibilityState !== 'visible') return;
      busy = true;
      try {
        if (studentMode) {
          const remote = await studentPull();
          if (!hasPending()) apply(mergeDB(dbRef.current, { ...emptyDB(), ...remote }));
        } else {
          const remote = await pull();
          if (remote?.data?.version === 1 && remote.updated_at > lastStamp && !hasPending()) {
            markSeen(remote.updated_at);
            apply(mergeDB(dbRef.current, { ...emptyDB(), ...remote.data })); setSync('saved');
          }
        }
      } catch { /* sem internet: tenta de novo */ }
      busy = false;
    };
    const t = setInterval(check, studentMode ? 10000 : 6000);
    const vis = () => check();
    document.addEventListener('visibilitychange', vis);
    window.addEventListener('focus', vis);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', vis); window.removeEventListener('focus', vis); };
  }, [account, studentMode]);

  const update = useCallback((fn: (d: DB) => DB) => {
    const next = fn(dbRef.current);
    dbRef.current = next;
    setDb(next);
    saveDB(next);
    push(next);
  }, []);

  const go = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
  }, []);

  const saveResult: Ctx['saveResult'] = (r, kind) => {
    const today = dayKey();
    const d = dbRef.current;
    const days = Array.from(new Set([...(d.studyDays[r.studentId] ?? []), today]));
    const st = streak(days, today);
    const doneBefore = d.results.filter((x) => x.studentId === r.studentId).length;
    const firstTime = !d.results.some((x) => x.studentId === r.studentId && x.lessonId === r.lessonId);
    const newDay = !(d.studyDays[r.studentId] ?? []).includes(today);
    // figurinha só na primeira vez que termina a lição (ou ao bater recorde de sequência), para não virar inflação
    const stickers = firstTime || (newDay && (st === 3 || st === 7))
      ? autoStickers({ kind: firstTime ? kind : '', perfect: firstTime && r.mistakes === 0 && r.total >= 4, streakDays: newDay ? st : 0, lessonsDone: doneBefore + 1 })
      : [];
    const result: LessonResult = { ...r, id: uid(), date: today, at: new Date().toISOString() };
    update((db) => ({
      ...db,
      results: [...db.results, result],
      studyDays: { ...db.studyDays, [r.studentId]: days },
      grades:
        r.mode === 'quiz'
          ? [...db.grades, r.lessonId.startsWith('exam-')
            ? { id: uid(), studentId: r.studentId, date: today, unitId: r.unitId, title: db.exams?.find((e) => `exam-${e.id}` === r.lessonId)?.title ?? 'Prova', points: r.points, source: 'prova' as const, resultId: result.id }
            : { id: uid(), studentId: r.studentId, date: today, unitId: r.unitId, title: `Provinha · Unit ${r.unitId}`, points: r.points, source: 'provinha' as const, resultId: result.id }]
          : db.grades,
      stickers: [...db.stickers, ...stickers.map((s) => ({ id: uid(), studentId: r.studentId, sticker: s, date: today, by: 'app' as const, reason: kind }))],
    }));
    return { stickers, streakDays: st };
  };

  return <AppCtx.Provider value={{ db, ready, update, screen, go, saveResult, account, sync, afterLogin, studentMode, enterStudent, leaveStudent }}>{children}</AppCtx.Provider>;
}

export function useStudent(id: string): Student | undefined {
  const { db } = useApp();
  return db.students.find((s) => s.id === id);
}

export function studentXp(db: DB, id: string) {
  return db.results.filter((r) => r.studentId === id).reduce((a, r) => a + r.xp, 0);
}

export function xpToday(db: DB, id: string) {
  const t = dayKey();
  return db.results.filter((r) => r.studentId === id && r.date === t).reduce((a, r) => a + r.xp, 0);
}

export function bestResult(db: DB, studentId: string, lessonId: string, mode: 'lesson' | 'quiz' = 'lesson') {
  const rs = db.results.filter((r) => r.studentId === studentId && r.lessonId === lessonId && r.mode === mode);
  if (!rs.length) return null;
  return rs.reduce((a, b) => (b.points > a.points ? b : a));
}
