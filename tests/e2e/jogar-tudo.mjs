// Robô: cria a Camila e a Anne, joga TODAS as lições e provinhas e abre as telas da professora.
// Uso: npm run build && node tests/e2e/jogar-tudo.mjs   (prints em tests/e2e/prints)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
import { play } from './bot.mjs';
const S=path.join(here,'prints')+'/'; mkdirSync(S,{recursive:true});
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const ctx = await b.newContext({ viewport: { width: 400, height: 860 } });
const p = await ctx.newPage();
const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('console', m=>m.type()==='error'&&errs.push(m.text()));
await p.goto(pathToFileURL(path.join(here, '../../dist/index.html')).href + '?test'); await p.waitForTimeout(500);
await p.screenshot({path:path.join(here,'prints','00-setup1.png')}).catch(()=>{});
await p.click('text=Continuar');
await p.fill('#sa','9'); await p.screenshot({path:path.join(here,'prints','00-setup2.png')}).catch(()=>{});
await p.click('text=Continuar');
await p.fill('#gn0','Giovane'); await p.fill('#gp0','(31) 9 0000-0000');
await p.screenshot({path:path.join(here,'prints','00-setup3.png')}).catch(()=>{});
await p.click('text=Começar a trilha'); await p.waitForTimeout(300);
await p.screenshot({path:path.join(here,'prints','01-perfis.png')});
await p.click('text=Anne'); await p.waitForTimeout(200);

// joga TODAS as lições de todas as units liberando pela provinha
const { UNITS_IDS } = { UNITS_IDS: [1,2,3,4,5,6,7,8,9,10,11] };
let shot=0;
for (const u of UNITS_IDS){
  const nodes = p.locator(`section:has(.uband:has-text("Unit ${String(u).padStart(2,'0')}")) .node:not(.lock)`);
  const n = await nodes.count();
  for (let i=0;i<n;i++){
    await p.locator(`section:has(.uband:has-text("Unit ${String(u).padStart(2,'0')}")) .node`).nth(i).click(); await p.waitForTimeout(150);
    await play(p);
    if (u===1 && i===0) await p.screenshot({path:S+'r-end.png'});
    await p.click('.result button:is(:text-is("Trilha"), :text-is("Continuar"))');
  }
  await p.click(`text=Provinha da Unit ${u}`); await p.waitForTimeout(150);
  await play(p);
  if (u===1) await p.screenshot({path:S+'r-quiz.png'});
  await p.click('.result button:is(:text-is("Trilha"), :text-is("Continuar"))'); await p.waitForTimeout(100);
}
await p.screenshot({path:S+'r-home.png'});
await p.click('text=Minhas notas'); await p.waitForTimeout(150); await p.screenshot({path:S+'r-notas.png', fullPage:true});
await p.click('.ktabs >> text=Figurinhas'); await p.waitForTimeout(150); await p.screenshot({path:S+'r-album.png'});
await p.setViewportSize({width:1280,height:900});
await p.click('text=Sair'); await p.click('.pcard.prof');
await p.waitForTimeout(300); await p.screenshot({path:S+'t1-dash.png', fullPage:true});
await p.click('text=+ Registrar aula de hoje'); await p.waitForTimeout(200);
await p.locator('.lessonpick button').first().click(); await p.locator('.lessonpick button').nth(1).click();
await p.fill('#cn','Anne leu a história sozinha.'); await p.fill('#cg','Fazer o Homework da Unit 1 com os pais');
await p.screenshot({path:S+'t2-aula.png'});
await p.click('text=Salvar aula'); await p.waitForTimeout(200);
await p.click('text=Calendário anual'); await p.waitForTimeout(200); await p.click('.seg button:has-text("Anne")');
await p.screenshot({path:S+'t3-cal.png', fullPage:true});
await p.click('nav >> text=Alunos'); await p.click('.srow'); await p.waitForTimeout(200);
await p.screenshot({path:S+'t4-ficha.png', fullPage:true});
await p.click('text=Notas'); await p.screenshot({path:S+'t5-notas.png', fullPage:true});
await p.click('nav >> text=Gabarito'); await p.screenshot({path:S+'t6-gab.png'});
await p.setViewportSize({width:400,height:860}); await p.click('nav >> text=Início'); await p.screenshot({path:S+'t7-mobile.png'});
if (errs.length) { console.error('ERROS NA TELA:', errs); process.exit(1); }
console.log('OK: todas as units, provinhas e telas da professora funcionaram.');
await b.close();
