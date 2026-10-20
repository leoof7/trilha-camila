// Enunciado de cada exercício em inglês (grande) e português (pequeno).
// O inglês é o da apostila sempre que ela traz um enunciado; o português é só a tradução do
// enunciado para a criança entender o que fazer — nunca conteúdo novo.
import type { Ex } from './types';

export interface Ask { en: string; pt: string }

/** Tradução dos enunciados que vêm da apostila. */
const PT: Record<string, string> = {
  '"How are you?" means:': 'O que significa "How are you?"?',
  '"Nice to meet you!" means:': 'O que significa "Nice to meet you!"?',
  '"See you later!" means:': 'O que significa "See you later!"?',
  '7am — arriving at school 🌅': '7h da manhã, chegando na escola. O que você diz?',
  '8pm — seeing grandma 🌙': '8h da noite, encontrando a vovó. O que você diz?',
  'Christmas is in…': 'O Natal é em qual mês?',
  'New Year is in…': 'O Ano Novo é em qual mês?',
  'Five friends come. Then three more arrive. How many friends?': 'Chegam cinco amigos. Depois chegam mais três. Quantos amigos são?',
  'How many ears do we have?': 'Quantas orelhas nós temos?',
  'How many eyes do we have?': 'Quantos olhos nós temos?',
  'How many fingers do we have?': 'Quantos dedos nós temos?',
  'How many legs do we have?': 'Quantas pernas nós temos?',
  'How old is Bia?': 'Quantos anos a Bia tem?',
  'How old is Maya?': 'Quantos anos a Maya tem?',
  'Open your books, page…': 'Abram o livro na página…',
  'Someone helps you:': 'Alguém te ajuda. O que você diz?',
  'Sound Game! "WOOF!" — What animal is it?': 'Jogo do som! "WOOF!" — que animal é esse?',
  'Teacher wants you to open a book:': 'A professora quer que você abra o livro. Qual é o comando?',
  "The monster's mouth is…": 'A boca do monstro é…',
  'The teacher answers your "thank you!":': 'A professora responde ao seu "thank you!". O que ela diz?',
  'The teacher speaks too fast:': 'A professora fala rápido demais. O que você diz?',
  'The teacher wants silence:': 'A professora quer silêncio. Qual é o comando?',
  'The teacher wants you to look:': 'A professora quer que você olhe. Qual é o comando?',
  'Two days after Wednesday is…': 'Dois dias depois de Wednesday é…',
  'What does Leo want after lunch?': 'O que o Leo quer depois do almoço?',
  "What is Maya's favourite animal?": 'Qual é o animal favorito da Maya?',
  "When is Leo's birthday?": 'Quando é o aniversário do Leo?',
  'Who is Rex?': 'Quem é o Rex?',
  'Yesterday was Friday. Today is…': 'Ontem foi Friday. Hoje é…',
  'You accidentally bumped into someone:': 'Você esbarrou em alguém sem querer. O que você diz?',
  "You didn't hear:": 'Você não ouviu. O que você diz?',
  "You didn't understand what the teacher said:": 'Você não entendeu o que a professora falou. O que você diz?',
  'You have an answer:': 'Você sabe a resposta. O que você diz?',
  'You made a mistake:': 'Você errou. O que você diz?',
  'You want to answer a question:': 'Você quer responder uma pergunta. O que você diz?',
  'You want to answer:': 'Você quer responder. Qual é o comando?',
  'Your friend helps you pick up your pencil:': 'Seu amigo te ajuda a pegar o lápis. O que você diz?',
  'arms:': 'Quantos braços nós temos?',
  'fingers on both hands:': 'Quantos dedos nas duas mãos?',
  'toes on both feet:': 'Quantos dedos nos dois pés?',
  'foot → plural?': 'Como fica "foot" no plural (mais de um)?',
  '🐱 Cat says:': 'O que o gato diz?',
  '🐶 Dog says:': 'O que o cachorro diz?',
  '🐸 Frog says:': 'O que o sapo diz?',
  '🦁 Lion says:': 'O que o leão diz?',
  '😋 🍕': 'Você gosta de pizza 😋. O que você diz?',
  '🤢 🥗': 'Você não gosta de salada 🤢. O que você diz?',
  'Breakfast, lunch and dinner': 'Café da manhã, almoço e jantar: ligue cada um à tradução.',
  'Classroom commands': 'Comandos da sala de aula: ligue cada um à tradução.',
  'Domestic animals': 'Animais domésticos: ligue cada um à tradução.',
  'Wild animals': 'Animais selvagens: ligue cada um à tradução.',
  'Key phrases': 'Frases importantes: ligue cada uma à tradução.',
  'Draw a line to match the number to its English word!': 'Ligue cada número à palavra em inglês.',
  'Match the command to the action!': 'Ligue cada comando à ação.',
  'Match the greeting to the right time of day.': 'Ligue cada cumprimento à hora certa do dia.',
  'Match the letter to the word!': 'Ligue cada letra à palavra que começa com ela.',
  'Write a word for each letter!': 'Ligue cada letra a uma palavra que começa com ela.',
  'Write the color AND the Portuguese translation!': 'Ligue cada cor à tradução em português.',
  'Put the days in order!': 'Coloque os dias da semana na ordem.',
  'Put the days in order! 1–7': 'Coloque os dias na ordem, de 1 a 7.',
  'Put the numbers in order!': 'Coloque os números na ordem.',
  'Write ALL 7 days of the week in order, starting with Monday!': 'Coloque os 7 dias da semana na ordem, começando por Monday.',
  'Write the alphabet in order!': 'Coloque as letras do alfabeto na ordem.',
  'Write the months in order! (1–6)': 'Coloque os meses na ordem (1 a 6).',
  'Write the months in order! (7–12)': 'Coloque os meses na ordem (7 a 12).',
  'Label the body part!': 'Que parte do corpo é essa?',
  'Label these body parts!': 'Que parte do corpo é essa?',
  'Quick Fire! What do you say?': 'Rápido! O que você diz?',
  'What color is it?': 'Que cor é essa?',
  'Write the color!': 'Que cor é essa?',
  'What letter does it start with?': 'Com que letra começa essa palavra em inglês?',
  'Write the animal name!': 'Que animal é esse?',
  'Write the name of each food!': 'Que comida é essa?',
  'He or She?': 'He (ele) ou She (ela)? Toque na palavra e depois no grupo certo.',
  'Sort and write! Put animals in the right column.': 'Separe os animais: domésticos ou selvagens? Toque no animal e depois no grupo.',
  'Wild or Domestic?': 'Selvagem ou doméstico? Toque no animal e depois no grupo.',
  'Wild or domestic? Sort the animals!': 'Selvagem ou doméstico? Toque no animal e depois no grupo.',
};

/** Pergunta padrão para "figura → palavra", conforme o tema da unit. */
const PIC_BY_UNIT: Record<number, Ask> = {
  1: { en: 'Which greeting matches the picture?', pt: 'Qual cumprimento combina com a figura?' },
  2: { en: 'What number is it?', pt: 'Que número é esse?' },
  3: { en: 'What color is it?', pt: 'Que cor é essa?' },
  4: { en: 'What is it?', pt: 'O que é isso em inglês?' },
  5: { en: 'Who is it?', pt: 'Quem é essa pessoa da família?' },
  6: { en: 'What animal is it?', pt: 'Que animal é esse?' },
  7: { en: 'What part of the body is it?', pt: 'Que parte do corpo é essa?' },
  8: { en: 'What is it?', pt: 'Que objeto da sala de aula é esse?' },
  9: { en: 'What food is it?', pt: 'Que comida é essa?' },
  10: { en: 'What is it?', pt: 'O que é isso?' },
  11: { en: 'What do you say?', pt: 'O que você diz?' },
};

function choiceAsk(q: string): Ask {
  if (PT[q]) return { en: q, pt: PT[q] };
  let m = q.match(/^(\d+)\s*([+−×])\s*(\d+)\s*=$/);
  if (m) return { en: `${m[1]} ${m[2]} ${m[3]} = ?`, pt: `Quanto é ${m[1]} ${m[2] === '×' ? 'vezes' : m[2] === '+' ? 'mais' : 'menos'} ${m[3]}? Escolha em inglês.` };
  m = q.match(/^(\d+)\s*=$/);
  if (m) return { en: `${m[1]} = ?`, pt: `Como se escreve o número ${m[1]} em inglês?` };
  m = q.match(/^([a-z]+)\s*=$/);
  if (m) return { en: `${m[1]} = ?`, pt: `Qual número é "${m[1]}"?` };
  return { en: q, pt: 'Escolha a resposta certa.' };
}

export function askFor(ex: Ex, unitId: number): Ask {
  const q = 'q' in ex ? (ex.q as string | undefined) : undefined;
  switch (ex.t) {
    case 'match':
      return q ? { en: q, pt: PT[q] ?? 'Toque numa palavra e depois no par dela.' } : { en: 'Match the pairs!', pt: 'Toque numa palavra em inglês e depois na tradução dela.' };
    case 'pic':
      return q ? { en: q, pt: PT[q] ?? 'Toque na resposta certa.' } : PIC_BY_UNIT[unitId] ?? { en: 'What is it?', pt: 'O que é isso?' };
    case 'build':
      return ex.dir === 'pe'
        ? { en: 'Translate into English.', pt: 'Monte a frase em inglês tocando nas palavras.' }
        : { en: 'Translate into Portuguese.', pt: 'Monte a frase em português tocando nas palavras.' };
    case 'fill':
      return ex.listen
        ? { en: 'Listen and complete the sentence.', pt: 'Ouça e escolha a palavra que falta.' }
        : { en: 'Complete the sentence.', pt: 'Escolha a palavra que falta na frase.' };
    case 'choice':
      return choiceAsk(ex.q);
    case 'hear':
      return { en: 'What do you hear?', pt: 'Ouça e toque no que você ouviu.' };
    case 'speak':
      return ex.a.includes('___')
        ? { en: 'Your turn! Say it out loud.', pt: 'Sua vez! Complete com as suas palavras e fale em voz alta.' }
        : { en: 'Say it out loud!', pt: 'Ouça e repita em voz alta.' };
    case 'scramble':
      return ex.a.includes('{NAME}') || ex.hint === '✏️'
        ? { en: 'Spell your name!', pt: 'Toque nas letras para soletrar o seu nome.' }
        : { en: 'Unscramble the letters!', pt: 'Toque nas letras na ordem certa para formar a palavra.' };
    case 'order':
      return { en: ex.q, pt: PT[ex.q] ?? 'Toque na ordem certa.' };
    case 'sort':
      return { en: ex.q, pt: PT[ex.q] ?? 'Toque na palavra e depois no grupo certo.' };
    case 'type': {
      if (/^Crossword/.test(ex.q)) return { en: ex.q.replace(/^Crossword\s*/, 'Crossword: '), pt: 'Palavra cruzada: escreva a palavra em inglês.' };
      return { en: 'How do you say it in English?', pt: 'Escreva a resposta em inglês.' };
    }
  }
}

export const PT_MAP = PT;
