// Revisão visual: abre lição por lição (PC e celular), fotografa a página da lição e cada exercício,
// e procura problemas de layout (texto vazando, botão fora da tela, pergunta vazia).
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { solve } from './bot.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, 'revisao'); mkdirSync(OUT, { recursive: true });
const ONLY = process.env.UNITS ? process.env.UNITS.split(',').map(Number) : [1,2,3,4,5,6,7,8,9,10,11];
const W = Number(process.env.W || 1440), H = Number(process.env.H || 900);
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto(pathToFileURL(path.join(here, '../../dist/index.html')).href + '?test'); await p.waitForTimeout(400);
if (await p.locator('text=Usar sem conta').count()) await p.click('text=Usar sem conta');
await p.click('text=Continuar'); await p.fill('#sa', '9'); await p.click('text=Continuar'); await p.click('text=Começar a trilha');
await p.click('.pcard.prof'); await p.click('text=▶ Iniciar aula'); await p.click('text=Começar a aula');
await p.click('.today button:text-is("▶ Trilha de Anne")');
const problems = [];
const check = async (where) => {
  const r = await p.evaluate(() => {
    const out = [];
    const vw = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > vw + 2) out.push(`página mais larga que a tela (${document.documentElement.scrollWidth}px)`);
    for (const el of document.querySelectorAll('.stage *, .lpage *, .pfoot *')) {
      const s = getComputedStyle(el);
      if (s.overflow === 'visible' && el.scrollWidth > el.clientWidth + 3 && el.clientWidth > 0 && el.children.length === 0 && el.textContent.trim()) out.push(`texto vazando: "${el.textContent.trim().slice(0, 40)}"`);
      const rc = el.getBoundingClientRect();
      if (rc.width > 0 && (rc.right > vw + 2 || rc.left < -2) && el.textContent.trim()) out.push(`fora da tela: "${el.textContent.trim().slice(0, 40)}"`);
    }
    const q = document.querySelector('.stage');
    if (q && !q.textContent.trim()) out.push('exercício vazio');
    return [...new Set(out)].slice(0, 6);
  });
  for (const x of r) problems.push(`${where}: ${x}`);
};
for (const u of ONLY) {
  const sec = `section:has(.uband:has-text("Capítulo ${u} ·"))`;
  const n = await p.locator(`${sec} .node`).count();
  for (let i = 0; i < n; i++) {
    await p.locator(`${sec} .node`).nth(i).click(); await p.waitForTimeout(250);
    const tag = `u${String(u).padStart(2, '0')}-l${i + 1}`;
    await p.screenshot({ path: `${OUT}/${tag}-00-pagina.png`, fullPage: true }); await check(`${tag} página`);
    if (await p.locator('text=Começar os exercícios').count()) await p.click('text=Começar os exercícios');
    for (let k = 1; k <= 30; k++) {
      await p.waitForTimeout(120);
      if (await p.locator('.result').count()) break;
      if (await p.locator('.pfoot >> text=Continuar').count()) { await p.click('.pfoot >> text=Continuar'); continue; }
      const ex = await p.evaluate(() => window.__answer);
      if (!ex) continue;
      await p.screenshot({ path: `${OUT}/${tag}-${String(k).padStart(2, '0')}-${ex.t}.png` }); await check(`${tag} ex${k} (${ex.t})`);
      await solve(p);
    }
    await p.click('.result button:is(:text-is("Trilha"), :text-is("Continuar"))').catch(() => {});
    if (!(await p.locator('.ktabs').count())) { await p.click('text=‹').catch(() => {}); }
    await p.waitForTimeout(150);
    if (!(await p.locator(sec).count())) await p.click('.ktabs >> text=Trilha').catch(() => {});
  }
}
writeFileSync(`${OUT}/problemas-${W}.txt`, problems.join('\n') + (errs.length ? '\nERROS: ' + errs.join('\n') : ''));
console.log(problems.length, 'problemas;', errs.length, 'erros');
await b.close();
