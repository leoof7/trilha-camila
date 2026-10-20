// Regras de gamificação: XP, nível, sequência de dias, figurinhas, status do aluno.

export const XP_PER_CORRECT = 10;
export const XP_PERFECT_BONUS = 5;
export const HEARTS = 5;
export const DAILY_GOAL = 3; // missão do dia: 3 atividades (lição, história ou provinha)

export const LEVELS = [
  { xp: 0, name: 'Beginner', emoji: '🌱' },
  { xp: 100, name: 'Explorer', emoji: '🧭' },
  { xp: 300, name: 'Reader', emoji: '📖' },
  { xp: 600, name: 'Speaker', emoji: '🎤' },
  { xp: 1000, name: 'Champion', emoji: '🏆' },
  { xp: 1600, name: 'Superstar', emoji: '🌟' }, // "you're a superstar!" — última página da apostila
];

export function levelOf(xp: number) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++;
  const cur = LEVELS[i];
  const next = LEVELS[i + 1];
  const pct = next ? (xp - cur.xp) / (next.xp - cur.xp) : 1;
  return { index: i, ...cur, next, pct };
}

export function lessonXp(correctFirstTry: number, total: number, mistakes: number): number {
  return correctFirstTry * XP_PER_CORRECT + (total - correctFirstTry) * 5 + (mistakes === 0 ? XP_PERFECT_BONUS : 0);
}

/** Data local AAAA-MM-DD (fuso do aparelho). */
export function dayKey(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Dias seguidos de estudo terminando hoje (ou ontem, se hoje ainda não estudou). */
export function streak(days: string[], today: string = dayKey()): number {
  const set = new Set(days);
  const d = new Date(today + 'T12:00:00');
  if (!set.has(today)) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export const STICKERS = [
  { id: 'star', emoji: '⭐', label: 'Superstar' },
  { id: 'phrase', emoji: '🗣️', label: 'Phrase Hunter' },
  { id: 'reader', emoji: '📖', label: 'Read Aloud' },
  { id: 'helper', emoji: '🙋', label: 'Can I help you?' },
  { id: 'idea', emoji: '💡', label: 'I have an idea!' },
  { id: 'brave', emoji: '🎤', label: 'Speaking' },
  { id: 'home', emoji: '🏠', label: 'Homework' },
  { id: 'rainbow', emoji: '🌈', label: 'Rainbow' },
];

/** Figurinhas automáticas que o app dá. A Camila também dá figurinhas na aula (Phrase Hunter). */
export function autoStickers(ev: { kind: string; perfect: boolean; streakDays: number; lessonsDone: number }): string[] {
  const out: string[] = [];
  if (ev.perfect) out.push('star');
  if (ev.kind === 'read') out.push('reader');
  if (ev.kind === 'homework') out.push('home');
  if (ev.streakDays === 3 || ev.streakDays === 7) out.push('rainbow');
  return out;
}

export type StudentStatus = 'ok' | 'away' | 'help';
export function studentStatus(lastActive: string | null, recentAccuracy: number[], today = dayKey()): { s: StudentStatus; label: string } {
  const recent = recentAccuracy.slice(-3);
  if (recent.length >= 2 && recent.reduce((a, b) => a + b, 0) / recent.length < 0.65) return { s: 'help', label: 'Precisa de reforço' };
  if (lastActive) {
    const diff = Math.round((new Date(today + 'T12:00:00').getTime() - new Date(lastActive + 'T12:00:00').getTime()) / 86400000);
    if (diff >= 8) return { s: 'away', label: `Sem praticar há ${diff} dias` };
  }
  return { s: 'ok', label: 'Em dia' };
}
