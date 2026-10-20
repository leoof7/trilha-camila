// Voz: o app fala em inglês (voz do aparelho) e, quando o navegador permite, escuta a criança.

let voice: SpeechSynthesisVoice | null = null;
let female: SpeechSynthesisVoice | null = null;
let male: SpeechSynthesisVoice | null = null;
const MALE = /male\b(?!.*female)|david|mark|guy|george|james|daniel|fred|alex|christopher|eric|roger|ryan|andrew|brian|steffan|thomas|davis|tony/i;
const FEMALE = /female|zira|aria|jenny|samantha|susan|hazel|karen|moira|tessa|victoria|allison|ava|emma|michelle|libby|sonia|google us english|catherine|natasha|clara|joanna|salli/i;
function pickVoice() {
  try {
    const vs = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang));
    const us = vs.filter((v) => /en-US/i.test(v.lang));
    const pool = us.length ? us : vs;
    female = pool.find((v) => FEMALE.test(v.name) && !/male\b/i.test(v.name.replace(/female/i, ''))) || vs.find((v) => FEMALE.test(v.name)) || null;
    male = pool.find((v) => MALE.test(v.name) && !/female/i.test(v.name)) || vs.find((v) => MALE.test(v.name) && !/female/i.test(v.name)) || null;
    voice = female || pool[0] || null;
  } catch { voice = null; }
}
try {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
} catch { /* sem voz */ }

/** Quem fala: mulher, homem, menina, menino. Sem voz masculina no aparelho, muda o tom. */
export type Speaker = 'f' | 'm' | 'girl' | 'boy';

function apply(u: SpeechSynthesisUtterance, who: Speaker = 'f') {
  u.lang = 'en-US';
  const v = who === 'm' || who === 'boy' ? male ?? voice : female ?? voice;
  if (v) u.voice = v;
  const fakeMale = (who === 'm' || who === 'boy') && !male;
  u.pitch = who === 'girl' ? 1.35 : who === 'boy' ? (fakeMale ? 0.95 : 1.25) : who === 'm' ? (fakeMale ? 0.6 : 0.95) : 1.05;
}

let defaultWho: Speaker = 'f';
/** Voz padrão dos exercícios (o player alterna homem e mulher para treinar o ouvido). */
export function setDefaultSpeaker(w: Speaker) { defaultWho = w; }

export function hasMaleVoice() { return !!male; }

export function say(text: string, opts: { slow?: boolean; lang?: 'en' | 'pt'; who?: Speaker } = {}) {
  try {
    speechSynthesis.cancel();
    const clean = text.replace(/___/g, 'blank').replace(/\p{Extended_Pictographic}/gu, '');
    const u = new SpeechSynthesisUtterance(clean);
    if (opts.lang === 'pt') u.lang = 'pt-BR';
    else apply(u, opts.who ?? defaultWho);
    u.rate = opts.slow ? 0.55 : 0.88;
    speechSynthesis.speak(u);
  } catch { /* ignora */ }
}

export function stopVoice() {
  try { speechSynthesis.cancel(); } catch { /* ignora */ }
}

type Rec = { start(): void; stop(): void; abort(): void; lang: string; interimResults: boolean; maxAlternatives: number; onresult: ((e: any) => void) | null; onerror: ((e: any) => void) | null; onend: (() => void) | null };

export function canListen(): boolean {
  const w = window as any;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

/** Escuta a criança. Retorna o texto ouvido (ou '' se não entendeu). */
export function listen(onText: (t: string) => void, onEnd: () => void): () => void {
  const w = window as any;
  const C = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!C) { onEnd(); return () => {}; }
  const rec: Rec = new C();
  rec.lang = 'en-US';
  rec.interimResults = false;
  rec.maxAlternatives = 3;
  let got = false;
  rec.onresult = (e: any) => {
    const alts: string[] = [];
    for (const res of e.results) for (const a of res) alts.push(a.transcript);
    got = true;
    onText(alts.join(' | '));
  };
  rec.onerror = () => { /* permissão negada ou sem internet: a Camila avalia */ };
  rec.onend = () => { if (!got) onText(''); onEnd(); };
  try { rec.start(); } catch { onEnd(); }
  return () => { try { rec.abort(); } catch { /* ignora */ } };
}

/** Lê várias frases em sequência, uma de cada vez (espera cada uma terminar). Retorna função para parar. */
export function sayLines(lines: string[], onLine: (i: number) => void, onDone: () => void, voices: Speaker[] = []): () => void {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const next = (i: number) => {
    if (stopped) return;
    if (i >= lines.length) { onDone(); return; }
    onLine(i);
    try {
      const u = new SpeechSynthesisUtterance(lines[i]);
      apply(u, voices[i] ?? 'f');
      u.rate = 0.85;
      let advanced = false;
      const go = () => { if (advanced) return; advanced = true; timer = setTimeout(() => next(i + 1), 450); };
      u.onend = go;
      u.onerror = go;
      // segurança: se o navegador não avisar o fim, segue pelo tamanho da frase
      timer = setTimeout(go, 1500 + lines[i].split(' ').length * 520);
      speechSynthesis.speak(u);
    } catch { timer = setTimeout(() => next(i + 1), 1500); }
  };
  try { speechSynthesis.cancel(); } catch { /* ignora */ }
  next(0);
  return () => { stopped = true; if (timer) clearTimeout(timer); try { speechSynthesis.cancel(); } catch { /* ignora */ } };
}
