import type { Unit, Lesson, Ex, Ref } from './types';
import { unit1, unit2, unit3, unit4, NUMBER_WORDS } from './units-a';
import { unit5, unit6, unit7, unit8 } from './units-b';
import { unit9, unit10, unit11 } from './units-c';

export * from './types';
export { NUMBER_WORDS };

const r = (pdf: number, section: string, printed?: number): Ref => ({ pdf, printed, section });

export const APOSTILA = {
  title: 'My First English Adventure!',
  subtitle: 'Apostila 1 · Beginner Level · Extended Edition',
  teacher: 'Professora Camila',
  navy: '#272C67',
  yellow: '#FFD43B',
};

export const UNITS: Unit[] = [unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8, unit9, unit10, unit11];

/** Revisões e Fun Zone ficam como "units especiais" depois da 5 e da 11. */
export const REVIEWS: { afterUnit: number; lesson: Lesson; color: string; title: string }[] = [
  {
    afterUnit: 5,
    color: '#C084FC',
    title: "Let's Review! Units 1–5",
    lesson: {
      id: 'review-1', kind: 'review', title: 'Review 1 · Units 1–5', ref: r(48, 'Review · Units 1–5', 26),
      classActivity: { title: 'My English Poster!', text: 'Make a poster about yourself using everything you know: your name, age, family, favourite color, favourite number and favourite animal! Use drawings AND English words!' },
      items: [
        { t: 'build', q: 'Bom dia!', a: 'Good morning!', dir: 'pe', ref: r(48, 'R1', 26) },
        { t: 'build', q: 'Como você está?', a: 'How are you?', dir: 'pe', ref: r(48, 'R1', 26) },
        { t: 'build', q: 'Estou bem!', a: "I'm fine!", alt: ["I'm fine, thanks!"], dir: 'pe', ref: r(48, 'R1', 26) },
        { t: 'build', q: 'Qual é o seu nome?', a: "What's your name?", dir: 'pe', ref: r(48, 'R1', 26) },
        { t: 'type', q: '8 = ?', a: 'eight', ref: r(48, 'R2', 26) },
        { t: 'type', q: '15 = ?', a: 'fifteen', ref: r(48, 'R2', 26) },
        { t: 'type', q: '13 = ?', a: 'thirteen', ref: r(48, 'R2', 26) },
        { t: 'type', q: '19 = ?', a: 'nineteen', ref: r(48, 'R2', 26) },
        { t: 'pic', emoji: '🌊', a: 'blue', opts: ['blue', 'green', 'white'], ref: r(48, 'R3', 26) },
        { t: 'pic', emoji: '🌹', a: 'red', opts: ['red', 'pink', 'purple'], ref: r(48, 'R3', 26) },
        { t: 'pic', emoji: '🌿', a: 'green', opts: ['green', 'yellow', 'brown'], ref: r(48, 'R3', 26) },
        { t: 'pic', emoji: '🍊', a: 'orange', opts: ['orange', 'yellow', 'red'], ref: r(48, 'R3', 26) },
        { t: 'fill', q: "My dad's wife is my ___.", a: 'mother', opts: ['mother', 'sister', 'grandmother'], ref: r(48, 'R4', 26) },
        { t: 'fill', q: "My mum's son is my ___.", a: 'brother', opts: ['brother', 'father', 'grandfather'], ref: r(48, 'R4', 26) },
        { t: 'fill', q: "My dad's mum is my ___.", a: 'grandmother', opts: ['grandmother', 'mother', 'sister'], ref: r(48, 'R4', 26) },
        { t: 'fill', q: "My mum's dad is my ___.", a: 'grandfather', opts: ['grandfather', 'father', 'brother'], ref: r(48, 'R4', 26) },
        { t: 'match', q: 'Write a word for each letter!', pairs: [['A', 'Apple'], ['B', 'Ball'], ['C', 'Cat'], ['D', 'Dog'], ['E', 'Elephant']], ref: r(48, 'R5', 26) },
        { t: 'speak', a: 'My name is {name}. I am {age} years old.', tip: '1 Minute Quiz! Spell your name!', ref: r(48, 'Speed Round', 26) },
      ],
    },
  },
  {
    afterUnit: 11,
    color: '#FFAB40',
    title: 'More Review! Units 6–11',
    lesson: {
      id: 'review-2', kind: 'review', title: 'Review 2 · Units 6–11', ref: r(49, 'Review · Units 6–11', 27),
      classActivity: { title: 'Grand Review Speaking!', text: 'Tell the class everything about yourself in English: your name, age, birthday month, favourite day, favourite food, favourite animal, and describe one family member! Try to speak for 30 seconds non-stop!' },
      items: [
        { t: 'sort', q: 'Wild or domestic? Sort the animals!', groups: [['🏠 Domestic', ['dog', 'cat', 'rabbit']], ['🌿 Wild', ['lion', 'giraffe', 'elephant']]], ref: r(49, 'R6', 27) },
        { t: 'pic', emoji: '👁️', a: 'eyes', opts: ['eyes', 'ears', 'nose'], q: 'Label these body parts!', ref: r(49, 'R7', 27) },
        { t: 'pic', emoji: '👂', a: 'ears', opts: ['ears', 'eyes', 'mouth'], q: 'Label these body parts!', ref: r(49, 'R7', 27) },
        { t: 'pic', emoji: '👄', a: 'mouth', opts: ['mouth', 'teeth', 'nose'], q: 'Label these body parts!', ref: r(49, 'R7', 27) },
        { t: 'pic', emoji: '💪', a: 'arm', opts: ['arm', 'leg', 'hand'], q: 'Label these body parts!', ref: r(49, 'R7', 27) },
        { t: 'pic', emoji: '🦵', a: 'leg', opts: ['leg', 'arm', 'foot'], q: 'Label these body parts!', ref: r(49, 'R7', 27) },
        { t: 'pic', emoji: '🤚', a: 'hand', opts: ['hand', 'foot', 'fingers'], q: 'Label these body parts!', ref: r(49, 'R7', 27) },
        { t: 'speak', a: "I like pizza! I don't like salad.", tip: 'I LIKE or I DON\'T LIKE? 🍕 🥗 🍫 🥛', ref: r(49, 'R8', 27) },
        { t: 'order', q: 'Put the days in order! 1–7', a: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], ref: r(49, 'R9', 27) },
        { t: 'speak', a: 'My name is {name}. I am {age} years old. My birthday is in ___. My favourite food is ___.', tip: 'Grand Review Speaking! Try to speak for 30 seconds non-stop!', ref: r(49, 'Grand Review Speaking!', 27) },
      ],
    },
  },
];

export const FUN_ZONE: Lesson = {
  id: 'fun-zone', kind: 'games', title: 'Fun Zone', ref: r(50, 'Fun Zone · Game Time!', 28),
  classActivity: { title: 'Categories!', text: 'Teacher calls a category: "Animals!" Students have 30 seconds to write as many as they can in English. Compare lists. The most correct words wins the round!' },
  items: [
    { t: 'type', q: 'Crossword ➡️ 1. A big grey animal with a long nose 🐘 (8 letters)', a: 'elephant', ref: r(50, 'Crossword Puzzle', 28) },
    { t: 'type', q: 'Crossword ➡️ 4. The colour of the sky on a sunny day ☀️ (4 letters)', a: 'blue', ref: r(50, 'Crossword Puzzle', 28) },
    { t: 'type', q: 'Crossword ⬇️ 2. We use this to write at school ✏️ (6 letters)', a: 'pencil', ref: r(50, 'Crossword Puzzle', 28) },
    { t: 'type', q: 'Crossword ⬇️ 3. A red or green fruit 🍎 (5 letters)', a: 'apple', ref: r(50, 'Crossword Puzzle', 28) },
    { t: 'scramble', a: 'ELEPHANT', hint: '🐘', ref: r(51, 'Word Jumble Mega Challenge!', 29) },
    { t: 'scramble', a: 'FATHER', hint: '👨', ref: r(51, 'Word Jumble Mega Challenge!', 29) },
    { t: 'scramble', a: 'NOTEBOOK', hint: '📚', ref: r(51, 'Word Jumble Mega Challenge!', 29) },
    { t: 'scramble', a: 'TUESDAY', hint: '📅', ref: r(51, 'Word Jumble Mega Challenge!', 29) },
  ],
};

export const KIND_LABEL: Record<Lesson['kind'], string> = {
  vocab: 'Vocabulário',
  read: 'Read Aloud',
  practice: "Let's Practice!",
  games: 'Game Time!',
  translate: 'Translate!',
  homework: 'Homework',
  review: 'Review',
};

export const KIND_ICON: Record<Lesson['kind'], string> = {
  vocab: '★', read: '📖', practice: '✏️', games: '🎮', translate: '💬', homework: '🏠', review: '🔄',
};

/** Texto da referência de página: "Apostila p. 3 · Ex. 2" ou "Apostila · Translate! — Unit 1". */
export function refLabel(ref?: Ref): string {
  if (!ref) return '';
  return ref.printed ? `Apostila p. ${ref.printed} · ${ref.section}` : `Apostila · ${ref.section}`;
}

export function allLessons(): { unitId: number; lesson: Lesson }[] {
  const out: { unitId: number; lesson: Lesson }[] = [];
  for (const u of UNITS) {
    for (const l of u.lessons) out.push({ unitId: u.id, lesson: l });
    for (const rv of REVIEWS) if (rv.afterUnit === u.id) out.push({ unitId: u.id, lesson: rv.lesson });
  }
  out.push({ unitId: 11, lesson: FUN_ZONE });
  return out;
}

export function findLesson(id: string) {
  return allLessons().find((x) => x.lesson.id === id);
}

export function unitById(id: number) {
  return UNITS.find((u) => u.id === id)!;
}

/** Itens com id estável: lessonId#indice. Usado para erros, gabarito e provinha. */
export function itemsWithIds(lesson: Lesson): Ex[] {
  return lesson.items.map((it, i) => ({ ...it, id: `${lesson.id}#${i}`, ref: it.ref ?? lesson.ref }));
}

/** Acha um exercício pelo id (lessonId#i), com a unit e o título da lição. */
export function itemById(id: string): { item: Ex; unitId: number; lessonTitle: string } | null {
  const f = findLesson(id.split('#')[0]);
  if (!f) return null;
  const item = itemsWithIds(f.lesson).find((x) => x.id === id);
  return item ? { item, unitId: f.unitId, lessonTitle: f.lesson.title } : null;
}
