import type { Unit, Ref } from './types';

const r = (pdf: number, section: string, printed?: number): Ref => ({ pdf, printed, section });

// ───────────────────────────── UNIT 9 ─────────────────────────────
export const unit9: Unit = {
  id: 9,
  title: 'Yummy Food!',
  subtitle: "I like / I don't like…",
  emoji: '🍕',
  color: '#FF5C5C',
  teacherTip: 'Like it or Not! Thumbs up "I like pizza!" or thumbs down "I don\'t like salad!" Then vote — which food does the class like most?',
  parentNote:
    'Na próxima refeição em família, peça que seu filho(a) nomeie cada alimento em inglês! Para cada item desconhecido, pesquisem juntos. Depois brinquem de "restaurante" — ele(a) é o garçom e você o cliente!',
  vocab: [
    { en: 'pizza', pt: 'pizza', emoji: '🍕' }, { en: 'hamburger', pt: 'hambúrguer', emoji: '🍔' }, { en: 'apple', pt: 'maçã', emoji: '🍎' },
    { en: 'banana', pt: 'banana', emoji: '🍌' }, { en: 'cake', pt: 'bolo', emoji: '🍰' }, { en: 'ice cream', pt: 'sorvete', emoji: '🍦' },
    { en: 'salad', pt: 'salada', emoji: '🥗' }, { en: 'egg', pt: 'ovo', emoji: '🍳' }, { en: 'juice', pt: 'suco', emoji: '🧃' },
    { en: 'milk', pt: 'leite', emoji: '🥛' }, { en: 'bread', pt: 'pão', emoji: '🍞' }, { en: 'chocolate', pt: 'chocolate', emoji: '🍫' },
    { en: 'I like pizza!', pt: 'Eu gosto de pizza!', emoji: '😋' }, { en: "I don't like salad.", pt: 'Eu não gosto de salada.', emoji: '🤢' },
    { en: 'My favourite food is…', pt: 'Minha comida favorita é…', emoji: '😍' }, { en: "I'm hungry!", pt: 'Estou com fome!', emoji: '🍽️' },
  ],
  lessons: [
    {
      id: 'u9-vocab', kind: 'vocab', title: 'Foods', ref: r(36, 'Yummy Food!', 20),
      items: [
        { t: 'match', pairs: [['hamburger', 'hambúrguer'], ['apple', 'maçã'], ['cake', 'bolo'], ['ice cream', 'sorvete'], ['salad', 'salada']] },
        { t: 'match', pairs: [['egg', 'ovo'], ['juice', 'suco'], ['milk', 'leite'], ['bread', 'pão'], ['apple', 'maçã']] },
        { t: 'pic', emoji: '🍞', a: 'bread' },
        { t: 'pic', emoji: '🥛', a: 'milk' },
        { t: 'match', q: 'Key phrases', pairs: [['I like pizza!', 'Eu gosto de pizza!'], ["I don't like salad.", 'Eu não gosto de salada.'], ["I'm hungry!", 'Estou com fome!'], ['My favourite food is…', 'Minha comida favorita é…']] },
        { t: 'hear', a: "I'm hungry!", opts: ["I'm hungry!", 'I like pizza!', 'Ice cream!'] },
        { t: 'speak', a: 'I like pizza! I don\'t like salad.' },
      ],
    },
    {
      id: 'u9-read', kind: 'read', title: "What's for Lunch?", ref: r(36, 'Read Aloud', 20),
      story: {
        title: "What's for Lunch?",
        lines: [
          { who: 'Leo', text: "I'm hungry! What's for lunch today?" },
          { who: 'Mum', text: 'We have rice, salad and juice.' },
          { who: 'Leo', text: "I like rice! But I don't like salad. Can I have chocolate?" },
          { who: 'Mum', text: 'No chocolate before lunch, Leo! Eat your food first.' },
          { who: 'Leo', text: 'OK… but can we have ice cream after? Please?' },
        ],
      },
      items: [
        { t: 'fill', q: 'We have rice, salad and ___.', a: 'juice', opts: ['juice', 'milk', 'cake'], listen: true },
        { t: 'fill', q: "I like rice! But I don't like ___.", a: 'salad', opts: ['salad', 'pizza', 'bread'], listen: true },
        { t: 'choice', q: 'What does Leo want after lunch?', a: 'ice cream', opts: ['ice cream', 'salad', 'egg'] },
        { t: 'speak', a: "I'm hungry! What's for lunch today?" },
      ],
    },
    {
      id: 'u9-practice', kind: 'practice', title: "Let's Practice!", ref: r(37, "Let's Practice! · Ex. 27–29", 21),
      classActivity: { title: 'The Restaurant!', text: 'One student is the waiter, one is the customer. Waiter: "What would you like?" Customer: "I would like pizza, please!" Waiter: "Here you go! Enjoy!"' },
      items: [
        { t: 'choice', q: '😋 🍕', a: 'I like pizza!', opts: ['I like pizza!', "I don't like pizza."], ref: r(37, 'Ex. 27', 21) },
        { t: 'choice', q: '🤢 🥗', a: "I don't like salad.", opts: ['I like salad!', "I don't like salad."], ref: r(37, 'Ex. 27', 21) },
        { t: 'pic', emoji: '🍔', a: 'hamburger', q: 'Write the name of each food!', ref: r(37, 'Ex. 28', 21) },
        { t: 'pic', emoji: '🍰', a: 'cake', q: 'Write the name of each food!', ref: r(37, 'Ex. 28', 21) },
        { t: 'pic', emoji: '🍫', a: 'chocolate', q: 'Write the name of each food!', ref: r(37, 'Ex. 28', 21) },
        { t: 'type', q: '🍌 = ?', a: 'banana', ref: r(37, 'Ex. 28', 21) },
        { t: 'type', q: '🍎 = ?', a: 'apple', ref: r(37, 'Ex. 28', 21) },
        { t: 'speak', a: 'What would you like?', ref: r(37, 'Pretend Play · The Restaurant!', 21) },
        { t: 'speak', a: 'I would like pizza, please!', ref: r(37, 'Pretend Play · The Restaurant!', 21) },
        { t: 'speak', a: 'My favourite food is ___.', tip: 'My favourite meal!', ref: r(37, 'Ex. 29', 21) },
      ],
    },
    {
      id: 'u9-translate', kind: 'translate', title: 'Translate! — Unit 9', ref: r(38, 'Translate! — Unit 9'),
      items: [
        { t: 'build', q: 'Estou com muita fome!', a: "I'm very hungry!", dir: 'pe', s: 1 },
        { t: 'build', q: 'Eu adoro pizza com queijo.', a: 'I love pizza with cheese.', dir: 'pe', s: 1 },
        { t: 'build', q: 'Não gosto de salada.', a: "I don't like salad.", dir: 'pe' },
        { t: 'build', q: 'Minha comida favorita é sorvete.', a: 'My favourite food is ice cream.', dir: 'pe' },
        { t: 'build', q: 'No café da manhã eu como pão.', a: 'For breakfast I eat bread.', dir: 'pe' },
        { t: 'build', q: 'Posso tomar um suco, por favor?', a: 'Can I have a juice, please?', dir: 'pe', s: 1 },
        { t: 'build', q: 'I drink milk every morning.', a: 'Eu bebo leite toda manhã.', alt: ['Eu bebo leite todas as manhãs.', 'Bebo leite toda manhã.'], dir: 'ep', s: 1 },
        { t: 'build', q: 'What would you like to eat?', a: 'O que você gostaria de comer?', dir: 'ep' },
        { t: 'build', q: "I don't like eggs for breakfast.", a: 'Eu não gosto de ovos no café da manhã.', dir: 'ep', s: 1 },
        { t: 'build', q: 'The cake is brown and sweet.', a: 'O bolo é marrom e doce.', dir: 'ep', s: 1 },
        { t: 'build', q: 'Eu quero uma pizza, por favor.', a: 'I want a pizza, please.', alt: ['I would like a pizza, please.'], dir: 'pe', s: 1 },
      ],
    },
    {
      id: 'u9-homework', kind: 'homework', title: 'Homework — Unit 9', ref: r(39, 'Homework — Unit 9'),
      items: [
        { t: 'speak', a: 'I like ___!', tip: 'I LIKE ✅ or I DON\'T LIKE ❌ — pizza, salad, chocolate, egg…' },
        { t: 'match', q: 'Breakfast, lunch and dinner', pairs: [['☀️ Breakfast', 'café da manhã'], ['🌤️ Lunch', 'almoço'], ['🌙 Dinner', 'jantar']], s: 1 },
        { t: 'build', q: 'Eu gosto de pizza. Eu não gosto de ovo.', a: "I like pizza. I don't like egg.", dir: 'pe' },
      ],
    },
  ],
};

// ───────────────────────────── UNIT 10 ─────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const unit10: Unit = {
  id: 10,
  title: 'Days & Months!',
  subtitle: 'The calendar in English',
  emoji: '📅',
  color: '#5BB8FF',
  teacherTip: 'What Day Is It? "Yesterday was Friday." — "Today is Saturday!"',
  parentNote:
    'Pergunte ao seu filho(a) os dias da semana e meses do ano em inglês todos os dias durante uma semana! Na segunda-feira: "What day is today?" — "Monday!" Na sexta: "What month is it?" Façam um calendário em inglês juntos para o quarto!',
  vocab: [
    ...DAYS.map((en, i) => ({ en, pt: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][i] })),
    ...MONTHS.map((en, i) => ({ en, pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][i] })),
  ],
  lessons: [
    {
      id: 'u10-vocab', kind: 'vocab', title: 'Days & Months', ref: r(40, 'Days & Months!', 22),
      items: [
        { t: 'match', pairs: [['Monday', 'Segunda'], ['Tuesday', 'Terça'], ['Wednesday', 'Quarta'], ['Thursday', 'Quinta'], ['Friday', 'Sexta']] },
        { t: 'match', pairs: [['Saturday', 'Sábado'], ['Sunday', 'Domingo'], ['January', 'Janeiro'], ['February', 'Fevereiro'], ['March', 'Março']] },
        { t: 'match', pairs: [['April', 'Abril'], ['May', 'Maio'], ['June', 'Junho'], ['July', 'Julho'], ['August', 'Agosto']] },
        { t: 'match', pairs: [['September', 'Setembro'], ['October', 'Outubro'], ['November', 'Novembro'], ['December', 'Dezembro'], ['Sunday', 'Domingo']] },
        { t: 'hear', a: 'Wednesday', opts: ['Wednesday', 'Tuesday', 'Thursday'] },
        { t: 'order', q: 'Put the days in order!', a: DAYS },
        { t: 'speak', a: 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday!' },
      ],
    },
    {
      id: 'u10-read', kind: 'read', title: "Leo's Favourite Week", ref: r(40, 'Read Aloud', 22),
      story: {
        title: "Leo's Favourite Week",
        lines: [
          { who: 'Leo', text: 'Monday is school. Tuesday is swimming!' },
          { who: 'Leo', text: 'Wednesday is pizza day — my favourite!' },
          { who: 'Leo', text: 'Thursday and Friday are good but Saturday is the BEST!' },
          { who: 'Leo', text: 'My birthday is in July — the seventh month. I love summer!' },
          { who: 'Leo', text: 'What is YOUR favourite day? And your birthday month?' },
        ],
      },
      items: [
        { t: 'fill', q: 'Tuesday is ___!', a: 'swimming', opts: ['swimming', 'school', 'pizza day'], listen: true },
        { t: 'fill', q: '___ is pizza day — my favourite!', a: 'Wednesday', opts: ['Wednesday', 'Monday', 'Saturday'], listen: true },
        { t: 'choice', q: "When is Leo's birthday?", a: 'July', opts: ['July', 'June', 'January'] },
        { t: 'speak', a: 'My birthday is in ___.', tip: 'What is YOUR birthday month?' },
      ],
    },
    {
      id: 'u10-practice', kind: 'practice', title: "Let's Practice!", ref: r(41, "Let's Practice! · Ex. 30–32", 23),
      classActivity: { title: 'Birthday Month!', text: 'Go around the class! Each student says: "My birthday is in ___." Group students by season: Spring, Summer, Autumn, Winter. Which group has the most people?' },
      items: [
        { t: 'fill', q: 'Monday → ___ → Wednesday', a: 'Tuesday', opts: ['Tuesday', 'Thursday', 'Sunday'], ref: r(41, 'Ex. 30', 23) },
        { t: 'fill', q: 'Thursday → Friday → ___', a: 'Saturday', opts: ['Saturday', 'Sunday', 'Monday'], ref: r(41, 'Ex. 30', 23) },
        { t: 'fill', q: 'Saturday → ___ → Monday', a: 'Sunday', opts: ['Sunday', 'Friday', 'Tuesday'], ref: r(41, 'Ex. 30', 23) },
        { t: 'choice', q: 'Christmas is in…', a: 'December', opts: ['December', 'November', 'January'], ref: r(41, 'Ex. 31', 23) },
        { t: 'choice', q: 'Yesterday was Friday. Today is…', a: 'Saturday', opts: ['Saturday', 'Thursday', 'Sunday'], ref: r(41, 'Routine Game · What Day Is It?', 23) },
        { t: 'choice', q: 'Two days after Wednesday is…', a: 'Friday', opts: ['Friday', 'Thursday', 'Saturday'], ref: r(41, 'Routine Game · What Day Is It?', 23) },
        { t: 'speak', a: 'My favourite day is Saturday because I play football!', tip: 'My Favourite Day!', ref: r(41, 'My Favourite Day!', 23) },
      ],
    },
    {
      id: 'u10-translate', kind: 'translate', title: 'Translate! — Unit 10', ref: r(42, 'Translate! — Unit 10'),
      items: [
        { t: 'build', q: 'Hoje é segunda-feira.', a: 'Today is Monday.', dir: 'pe' },
        { t: 'build', q: 'Na sexta-feira eu vou ao cinema.', a: 'On Friday I go to the cinema.', dir: 'pe', s: 1 },
        { t: 'build', q: 'Meu aniversário é em julho.', a: 'My birthday is in July.', dir: 'pe' },
        { t: 'build', q: 'Que dia é hoje?', a: 'What day is today?', dir: 'pe' },
        { t: 'build', q: 'O Natal é em dezembro.', a: 'Christmas is in December.', dir: 'pe' },
        { t: 'build', q: 'No sábado eu fico em casa.', a: 'On Saturday I stay at home.', dir: 'pe', s: 1 },
        { t: 'build', q: 'My favourite day is Saturday.', a: 'Meu dia favorito é sábado.', dir: 'ep', s: 1 },
        { t: 'build', q: 'School starts on Monday.', a: 'A escola começa na segunda-feira.', dir: 'ep', s: 1 },
        { t: 'build', q: 'What month is your birthday?', a: 'Em que mês é o seu aniversário?', dir: 'ep', s: 1 },
        { t: 'build', q: 'There are twelve months in a year.', a: 'Há doze meses em um ano.', alt: ['Tem doze meses em um ano.'], dir: 'ep', s: 1 },
      ],
    },
    {
      id: 'u10-homework', kind: 'homework', title: 'Homework — Unit 10', ref: r(43, 'Homework — Unit 10'),
      items: [
        { t: 'order', q: 'Write ALL 7 days of the week in order, starting with Monday!', a: DAYS },
        { t: 'order', q: 'Write the months in order! (1–6)', a: MONTHS.slice(0, 6) },
        { t: 'order', q: 'Write the months in order! (7–12)', a: MONTHS.slice(6) },
        { t: 'choice', q: 'New Year is in…', a: 'January', opts: ['January', 'December', 'June'] },
        { t: 'speak', a: 'My favourite month is ___ because ___.', tip: 'Answer about yourself!' },
      ],
    },
  ],
};

// ───────────────────────────── UNIT 11 ─────────────────────────────
export const unit11: Unit = {
  id: 11,
  title: 'Daily Chat!',
  subtitle: 'Everyday conversations',
  emoji: '💬',
  color: '#00C9A7',
  teacherTip: 'These phrases are for REAL use in class! Encourage students to use them every lesson. Give a sticker when someone uses one correctly!',
  parentNote:
    'Durante uma semana, encoraje seu filho(a) a usar frases em inglês em situações reais em casa: "Please pass the salt!", "Thank you, Mum!", "I\'m sorry, Dad!" — Cada frase usada corretamente merece um elogio ou ponto em um quadrinho! Tente até você usar uma frase também!',
  vocab: [
    { en: 'Please', pt: 'Por favor', emoji: '🙏' }, { en: 'Thank you!', pt: 'Obrigado(a)!', emoji: '🙏' },
    { en: "You're welcome!", pt: 'De nada!', emoji: '😊' }, { en: "I'm sorry!", pt: 'Desculpe!', emoji: '😬' },
    { en: "I don't know.", pt: 'Eu não sei.', emoji: '🤷' }, { en: 'Can you repeat that?', pt: 'Pode repetir?', emoji: '🔁' },
    { en: 'Slower, please!', pt: 'Mais devagar, por favor!', emoji: '🐢' }, { en: 'What does ___ mean?', pt: 'O que significa ___?', emoji: '🤔' },
    { en: 'I understand!', pt: 'Eu entendo!', emoji: '✅' }, { en: "I don't understand.", pt: 'Eu não entendo.', emoji: '❌' },
    { en: 'Can I help you?', pt: 'Posso ajudar?', emoji: '🙋' }, { en: 'I have an idea!', pt: 'Tenho uma ideia!', emoji: '💡' },
    { en: "That's great!", pt: 'Que legal!', emoji: '🎉' },
  ],
  lessons: [
    {
      id: 'u11-vocab', kind: 'vocab', title: 'Useful phrases', ref: r(44, 'Daily Chat!', 24),
      items: [
        { t: 'match', pairs: [['Thank you!', 'Obrigado(a)!'], ["You're welcome!", 'De nada!'], ["I'm sorry!", 'Desculpe!'], ["I don't know.", 'Eu não sei.'], ['Can you repeat that?', 'Pode repetir?']] },
        { t: 'match', pairs: [['Slower, please!', 'Mais devagar, por favor!'], ['I understand!', 'Eu entendo!'], ["I don't understand.", 'Eu não entendo.'], ['Can I help you?', 'Posso ajudar?'], ['I have an idea!', 'Tenho uma ideia!']] },
        { t: 'pic', emoji: '🐢', a: 'Slower, please!', opts: ['Slower, please!', 'I have an idea!', "That's great!"] },
        { t: 'hear', a: "That's great!", opts: ["That's great!", "I don't know.", "I'm sorry!"] },
        { t: 'speak', a: 'Can you repeat that, please?' },
      ],
    },
    {
      id: 'u11-read', kind: 'read', title: 'English Class!', ref: r(44, 'Read Aloud', 24),
      story: {
        title: 'English Class!',
        lines: [
          { who: 'Student', text: "Good morning! Can you repeat that, please? I don't understand." },
          { who: 'Teacher', text: "Of course! Slower: 'Open your book, please.'" },
          { who: 'Student', text: 'Thank you! I understand now.' },
          { who: 'Teacher', text: "You're welcome!" },
          { who: 'Student', text: "What does 'pencil' mean?" },
          { who: 'Teacher', text: "It means 'lápis' in Portuguese!" },
          { who: 'Student', text: "Oh! I know that word. That's great!" },
          { who: 'Teacher', text: "Excellent! I'm so happy!" },
          { who: 'Student', text: "I'm sorry I was late today." },
          { who: 'Teacher', text: "That's ok. Please sit down." },
        ],
      },
      items: [
        { t: 'fill', q: 'Thank you! I ___ now.', a: 'understand', opts: ['understand', 'know', 'repeat'], listen: true },
        { t: 'fill', q: "What does 'pencil' ___?", a: 'mean', opts: ['mean', 'repeat', 'help'], listen: true },
        { t: 'fill', q: "I'm ___ I was late today.", a: 'sorry', opts: ['sorry', 'happy', 'great'], listen: true },
        { t: 'speak', a: "You're welcome!" },
      ],
    },
    {
      id: 'u11-practice', kind: 'practice', title: "Let's Practice!", ref: r(45, "Let's Practice! · Ex. 33–34", 25),
      classActivity: { title: 'English Only Zone!', text: 'For 5 minutes, ONLY English in class! If you need help, use the phrases: "Can you repeat?" "What does ___ mean?" "I don\'t understand." No Portuguese allowed!' },
      items: [
        { t: 'choice', q: "You didn't hear:", a: 'Can you repeat?', opts: ["I don't know", 'Can you repeat?'], ref: r(45, 'Ex. 33', 25) },
        { t: 'choice', q: 'Someone helps you:', a: 'Thank you!', opts: ['Thank you!', "I'm sorry!"], ref: r(45, 'Ex. 33', 25) },
        { t: 'choice', q: 'You made a mistake:', a: "I'm sorry!", opts: ["I'm sorry!", "You're welcome!"], ref: r(45, 'Ex. 33', 25) },
        { t: 'choice', q: 'You have an answer:', a: 'I have an idea!', opts: ["I don't know", 'I have an idea!'], ref: r(45, 'Ex. 33', 25) },
        { t: 'type', q: 'Por favor = ?', a: 'Please', ref: r(45, 'Ex. 34', 25) },
        { t: 'type', q: 'Desculpe = ?', a: "I'm sorry", alt: ["I'm sorry!", 'Sorry'], ref: r(45, 'Ex. 34', 25) },
        { t: 'type', q: 'Obrigado = ?', a: 'Thank you', alt: ['Thank you!', 'Thanks'], ref: r(45, 'Ex. 34', 25) },
        { t: 'type', q: 'Eu não sei = ?', a: "I don't know", alt: ["I don't know."], ref: r(45, 'Ex. 34', 25) },
        { t: 'fill', q: "I'm ___, thank you! And you?", a: 'fine', opts: ['fine', 'sorry', 'welcome'], who: 'You', ref: r(45, 'Full Dialogue Practice', 25) },
        { t: 'fill', q: "___ you repeat that? I don't understand.", a: 'Can', opts: ['Can', 'Do', 'Is'], who: 'You', ref: r(45, 'Full Dialogue Practice', 25) },
        { t: 'fill', q: 'Thank you! I ___ now.', a: 'understand', opts: ['understand', 'know', 'help'], who: 'You', ref: r(45, 'Full Dialogue Practice', 25) },
      ],
    },
    {
      id: 'u11-translate', kind: 'translate', title: 'Translate! — Unit 11', ref: r(46, 'Translate! — Unit 11'),
      items: [
        { t: 'build', q: 'Pode repetir, por favor?', a: 'Can you repeat that, please?', dir: 'pe' },
        { t: 'build', q: 'Eu não entendo. Pode falar mais devagar?', a: "I don't understand. Slower, please!", alt: ["I don't understand. Can you speak slower?"], dir: 'pe', s: 1 },
        { t: 'build', q: 'Desculpe, eu me atrasei.', a: "I'm sorry I was late.", dir: 'pe' },
        { t: 'build', q: 'Posso ir ao banheiro, por favor?', a: 'Can I go to the bathroom, please?', dir: 'pe', s: 1 },
        { t: 'build', q: 'Que legal! Eu adorei essa aula.', a: "That's great! I loved this class.", dir: 'pe', s: 1 },
        { t: 'build', q: "I don't know the answer. Sorry!", a: 'Eu não sei a resposta. Desculpe!', dir: 'ep', s: 1 },
        { t: 'build', q: 'Thank you so much! You are very kind.', a: 'Muito obrigado! Você é muito gentil.', alt: ['Muito obrigada! Você é muito gentil.'], dir: 'ep', s: 1 },
        { t: 'build', q: 'Can you help me with this, please?', a: 'Você pode me ajudar com isso, por favor?', dir: 'ep', s: 1 },
        { t: 'build', q: "I understand now! That's great!", a: 'Eu entendo agora! Que legal!', dir: 'ep', s: 1 },
      ],
    },
    {
      id: 'u11-homework', kind: 'homework', title: 'Homework — Unit 11', ref: r(47, 'Homework — Unit 11'),
      items: [
        { t: 'choice', q: "You didn't understand what the teacher said:", a: "I don't understand.", opts: ["I don't understand.", "You're welcome!", 'I have an idea!'] },
        { t: 'choice', q: 'Your friend helps you pick up your pencil:', a: 'Thank you!', opts: ['Thank you!', "I'm sorry!", "I don't know."] },
        { t: 'choice', q: 'You accidentally bumped into someone:', a: "I'm sorry!", opts: ["I'm sorry!", "That's great!", 'Thank you!'] },
        { t: 'choice', q: 'The teacher answers your "thank you!":', a: "You're welcome!", opts: ["You're welcome!", 'Please', "I'm sorry!"] },
        { t: 'choice', q: 'You want to answer a question:', a: 'I have an idea!', opts: ['I have an idea!', "I don't know.", 'Slower, please!'] },
        { t: 'choice', q: 'The teacher speaks too fast:', a: 'Slower, please!', opts: ['Slower, please!', "That's great!", 'Can I help you?'] },
      ],
    },
  ],
};
