import type { Unit, Ref } from './types';

const r = (pdf: number, section: string, printed?: number): Ref => ({ pdf, printed, section });

// ───────────────────────────── UNIT 5 ─────────────────────────────
export const unit5: Unit = {
  id: 5,
  title: 'My Family!',
  subtitle: 'People we love',
  emoji: '👨‍👩‍👧‍👦',
  color: '#FF6B9D',
  teacherTip: 'Ask students to bring a family photo to the next class. Practice: "This is my mum. Her name is ___. She is ___ years old."',
  parentNote:
    'Participe da entrevista! Deixe seu filho(a) te entrevistar em inglês — responda em português e ele(a) escreve. Depois mostrem a árvore genealógica para outro familiar e nomeiem cada pessoa em inglês juntos!',
  vocab: [
    { en: 'father', pt: 'pai', emoji: '👨' }, { en: 'mother', pt: 'mãe', emoji: '👩' }, { en: 'brother', pt: 'irmão', emoji: '👦' },
    { en: 'sister', pt: 'irmã', emoji: '👧' }, { en: 'grandfather', pt: 'avô', emoji: '👴' }, { en: 'grandmother', pt: 'avó', emoji: '👵' },
    { en: 'baby', pt: 'bebê', emoji: '👶' }, { en: 'pet', pt: 'animal de estimação', emoji: '🐕' }, { en: 'parents', pt: 'pais', emoji: '👫' },
    { en: 'family', pt: 'família', emoji: '👨‍👩‍👧' }, { en: 'son', pt: 'filho', emoji: '👦🏻' }, { en: 'daughter', pt: 'filha', emoji: '👧🏻' },
  ],
  lessons: [
    {
      id: 'u5-vocab', kind: 'vocab', title: 'Family words', ref: r(20, 'My Family!', 12),
      items: [
        { t: 'match', pairs: [['father', 'pai'], ['mother', 'mãe'], ['brother', 'irmão'], ['sister', 'irmã'], ['baby', 'bebê']] },
        { t: 'match', pairs: [['grandfather', 'avô'], ['grandmother', 'avó'], ['parents', 'pais'], ['son', 'filho'], ['daughter', 'filha']] },
        { t: 'pic', emoji: '👵', a: 'grandmother' },
        { t: 'pic', emoji: '👶', a: 'baby' },
        { t: 'hear', a: 'daughter', opts: ['daughter', 'father', 'brother'] },
        { t: 'speak', a: 'This is my mum.' },
      ],
    },
    {
      id: 'u5-read', kind: 'read', title: "Leo's Family", ref: r(20, 'Read Aloud', 12),
      story: {
        title: "Leo's Family",
        lines: [
          { who: 'Leo', text: 'Hello! My name is Leo. This is my family!' },
          { who: 'Leo', text: 'This is my dad. His name is Carlos. He is thirty-eight years old.' },
          { who: 'Leo', text: 'This is my mum. Her name is Ana. She is thirty-five.' },
          { who: 'Leo', text: 'This is my sister. Her name is Bia. She is six years old.' },
          { who: 'Leo', text: 'And this is our dog, Rex! He is two years old.' },
          { who: 'Leo', text: 'I love my family! How about you? Tell me about YOUR family!' },
        ],
      },
      items: [
        { t: 'fill', q: 'This is my dad. ___ name is Carlos.', a: 'His', opts: ['His', 'Her', 'My'], listen: true },
        { t: 'fill', q: 'This is my mum. ___ name is Ana.', a: 'Her', opts: ['Her', 'His', 'Your'], listen: true },
        { t: 'choice', q: 'Who is Rex?', a: 'the dog', opts: ['the dog', 'the dad', 'the sister'] },
        { t: 'choice', q: 'How old is Bia?', a: 'six', opts: ['six', 'two', 'seven'] },
        { t: 'speak', a: 'I love my family!' },
      ],
    },
    {
      id: 'u5-practice', kind: 'practice', title: "Let's Practice!", ref: r(21, "Let's Practice! · Ex. 15–17", 13),
      classActivity: { title: 'My Family!', text: 'Tell the class about your family! Say: "I have a mum, a dad and one sister." Try to say something about each person: "My dad is tall. My mum is funny!"' },
      items: [
        { t: 'fill', q: "My mum's mum is my ___.", a: 'grandmother', opts: ['grandmother', 'grandfather', 'sister'], ref: r(21, 'Ex. 15', 13) },
        { t: 'fill', q: "My dad's dad is my ___.", a: 'grandfather', opts: ['grandfather', 'brother', 'grandmother'], ref: r(21, 'Ex. 15', 13) },
        { t: 'fill', q: 'A girl in my family is my ___.', a: 'sister', opts: ['sister', 'brother', 'father'], ref: r(21, 'Ex. 15', 13) },
        { t: 'fill', q: 'A boy in my family is my ___.', a: 'brother', opts: ['brother', 'sister', 'mother'], ref: r(21, 'Ex. 15', 13) },
        { t: 'fill', q: 'My dad → ___ is funny.', a: 'He', opts: ['He', 'She'], ref: r(21, 'Ex. 16', 13) },
        { t: 'fill', q: 'My mum → ___ is kind.', a: 'She', opts: ['He', 'She'], ref: r(21, 'Ex. 16', 13) },
        { t: 'fill', q: 'My brother → ___ is tall.', a: 'He', opts: ['He', 'She'], ref: r(21, 'Ex. 16', 13) },
        { t: 'fill', q: 'My sister → ___ is smart.', a: 'She', opts: ['He', 'She'], ref: r(21, 'Ex. 16', 13) },
        { t: 'speak', a: 'There are ___ people in my family.', tip: 'How many people are in your family?', ref: r(21, 'Complete the Dialogue!', 13) },
        { t: 'speak', a: 'I have a mum, a dad and one sister.', tip: 'Fale sobre a SUA família — troque as palavras se precisar!', ref: r(21, 'My Family!', 13) },
      ],
    },
    {
      id: 'u5-translate', kind: 'translate', title: 'Translate! — Unit 5', ref: r(22, 'Translate! — Unit 5'),
      items: [
        { t: 'build', q: 'Vou ligar para minha mãe.', a: 'I am going to call my mum.', dir: 'pe', s: 1 },
        { t: 'build', q: 'Meu pai trabalha todos os dias.', a: 'My dad works every day.', dir: 'pe', s: 1 },
        { t: 'build', q: 'Minha irmã tem sete anos.', a: 'My sister is seven years old.', dir: 'pe' },
        { t: 'build', q: 'Meu avô é muito engraçado.', a: 'My grandfather is very funny.', dir: 'pe', s: 1 },
        { t: 'build', q: 'Minha família tem cinco pessoas.', a: 'There are five people in my family.', dir: 'pe' },
        { t: 'build', q: 'Eu amo muito minha mãe.', a: 'I love my mum very much.', dir: 'pe', s: 1 },
        { t: 'build', q: 'My mum is tall and beautiful.', a: 'Minha mãe é alta e bonita.', alt: ['Minha mãe é alta e linda.'], dir: 'ep', s: 1 },
        { t: 'build', q: 'My brother is funny and kind.', a: 'Meu irmão é engraçado e gentil.', dir: 'ep', s: 1 },
        { t: 'build', q: 'Do you have any brothers or sisters?', a: 'Você tem irmãos ou irmãs?', dir: 'ep', s: 1 },
        { t: 'build', q: 'My grandmother lives with us.', a: 'Minha avó mora com a gente.', alt: ['Minha avó mora conosco.'], dir: 'ep', s: 1 },
        { t: 'build', q: 'Sim! Tenho uma irmã. Ela tem seis anos.', a: 'Yes! I have a sister. She is six years old.', dir: 'pe' },
      ],
    },
    {
      id: 'u5-homework', kind: 'homework', title: 'Homework — Unit 5', ref: r(23, 'Homework — Unit 5'),
      items: [
        { t: 'sort', q: 'He or She?', groups: [['HE', ['father', 'brother', 'grandfather', 'son']], ['SHE', ['mother', 'sister', 'grandmother', 'daughter']]] },
        { t: 'speak', a: 'What is your name?', tip: 'Interview a family member! Ask in English.' },
        { t: 'speak', a: 'How old are you?', tip: 'Interview a family member!' },
        { t: 'speak', a: 'What is your favourite color?', tip: 'Interview a family member!' },
        { t: 'speak', a: 'What is your favourite food?', tip: 'Interview a family member!' },
        { t: 'build', q: 'Minha mãe é gentil. Ela tem trinta anos.', a: 'My mum is kind. She is thirty years old.', dir: 'pe' },
      ],
    },
  ],
};

// ───────────────────────────── UNIT 6 ─────────────────────────────
export const unit6: Unit = {
  id: 6,
  title: 'Animals!',
  subtitle: 'Wild & domestic animals',
  emoji: '🐘',
  color: '#00C9A7',
  teacherTip: 'Animal Charades and the Sound Game: "A dog says WOOF!"',
  parentNote:
    'Assistam a um vídeo curto sobre animais em inglês (YouTube Kids tem ótimas opções). Peça que seu filho(a) diga o nome de cada animal que aparece em inglês e imite o som! Depois escolham juntos o animal favorito.',
  vocab: [
    { en: 'dog', pt: 'cachorro', emoji: '🐶' }, { en: 'cat', pt: 'gato', emoji: '🐱' }, { en: 'fish', pt: 'peixe', emoji: '🐟' },
    { en: 'bird', pt: 'pássaro', emoji: '🐦' }, { en: 'hamster', pt: 'hamster', emoji: '🐹' }, { en: 'rabbit', pt: 'coelho', emoji: '🐰' },
    { en: 'lion', pt: 'leão', emoji: '🦁' }, { en: 'elephant', pt: 'elefante', emoji: '🐘' }, { en: 'giraffe', pt: 'girafa', emoji: '🦒' },
    { en: 'monkey', pt: 'macaco', emoji: '🐒' }, { en: 'penguin', pt: 'pinguim', emoji: '🐧' }, { en: 'crocodile', pt: 'crocodilo', emoji: '🐊' },
    { en: 'zebra', pt: 'zebra', emoji: '🦓' }, { en: 'frog', pt: 'sapo', emoji: '🐸' }, { en: 'eagle', pt: 'águia', emoji: '🦅' },
  ],
  lessons: [
    {
      id: 'u6-vocab', kind: 'vocab', title: 'Animals', ref: r(24, 'Animals!', 14),
      items: [
        { t: 'match', q: 'Domestic animals', pairs: [['dog', 'cachorro'], ['cat', 'gato'], ['fish', 'peixe'], ['bird', 'pássaro'], ['rabbit', 'coelho']] },
        { t: 'match', q: 'Wild animals', pairs: [['lion', 'leão'], ['elephant', 'elefante'], ['giraffe', 'girafa'], ['monkey', 'macaco'], ['penguin', 'pinguim']] },
        { t: 'match', q: 'Wild animals', pairs: [['crocodile', 'crocodilo'], ['frog', 'sapo'], ['eagle', 'águia'], ['rabbit', 'coelho'], ['bird', 'pássaro']] },
        { t: 'pic', emoji: '🦅', a: 'eagle' },
        { t: 'pic', emoji: '🐧', a: 'penguin' },
        { t: 'hear', a: 'giraffe', opts: ['giraffe', 'rabbit', 'frog'] },
        { t: 'speak', a: 'My favourite animal is the penguin.' },
      ],
    },
    {
      id: 'u6-read', kind: 'read', title: 'A Day at the Zoo', ref: r(24, 'Read Aloud', 14),
      story: {
        title: 'A Day at the Zoo',
        lines: [
          { text: 'Leo and Maya visit the zoo with their class.' },
          { who: 'Leo', text: "Look! A lion! It's big and yellow!" },
          { who: 'Maya', text: 'I see a giraffe! It has a very long neck!' },
          { who: 'Leo', text: 'The monkeys are funny! They jump and make noise!' },
          { who: 'Maya', text: 'My favourite animal is the penguin. It walks like this!' },
          { who: 'Maya', text: "What's YOUR favourite animal?" },
        ],
      },
      items: [
        { t: 'fill', q: "Look! A lion! It's big and ___!", a: 'yellow', opts: ['yellow', 'green', 'pink'], listen: true },
        { t: 'fill', q: 'I see a ___! It has a very long neck!', a: 'giraffe', opts: ['giraffe', 'penguin', 'monkey'], listen: true },
        { t: 'choice', q: "What is Maya's favourite animal?", a: 'the penguin', opts: ['the penguin', 'the lion', 'the monkey'] },
        { t: 'speak', a: 'The monkeys are funny!' },
      ],
    },
    {
      id: 'u6-practice', kind: 'practice', title: "Let's Practice!", ref: r(25, "Let's Practice! · Ex. 18–20", 15),
      classActivity: { title: 'Animal Charades!', text: 'One student acts like an animal — no sounds, just movements! The rest guess in English: "Is it a monkey? Is it a lion?" First correct guess wins a point!' },
      items: [
        { t: 'pic', emoji: '🦁', a: 'lion', q: 'Write the animal name!', ref: r(25, 'Ex. 18', 15) },
        { t: 'pic', emoji: '🐘', a: 'elephant', q: 'Write the animal name!', ref: r(25, 'Ex. 18', 15) },
        { t: 'pic', emoji: '🐸', a: 'frog', q: 'Write the animal name!', ref: r(25, 'Ex. 18', 15) },
        { t: 'type', q: '🦒 = ?', a: 'giraffe', ref: r(25, 'Ex. 18', 15) },
        { t: 'type', q: '🐶 = ?', a: 'dog', ref: r(25, 'Ex. 18', 15) },
        { t: 'type', q: '🐱 = ?', a: 'cat', ref: r(25, 'Ex. 18', 15) },
        { t: 'sort', q: 'Wild or Domestic?', groups: [['🏠 Domestic', ['dog', 'cat', 'rabbit']], ['🌿 Wild', ['lion', 'elephant', 'crocodile']]], ref: r(25, 'Ex. 19', 15) },
        { t: 'scramble', a: 'FROG', hint: '🐸', ref: r(25, 'Ex. 20', 15) },
        { t: 'scramble', a: 'ZEBRA', hint: '🦓', ref: r(25, 'Ex. 20', 15) },
        { t: 'scramble', a: 'CAT', hint: '🐱', ref: r(25, 'Ex. 20', 15) },
        { t: 'scramble', a: 'MONKEY', hint: '🐒', ref: r(25, 'Ex. 20', 15) },
        { t: 'choice', q: 'Sound Game! "WOOF!" — What animal is it?', a: 'dog', opts: ['dog', 'cat', 'lion'], ref: r(25, 'Sound Game · What Sound?', 15) },
      ],
    },
    {
      id: 'u6-translate', kind: 'translate', title: 'Translate! — Unit 6', ref: r(26, 'Translate! — Unit 6'),
      items: [
        { t: 'build', q: 'Eu tenho um cachorro marrom.', a: 'I have a brown dog.', dir: 'pe', s: 1 },
        { t: 'build', q: 'O leão é grande e amarelo.', a: 'The lion is big and yellow.', dir: 'pe', s: 1 },
        { t: 'build', q: 'O macaco vive na floresta.', a: 'The monkey lives in the forest.', dir: 'pe', s: 1 },
        { t: 'build', q: 'Quantos animais você tem em casa?', a: 'How many animals do you have at home?', dir: 'pe', s: 1 },
        { t: 'build', q: 'O cachorro é preto e branco.', a: 'The dog is black and white.', dir: 'pe', s: 1 },
        { t: 'build', q: 'The elephant is very big and grey.', a: 'O elefante é muito grande e cinza.', dir: 'ep', s: 1 },
        { t: 'build', q: 'My cat sleeps all day!', a: 'Meu gato dorme o dia todo!', dir: 'ep', s: 1 },
        { t: 'build', q: 'I have two fish and one rabbit.', a: 'Eu tenho dois peixes e um coelho.', dir: 'ep', s: 1 },
        { t: 'build', q: 'What is your favourite animal?', a: 'Qual é o seu animal favorito?', dir: 'ep', s: 1 },
        { t: 'build', q: 'Sim! Tenho um cachorro chamado Rex.', a: 'Yes! I have a dog called Rex.', alt: ['Yes! I have a dog named Rex.'], dir: 'pe', s: 1 },
      ],
    },
    {
      id: 'u6-homework', kind: 'homework', title: 'Homework — Unit 6', ref: r(27, 'Homework — Unit 6'),
      items: [
        { t: 'choice', q: '🐶 Dog says:', a: 'WOOF!', opts: ['WOOF!', 'MEOW!', 'RIBBIT!'] },
        { t: 'choice', q: '🐱 Cat says:', a: 'MEOW!', opts: ['ROAR!', 'MEOW!', 'WOOF!'] },
        { t: 'choice', q: '🐸 Frog says:', a: 'RIBBIT!', opts: ['RIBBIT!', 'QUACK!', 'MEOW!'] },
        { t: 'choice', q: '🦁 Lion says:', a: 'ROAR!', opts: ['WOOF!', 'ROAR!', 'SNAP!'], s: 1 },
        { t: 'sort', q: 'Sort and write! Put animals in the right column.', groups: [['🏠 Domestic', ['hamster', 'cat', 'rabbit', 'fish']], ['🌿 Wild', ['penguin', 'zebra', 'crocodile', 'eagle']]] },
        { t: 'speak', a: 'My favourite animal is the ___.', tip: 'Draw and describe your favourite animal!' },
      ],
    },
  ],
};

// ───────────────────────────── UNIT 7 ─────────────────────────────
export const unit7: Unit = {
  id: 7,
  title: 'My Body!',
  subtitle: 'Parts of the body',
  emoji: '🦾',
  color: '#FFAB40',
  teacherTip: 'Sing "Head, Shoulders, Knees and Toes" — touch each body part as you sing! Speed up each round.',
  parentNote:
    'Cante "Head, Shoulders, Knees and Toes" com seu filho(a) tocando cada parte do corpo! Depois jogue "Simon Says" em inglês: "Simon says touch your nose!" Vejam quem comete mais erros — pai/mãe ou filho(a)!',
  vocab: [
    { en: 'eyes', pt: 'olhos', emoji: '👁️' }, { en: 'ears', pt: 'orelhas', emoji: '👂' }, { en: 'nose', pt: 'nariz', emoji: '👃' },
    { en: 'mouth', pt: 'boca', emoji: '👄' }, { en: 'teeth', pt: 'dentes', emoji: '😁' }, { en: 'head', pt: 'cabeça', emoji: '💆' },
    { en: 'arm', pt: 'braço', emoji: '💪' }, { en: 'hand', pt: 'mão', emoji: '🤚' }, { en: 'leg', pt: 'perna', emoji: '🦵' },
    { en: 'foot', pt: 'pé', emoji: '🦶' }, { en: 'fingers', pt: 'dedos', emoji: '🤞' }, { en: 'belly', pt: 'barriga', emoji: '🫀' },
  ],
  lessons: [
    {
      id: 'u7-vocab', kind: 'vocab', title: 'Body parts', ref: r(28, 'My Body!', 16),
      items: [
        { t: 'match', pairs: [['eyes', 'olhos'], ['ears', 'orelhas'], ['nose', 'nariz'], ['mouth', 'boca'], ['teeth', 'dentes']] },
        { t: 'match', pairs: [['head', 'cabeça'], ['arm', 'braço'], ['hand', 'mão'], ['leg', 'perna'], ['foot', 'pé']] },
        { t: 'pic', emoji: '👂', a: 'ears' },
        { t: 'pic', emoji: '🦶', a: 'foot' },
        { t: 'hear', a: 'fingers', opts: ['fingers', 'feet', 'teeth'] },
        { t: 'choice', q: 'foot → plural?', a: 'feet', opts: ['feet', 'foots', 'fingers'] },
        { t: 'speak', a: 'Head, shoulders, knees and toes!' },
      ],
    },
    {
      id: 'u7-read', kind: 'read', title: 'The Silly Monster!', ref: r(28, 'Read Aloud', 16),
      story: {
        title: 'The Silly Monster!',
        lines: [
          { text: 'Leo draws a funny monster for art class.' },
          { who: 'Leo', text: 'My monster has THREE eyes and TWO noses!' },
          { who: 'Leo', text: 'It has FIVE arms and SEVEN fingers on each hand!' },
          { who: 'Leo', text: 'Its legs are very long and its feet are very big!' },
          { who: 'Leo', text: 'It has big ears but a tiny mouth.' },
          { who: 'Leo', text: 'Can you draw YOUR silly monster?' },
        ],
      },
      items: [
        { t: 'fill', q: 'My monster has ___ eyes and TWO noses!', a: 'THREE', opts: ['THREE', 'TWO', 'FIVE'], listen: true },
        { t: 'fill', q: 'It has FIVE ___ and SEVEN fingers on each hand!', a: 'arms', opts: ['arms', 'legs', 'ears'], listen: true },
        { t: 'choice', q: "The monster's mouth is…", a: 'tiny', opts: ['tiny', 'big', 'long'] },
        { t: 'speak', a: 'It has big ears but a tiny mouth.' },
      ],
    },
    {
      id: 'u7-practice', kind: 'practice', title: "Let's Practice!", ref: r(29, "Let's Practice! · Ex. 21–23", 17),
      classActivity: { title: 'Simon Says!', text: '"Simon says touch your nose!" Students only move if you say "Simon says" first. If you just say "Touch your ear!" and they move — they\'re out!' },
      items: [
        { t: 'choice', q: 'How many eyes do we have?', a: 'two', opts: ['two', 'one', 'ten'], ref: r(29, 'Ex. 22', 17) },
        { t: 'choice', q: 'How many ears do we have?', a: 'two', opts: ['two', 'three', 'one'], ref: r(29, 'Ex. 22', 17) },
        { t: 'choice', q: 'How many fingers do we have?', a: 'ten', opts: ['ten', 'five', 'twenty'], ref: r(29, 'Ex. 22', 17) },
        { t: 'choice', q: 'How many legs do we have?', a: 'two', opts: ['two', 'four', 'ten'], ref: r(29, 'Ex. 22', 17) },
        { t: 'pic', emoji: '💪', a: 'arm', q: 'Label the body part!', ref: r(29, 'Ex. 21', 17) },
        { t: 'pic', emoji: '🤚', a: 'hand', q: 'Label the body part!', ref: r(29, 'Ex. 21', 17) },
        { t: 'pic', emoji: '🦵', a: 'leg', q: 'Label the body part!', ref: r(29, 'Ex. 21', 17) },
        { t: 'speak', a: 'Simon says touch your nose!', ref: r(29, 'Simon Says!', 17) },
      ],
    },
    {
      id: 'u7-translate', kind: 'translate', title: 'Translate! — Unit 7', ref: r(30, 'Translate! — Unit 7'),
      items: [
        { t: 'build', q: 'Estou com dor de cabeça.', a: 'I have a headache.', alt: ['My head hurts.'], dir: 'pe', s: 1 },
        { t: 'build', q: 'Minhas mãos estão frias.', a: 'My hands are cold.', dir: 'pe', s: 1 },
        { t: 'build', q: 'Nós usamos os olhos para ver.', a: 'We use our eyes to see.', dir: 'pe', s: 1 },
        { t: 'build', q: 'My legs are tired after football.', a: 'Minhas pernas estão cansadas depois do futebol.', dir: 'ep', s: 1 },
        { t: 'build', q: 'Touch your nose with your finger!', a: 'Toque o nariz com o dedo!', dir: 'ep', s: 1 },
        { t: 'build', q: 'I have two ears and one nose.', a: 'Eu tenho duas orelhas e um nariz.', dir: 'ep', s: 1 },
        { t: 'build', q: 'My tummy hurts. I am not well.', a: 'Minha barriga dói. Eu não estou bem.', dir: 'ep', s: 1 },
        { t: 'build', q: 'Not very well. My head hurts.', a: 'Não muito bem. Minha cabeça dói.', dir: 'ep', s: 1 },
      ],
    },
    {
      id: 'u7-homework', kind: 'homework', title: 'Homework — Unit 7', ref: r(31, 'Homework — Unit 7'),
      items: [
        { t: 'choice', q: 'fingers on both hands:', a: 'ten', opts: ['ten', 'five', 'twenty'] },
        { t: 'choice', q: 'toes on both feet:', a: 'ten', opts: ['ten', 'two', 'five'] },
        { t: 'choice', q: 'arms:', a: 'two', opts: ['two', 'four', 'one'] },
        { t: 'build', q: 'Eu vejo com os meus olhos.', a: 'I see with my eyes.', dir: 'pe' },
        { t: 'build', q: 'Eu ouço com as minhas orelhas.', a: 'I hear with my ears.', dir: 'pe' },
      ],
    },
  ],
};

// ───────────────────────────── UNIT 8 ─────────────────────────────
export const unit8: Unit = {
  id: 8,
  title: 'My Classroom!',
  subtitle: 'School objects & commands',
  emoji: '🏫',
  color: '#26C6DA',
  teacherTip: 'Take turns being the teacher! Give a command in English: "Open your book!" or "Raise your hand!"',
  parentNote:
    'Peça ao seu filho(a) para "montar a mochila" em inglês! Enquanto coloca cada objeto, ele(a) deve nomeá-lo em inglês: "I have a pencil, a book, an eraser…" Também pode pedir que dê um comando da sala de aula para você!',
  vocab: [
    { en: 'pencil', pt: 'lápis', emoji: '✏️' }, { en: 'ruler', pt: 'régua', emoji: '📏' }, { en: 'book', pt: 'livro', emoji: '📚' },
    { en: 'backpack', pt: 'mochila', emoji: '🎒' }, { en: 'scissors', pt: 'tesoura', emoji: '✂️' }, { en: 'pen', pt: 'caneta', emoji: '🖊️' },
    { en: 'eraser', pt: 'borracha', emoji: '🗑️' }, { en: 'notebook', pt: 'caderno', emoji: '📐' }, { en: 'crayon', pt: 'giz de cera', emoji: '🖍️' },
    { en: 'Raise your hand!', pt: 'Levante a mão!', emoji: '🖐️' }, { en: 'Be quiet, please!', pt: 'Silêncio, por favor!', emoji: '🤫' },
    { en: 'Look at the board!', pt: 'Olhe para o quadro!', emoji: '👀' }, { en: 'Open your book!', pt: 'Abra o livro!', emoji: '📖' },
    { en: 'Write this down!', pt: 'Escreva isso!', emoji: '🖊️' }, { en: 'Repeat after me!', pt: 'Repita após mim!', emoji: '🔁' },
  ],
  lessons: [
    {
      id: 'u8-vocab', kind: 'vocab', title: 'Objects & commands', ref: r(32, 'My Classroom!', 18),
      items: [
        { t: 'match', pairs: [['pencil', 'lápis'], ['ruler', 'régua'], ['book', 'livro'], ['backpack', 'mochila'], ['scissors', 'tesoura']] },
        { t: 'match', pairs: [['pen', 'caneta'], ['eraser', 'borracha'], ['notebook', 'caderno'], ['crayon', 'giz de cera'], ['book', 'livro']] },
        { t: 'pic', emoji: '🎒', a: 'backpack' },
        { t: 'pic', emoji: '✂️', a: 'scissors' },
        { t: 'match', q: 'Classroom commands', pairs: [['Raise your hand!', 'Levante a mão!'], ['Be quiet, please!', 'Silêncio, por favor!'], ['Look at the board!', 'Olhe para o quadro!'], ['Open your book!', 'Abra o livro!'], ['Repeat after me!', 'Repita após mim!']] },
        { t: 'hear', a: 'Write this down!', opts: ['Write this down!', 'Open your book!', 'Repeat after me!'] },
        { t: 'speak', a: 'Raise your hand!' },
      ],
    },
    {
      id: 'u8-read', kind: 'read', title: 'Ready for Class!', ref: r(32, 'Read Aloud', 18),
      story: {
        title: 'Ready for Class!',
        lines: [
          { text: 'It is Monday morning. Leo opens his backpack.' },
          { who: 'Leo', text: 'I have my pencil, my notebook and my eraser.' },
          { who: 'Teacher', text: 'Raise your hand if you have your book!' },
          { who: 'Maya', text: "I don't have my pen! Can I borrow one?" },
          { who: 'Leo', text: 'Here you go!' },
          { who: 'Teacher', text: 'Be quiet now — open your books, page five!' },
        ],
      },
      items: [
        { t: 'fill', q: 'I have my pencil, my notebook and my ___.', a: 'eraser', opts: ['eraser', 'ruler', 'crayon'], listen: true },
        { t: 'fill', q: "I don't have my ___! Can I borrow one?", a: 'pen', opts: ['pen', 'book', 'backpack'], listen: true },
        { t: 'choice', q: 'Open your books, page…', a: 'five', opts: ['five', 'ten', 'nine'] },
        { t: 'speak', a: "I don't have my pen! Can I borrow one?" },
      ],
    },
    {
      id: 'u8-practice', kind: 'practice', title: "Let's Practice!", ref: r(33, "Let's Practice! · Ex. 24–26", 19),
      classActivity: { title: 'Classroom Commands Game!', text: 'Take turns being the teacher! Give a command in English: "Open your book!" or "Raise your hand!" — classmates must follow. If they do it wrong or don\'t understand, say it again louder!' },
      items: [
        { t: 'match', q: 'Match the command to the action!', pairs: [['Raise your hand!', '🖐️ Levante a mão'], ['Be quiet!', '🤫 Fique quieto'], ['Look at the board!', '👀 Olhe o quadro'], ['Open your book!', '📖 Abra o livro']], ref: r(33, 'Ex. 25', 19) },
        { t: 'scramble', a: 'RULER', hint: '📏', ref: r(33, 'Ex. 26 · Word search', 19) },
        { t: 'scramble', a: 'PENCIL', hint: '✏️', ref: r(33, 'Ex. 26 · Word search', 19) },
        { t: 'scramble', a: 'CRAYON', hint: '🖍️', ref: r(33, 'Ex. 26 · Word search', 19) },
        { t: 'scramble', a: 'ERASER', hint: '🗑️', ref: r(33, 'Ex. 26 · Word search', 19) },
        { t: 'scramble', a: 'SCISSORS', hint: '✂️', ref: r(33, 'Ex. 26 · Word search', 19) },
        { t: 'speak', a: 'I have a pencil, a book and a ruler.', tip: 'What is in your backpack today?', ref: r(33, 'Ex. 24', 19) },
      ],
    },
    {
      id: 'u8-translate', kind: 'translate', title: 'Translate! — Unit 8', ref: r(34, 'Translate! — Unit 8'),
      items: [
        { t: 'build', q: 'Pode me emprestar seu lápis?', a: 'Can I borrow your pencil?', dir: 'pe' },
        { t: 'build', q: 'Esqueci meu caderno em casa.', a: 'I forgot my notebook at home.', dir: 'pe', s: 1 },
        { t: 'build', q: 'Abra o livro na página dez.', a: 'Open your book on page ten.', alt: ['Open the book on page ten.'], dir: 'pe', s: 1 },
        { t: 'build', q: 'Eu não entendo esta palavra.', a: "I don't understand this word.", dir: 'pe' },
        { t: 'build', q: 'Levante a mão se você sabe!', a: 'Raise your hand if you know!', dir: 'pe' },
        { t: 'build', q: 'I need a new eraser, please.', a: 'Eu preciso de uma borracha nova, por favor.', dir: 'ep', s: 1 },
        { t: 'build', q: 'Can you write that on the board?', a: 'Você pode escrever isso no quadro?', dir: 'ep', s: 1 },
        { t: 'build', q: 'Please be quiet and listen.', a: 'Por favor, fique quieto e escute.', dir: 'ep', s: 1 },
        { t: 'build', q: 'I have five pencils and one ruler.', a: 'Eu tenho cinco lápis e uma régua.', dir: 'ep', s: 1 },
        { t: 'build', q: 'Sim, por favor! Obrigada, Leo.', a: 'Yes, please! Thank you, Leo.', dir: 'pe' },
      ],
    },
    {
      id: 'u8-homework', kind: 'homework', title: 'Homework — Unit 8', ref: r(35, 'Homework — Unit 8'),
      items: [
        { t: 'choice', q: 'The teacher wants silence:', a: 'Be quiet, please!', opts: ['Be quiet, please!', 'Raise your hand!', 'Open your book!'] },
        { t: 'choice', q: 'The teacher wants you to look:', a: 'Look at the board!', opts: ['Look at the board!', 'Write this down!', 'Be quiet, please!'] },
        { t: 'choice', q: 'You want to answer:', a: 'Raise your hand!', opts: ['Raise your hand!', 'Repeat after me!', 'Look at the board!'] },
        { t: 'choice', q: 'Teacher wants you to open a book:', a: 'Open your book!', opts: ['Open your book!', 'Write this down!', 'Raise your hand!'] },
      ],
    },
  ],
};
