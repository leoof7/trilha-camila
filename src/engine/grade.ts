// Notas: pontos (0–100) e letra. Escala padrão combinada com a Camila: A a partir de 80.
export interface GradeScale { A: number; B: number; C: number }
export const DEFAULT_SCALE: GradeScale = { A: 80, B: 65, C: 50 };

export type Letter = 'A' | 'B' | 'C' | 'D';

export function letter(points: number, scale: GradeScale = DEFAULT_SCALE): Letter {
  if (points >= scale.A) return 'A';
  if (points >= scale.B) return 'B';
  if (points >= scale.C) return 'C';
  return 'D';
}

export const LETTER_TEXT: Record<Letter, string> = {
  A: 'Excelente!',
  B: 'Muito bom!',
  C: 'Bom, vamos treinar mais',
  D: 'Vamos revisar juntas',
};

/** Estrelas de uma lição (1 a 3), como no "Teacher's feedback" da apostila. */
export function stars(accuracy: number): 1 | 2 | 3 {
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.6) return 2;
  return 1;
}

export function toPoints(correct: number, total: number): number {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

export function average(nums: number[]): number | null {
  if (!nums.length) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}
