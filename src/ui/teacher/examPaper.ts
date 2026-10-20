// Folha de prova para imprimir ou mandar aos pais (HTML que vira PDF no "Imprimir").
// Todo texto de exercício vem da apostila (content/); aqui só se monta o papel.
import type { Exam, Student } from '../../store/types';
import type { KeyMap, Prepared } from '../../engine/session';
import { buildExam } from '../../engine/session';
import { askFor } from '../../content/instructions';
import { refLabel, itemById, unitById } from '../../content';
import { shuffle } from '../../engine/check';

/** As instruções do app falam em "tocar"; no papel a criança escreve ou liga. */
const onPaper = (pt: string) => pt
  .replace(/Toque numa palavra em inglês e depois na tradução dela\.?/i, 'Ligue cada frase em inglês à tradução.')
  .replace(/Toque nas letras na ordem certa para formar a palavra\.?/i, 'Escreva as letras na ordem certa para formar a palavra.')
  .replace(/ tocando nas palavras/i, ' usando as palavras do quadro')
  .replace(/Toque na palavra e depois no grupo certo\.?|Toque no animal e depois no grupo\.?/i, 'Escreva cada palavra no grupo certo.')
  .replace(/Toque nas letras para soletrar o seu nome\.?/i, 'Escreva as letras do seu nome.')
  .replace(/Toque na ordem certa\.?/i, 'Numere na ordem certa.')
  .replace(/Toque numa palavra e depois no par dela\.?/i, 'Ligue os pares.')
  .replace(/Toque na resposta certa\.?/i, 'Marque a resposta certa.')
  .replace(/^Toque /i, 'Marque ')
  .replace(/ toque /gi, ' marque ');
const esc = (x: string) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const opts = (o: string[] = []) => `<div class="opts">${o.map((x) => `<span><i></i>${esc(x)}</span>`).join('')}</div>`;
const line = '<div class="line"></div>';

function body(ex: Prepared, title = ''): string {
  const q = (x: string) => (x.trim() === title.trim() ? '' : `<p class="q">${esc(x)}</p>`);
  switch (ex.t) {
    case 'match': {
      const right = shuffle(ex.pairs.map((p) => p[1]));
      return `<div class="match"><ol>${ex.pairs.map((p) => `<li>${esc(p[0])} <b>•</b></li>`).join('')}</ol><ol type="a">${right.map((r) => `<li><b>•</b> ${esc(r)}</li>`).join('')}</ol></div>`;
    }
    case 'pic': return `<div class="emoji">${ex.emoji}</div>${opts(ex.options)}`;
    case 'build': return `${q(ex.q)}<div class="bank">${(ex.bank ?? []).map((w) => `<span>${esc(w)}</span>`).join('')}</div>${line}`;
    case 'fill': return `<p class="q">${esc(ex.q).replace(/_{2,}|\[\s*\]/g, '<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>')}</p>${opts(ex.options)}`;
    case 'choice': return `${q(ex.q)}${opts(ex.options)}`;
    case 'scramble': return `<div class="bank letters">${(ex.bank ?? []).map((w) => `<span>${esc(w.toUpperCase())}</span>`).join('')}</div><div class="boxes">${ex.a.replace(/\s/g, '').split('').map(() => '<i></i>').join('')}</div>`;
    case 'order': return `${q(ex.q)}<ul class="order">${(ex.bank ?? []).map((w) => `<li><i>(&nbsp;&nbsp;)</i> ${esc(w)}</li>`).join('')}</ul>`;
    case 'sort': return `${q(ex.q)}<div class="bank">${(ex.bank ?? []).map((w) => `<span>${esc(w)}</span>`).join('')}</div><div class="groups">${ex.groups.map((g) => `<div><b>${esc(g[0])}</b>${line}${line}</div>`).join('')}</div>`;
    case 'type': return `${q(ex.q)}${line}`;
    default: return '';
  }
}

function answer(ex: Prepared): string {
  if (ex.t === 'match') return ex.pairs.map((p) => `${p[0]} → ${p[1]}`).join(' · ');
  if (ex.t === 'order') return ex.a.join(' → ');
  if (ex.t === 'sort') return ex.groups.map((g) => `${g[0]}: ${g[1].join(', ')}`).join(' · ');
  return 'a' in ex ? String(ex.a) : '';
}

export function examHtml(exam: Exam, opt: { student?: Student; teacher: string; keys: KeyMap; withKey?: boolean }) {
  const who = opt.student ? { name: opt.student.name, age: opt.student.age } : { name: '__________', age: 0 };
  const items = buildExam(exam.itemIds, who, opt.keys);
  const color = opt.student?.gender === 'm' ? '#1F5AE2' : '#E8458B';
  const units = exam.unitIds.map((u) => unitById(u));
  const qs = items.map((ex, i) => {
    const info = itemById(ex.id);
    const ask = askFor(ex, info?.unitId ?? 1);
    return `<section class="item"><div class="num" style="background:${unitById(info?.unitId ?? 1).color}">${i + 1}</div><div class="grow"><h3>${esc(ask.en)}</h3><p class="pt">${esc(onPaper(ask.pt))}</p>${body(ex, ask.en)}<p class="ref">📖 ${esc(refLabel(ex.ref))}</p></div></section>`;
  }).join('');
  const key = opt.withKey ? `<section class="key"><h2>Gabarito (professora)</h2><ol>${items.map((ex) => `<li>${esc(answer(ex))}</li>`).join('')}</ol></section>` : '';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(exam.title)}</title>
<style>
@page{size:A4;margin:14mm}
*{box-sizing:border-box}body{margin:0;background:#F7F6F3;color:#15171B;font:500 15px/1.45 Manrope,system-ui,sans-serif}
.sheet{max-width:780px;margin:0 auto;padding:24px}
header{background:${color};color:#fff;border-radius:22px;padding:22px 26px;display:flex;gap:18px;align-items:center}
header h1{font:800 34px/1.05 Outfit,system-ui,sans-serif;margin:0}header p{margin:4px 0 0;font-weight:700;opacity:.9}
.stars{margin-left:auto;font-size:28px;color:#FFC93C;white-space:nowrap}
.who{display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px;margin:16px 0}
.who div{background:#fff;border-radius:14px;padding:10px 14px;font-weight:800;font-size:12px;color:#6B7080;letter-spacing:.06em;text-transform:uppercase}
.who b{display:block;min-height:22px;color:#15171B;font-size:16px;letter-spacing:0;text-transform:none;border-bottom:2px dotted #C9CBD6}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px}.chips span{border-radius:999px;padding:4px 12px;color:#fff;font-weight:800;font-size:12px}
.item{display:flex;gap:14px;background:#fff;border-radius:18px;padding:16px 18px;margin:12px 0;break-inside:avoid}
.num{flex:none;width:36px;height:36px;border-radius:50%;color:#fff;display:grid;place-items:center;font:800 18px Outfit,sans-serif}
.grow{flex:1;min-width:0}h3{font:800 18px Outfit,system-ui,sans-serif;margin:4px 0 0}.pt{margin:2px 0 8px;color:#6B7080;font-weight:700;font-size:13px}
.q{font-size:17px;font-weight:700;margin:6px 0}
.opts{display:flex;flex-wrap:wrap;gap:8px 18px;margin:6px 0}.opts span{display:inline-flex;gap:8px;align-items:center;font-weight:700}
.opts i{width:18px;height:18px;border:2.5px solid #15171B;border-radius:50%;display:inline-block}
.line{border-bottom:2px solid #C9CBD6;height:30px;margin:4px 0}
.bank{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.bank span{border:2px solid #E3E4EF;border-radius:10px;padding:3px 10px;font-weight:800}
.letters span{min-width:32px;text-align:center}
.boxes{display:flex;gap:6px;margin:8px 0}.boxes i{width:32px;height:38px;border-bottom:3px solid #15171B}
.match{display:grid;grid-template-columns:1fr 1fr;gap:30px}.match ol{margin:0;padding-left:22px}.match li{padding:5px 0;font-weight:700}.match ol:first-child b{float:right}
.order{list-style:none;padding:0;margin:6px 0}.order li{padding:3px 0;font-weight:700}.order i{font-style:normal;margin-right:6px;color:#6B7080}
.groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.emoji{font-size:56px;line-height:1}
.ref{margin:8px 0 0;font-size:11px;color:#8D93AB;font-weight:700}
.feedback{background:#fff;border-radius:18px;padding:16px 18px;margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.feedback b{font-size:12px;color:#6B7080;letter-spacing:.06em;text-transform:uppercase}
footer{display:flex;justify-content:space-between;color:#8D93AB;font-weight:700;font-size:12px;margin-top:18px}
.key{background:#fff;border-radius:18px;padding:16px 22px;margin-top:22px;break-before:page}.key h2{font:800 22px Outfit,sans-serif}
@media print{body{background:#fff}.item,.who div,.feedback,.key{border:1.5px solid #E3E4EF}header,.num,.chips span{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body><div class="sheet">
<header><div><h1>${esc(exam.title)}</h1><p>My First English Adventure! · Teacher ${esc(opt.teacher)}</p></div><div class="stars">★ ★ ★</div></header>
<div class="who"><div>Nome<b>${opt.student ? esc(opt.student.name) : ''}</b></div><div>Data<b></b></div><div>Nota<b></b></div></div>
<div class="chips">${units.map((u) => `<span style="background:${u.color}">Unit ${u.id} · ${esc(u.title)}</span>`).join('')}</div>
${qs}
<div class="feedback"><div><b>Teacher's feedback</b><div class="line"></div></div><div><b>Assinatura dos pais</b><div class="line"></div></div></div>
<footer><span>Trilha da Camila</span><span>Uma criação Lesete</span></footer>
${key}</div></body></html>`;
}
