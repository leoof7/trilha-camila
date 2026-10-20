// Tipos do conteúdo. Todo texto de exercício vem da Apostila 1 da Professora Camila.
// {name} e {age} são trocados pelo nome e idade (em inglês) do aluno, só onde a apostila
// pede informação do próprio aluno ("My name is…", "I am ___ years old", "Spell your name").

export interface Ref {
  pdf: number;        // página do PDF (1–52)
  printed?: number;   // número impresso no canto da página, quando existe
  section: string;    // nome da seção na apostila, ex.: "Let's Practice! · Ex. 2"
}

interface Base {
  ref?: Ref;
  /** gabarito sugerido: a apostila não traz a resposta impressa. A Camila revisa. */
  s?: 1;
  id?: string;
}

export type Ex = Base &
  (
    | { t: 'match'; q?: string; pairs: [string, string][] }
    | { t: 'pic'; emoji: string; a: string; opts?: string[]; q?: string }
    | { t: 'build'; q: string; a: string; dir: 'pe' | 'ep'; alt?: string[] }
    | { t: 'fill'; q: string; a: string; opts: string[]; listen?: boolean; who?: string }
    | { t: 'choice'; q: string; a: string; opts: string[] }
    | { t: 'speak'; a: string; tip?: string }
    | { t: 'scramble'; a: string; hint?: string }
    | { t: 'hear'; a: string; opts: string[]; say?: string }
    | { t: 'order'; q: string; a: string[] }
    | { t: 'sort'; q: string; groups: [string, string[]][] }
    | { t: 'type'; q: string; a: string; alt?: string[] }
  );

export type LessonKind = 'vocab' | 'read' | 'practice' | 'games' | 'translate' | 'homework' | 'review';

export interface StoryLine { who?: string; text: string }

export interface Lesson {
  id: string;
  kind: LessonKind;
  title: string;
  ref: Ref;
  story?: { title: string; lines: StoryLine[] };
  /** atividade de sala que não vira exercício no app (jogos em roda, desenhar…) */
  classActivity?: { title: string; text: string };
  items: Ex[];
}

export interface Vocab { en: string; pt: string; emoji?: string }

export interface Unit {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;   // cor da unit na apostila
  vocab: Vocab[];
  lessons: Lesson[];
  parentNote: string; // "Tarefa em casa — para os pais", texto da apostila
  teacherTip: string;
}
