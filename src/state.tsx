import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { DB, LessonResult, Student } from './store/types';
import { emptyDB, loadDB, saveDB, uid } from './store/db';
import { cloudOn, currentSession, pull, push, onSync, hasPending, markSeen, lastStamp, type SyncState } from './store/cloud';
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

  /** Depois do login: traz os dados da nuvem; se a nuvem está vazia, sobe o que já existe no aparelho. */
  const afterLogin = useCallback(async () => {
    const s = await currentSession();
    if (!s) return;
    setAccount(s.user.email ?? 'conta');
    try {
      const remote = await pull();
      if (remote?.data && remote.data.version === 1) {
        const d = { ...emptyDB(), ...remote.data };
        markSeen(remote.updated_at);
        dbRef.current = d; setDb(d); saveDB(d); setSync('saved');
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
      if (cloudOn && !localOnly) {
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
    if (!account) return;
    let busy = false;
    const check = async () => {
      if (busy || hasPending() || document.visibilityState !== 'visible') return;
      busy = true;
      try {
        const remote = await pull();
        if (remote?.data?.version === 1 && remote.updated_at > lastStamp && !hasPending()) {
          markSeen(remote.updated_at);
          const d = { ...emptyDB(), ...remote.data };
          dbRef.current = d; setDb(d); saveDB(d); setSync('saved');
        }
      } catch { /* sem internet: tenta de novo */ }
      busy = false;
    };
    const t = setInterval(check, 6000);
    const vis = () => check();
    document.addEventListener('visibilitychange', vis);
    window.addEventListener('focus', vis);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', vis); window.removeEventListener('focus', vis); };
  }, [account]);

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

  return <AppCtx.Provider value={{ db, ready, update, screen, go, saveResult, account, sync, afterLogin }}>{children}</AppCtx.Provider>;
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
