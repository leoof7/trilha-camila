// Robô: monta a escola, inicia uma aula, joga TODAS as lições e provinhas no modo aula,
// finaliza a aula (card para os pais), cria e aplica uma prova do caderno, confere a ficha
// do aluno (acertos, erros, notas, frequência) e entra como aluno com a senha padrão (o nome).
// Uso: npm run build && node tests/e2e/jogar-tudo.mjs   (prints em tests/e2e/prints)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { play } from './bot.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const S = path.join(here, 'prints') + '/'; mkdirSync(S, { recursive: true });
const b = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const ctx = await b.newContext({ viewport: { width: 400, height: 860 } });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
const must = async (sel, why) => { if (!(await p.locator(sel).count())) { await p.screenshot({ path: S + 'FALHOU.png', fullPage: true }); throw new Error(`Faltou na tela: ${why} (${sel})`); } };
const text = async () => (await p.locator('body').innerText());

await p.goto(pathToFileURL(path.join(here, '../../dist/index.html')).href + '?test'); await p.waitForTimeout(500);
// primeiro acesso
await p.click('text=Continuar');
await p.fill('#sa', '9');
await p.click('text=Continuar');
await p.fill('#gn0', 'Giovane'); await p.fill('#gp0', '(31) 9 0000-0000');
await p.click('text=Começar a trilha'); await p.waitForTimeout(300);
await p.screenshot({ path: S + '01-entrada.png' });

// professora inicia a aula (dia, hora e presença) com o plano sugerido
await p.click('.pcard.prof'); await p.waitForTimeout(200);
await p.click('text=▶ Iniciar aula'); await p.waitForTimeout(200);
await must('.presence', 'presença na tela de iniciar aula');
await p.screenshot({ path: S + '02-iniciar-aula.png' });
await p.click('text=Começar a aula'); await p.waitForTimeout(200);
await must('text=Plano de hoje', 'plano da aula no painel');
await p.click('.today button:text-is("▶ Trilha de Anne")'); await p.waitForTimeout(200);
await must('text=🏠 Meu menu', 'botão para a professora voltar ao menu');
await p.screenshot({ path: S + '03-trilha-cobra.png' });

// joga todas as lições e provinhas (primeira lição com 2 erros de propósito)
let first = true;
for (const u of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
  const sec = `section:has(.uband:has-text("Unit ${String(u).padStart(2, '0')}"))`;
  const n = await p.locator(`${sec} .node:not(.lock)`).count();
  for (let i = 0; i < n; i++) {
    await p.locator(`${sec} .node`).nth(i).click(); await p.waitForTimeout(150);
    await play(p, first ? 2 : 0); first = false;
    if (u === 1 && i === 0) await p.screenshot({ path: S + '04-fim-licao.png' });
    await p.click('.result button:is(:text-is("Trilha"), :text-is("Continuar"))');
  }
  await p.click(`text=Provinha da Unit ${u}`); await p.waitForTimeout(150);
  await play(p);
  await p.click('.result button:is(:text-is("Trilha"), :text-is("Continuar"))'); await p.waitForTimeout(100);
}
await p.click('.ktabs >> text=Meu boletim'); await p.waitForTimeout(150);

// volta para o menu e finaliza a aula → card para os pais
await p.setViewportSize({ width: 1280, height: 900 });
await p.click('text=🏠 Meu menu'); await p.waitForTimeout(200);
await p.click('.classbar >> text=■ Finalizar aula'); await p.waitForTimeout(200);
await p.fill('#fn', 'Anne leu a história sozinha.'); await p.fill('#fg', 'Fazer o Homework da Unit 1 com os pais');
await p.click('text=Finalizar e salvar'); await p.waitForTimeout(900);
await must('canvas.thanks-cv', 'card de agradecimento');
await must('a.wa', 'botão de WhatsApp da família');
await p.screenshot({ path: S + '05-card-pais.png' });
await p.keyboard.press('Escape'); await p.waitForTimeout(150);
await p.screenshot({ path: S + '06-hoje.png', fullPage: true });

// caderno de provas: cria, aplica no app e vê a nota
await p.click('nav >> text=Provas'); await p.click('text=+ Criar prova'); await p.waitForTimeout(150);
await p.screenshot({ path: S + '07-criar-prova.png' });
await p.click('text=Salvar no caderno de provas'); await p.waitForTimeout(150);
await must('.examcard', 'prova salva no caderno');
await p.click('.examcard >> text=▶ Aplicar no app'); await p.waitForTimeout(150);
await play(p);
await p.click('.result button:is(:text-is("Trilha"), :text-is("Continuar"))'); await p.waitForTimeout(100);
await p.click('text=‹ Professora'); await p.click('nav >> text=Provas'); await p.waitForTimeout(150);
await must('.examrow .lt', 'nota da prova no caderno');
await p.screenshot({ path: S + '08-provas.png', fullPage: true });
const [folha] = await Promise.all([p.waitForEvent('popup'), p.click('.examcard >> text=🖨️ Folha de Anne')]);
await folha.waitForLoadState(); await folha.setViewportSize({ width: 820, height: 1100 });
if (!(await folha.locator('.item').count())) throw new Error('Folha da prova veio vazia');
await folha.screenshot({ path: S + '08b-folha-prova.png', fullPage: true }); await folha.close();

// ficha da aluna: tudo que aconteceu precisa estar lá
await p.click('nav >> text=Alunos'); await p.click('.srow'); await p.waitForTimeout(200);
let t = await text();
if (!/Lições feitas/.test(t) || /\n0\nLições feitas/.test(t)) throw new Error('Ficha: lições feitas não apareceram');
if (!/Erros no total/.test(t)) throw new Error('Ficha: erros não apareceram');
await p.screenshot({ path: S + '09-ficha.png', fullPage: true });
await p.click('.ttabs >> text=Notas'); t = await text();
if (!t.includes('Provinha · Unit 1') || !t.includes('Prova · Unit')) throw new Error('Ficha: notas de provinha e prova não apareceram');
await p.click('.ttabs >> text=Frequência'); t = await text();
if (!t.includes('Presente')) throw new Error('Ficha: presença da aula não apareceu');
await p.click('.ttabs >> text=O que mais erra'); t = await text();
if (t.includes('Ainda sem erros')) throw new Error('Ficha: os erros de propósito não apareceram em "O que mais erra"');
await p.screenshot({ path: S + '10-ficha-erros.png' });
await p.click('.ttabs >> text=Objetivos'); t = await text();
if (!t.includes('Fazer o Homework da Unit 1 com os pais')) throw new Error('Ficha: próximo objetivo da aula não apareceu');

// outras telas da professora
for (const [nav, shot] of [['Faltas', '11-faltas'], ['Notas', '12-notas'], ['Calendário', '13-cal'], ['Trabalhos', '14-trabalhos'], ['Configurações', '15-config']]) {
  await p.click(`nav >> text=${nav}`); await p.waitForTimeout(150); await p.screenshot({ path: S + shot + '.png', fullPage: true });
}
await p.click('nav >> text=Hoje'); await must('text=💬 Card para os pais', 'card para os pais no dia');

// aluna entra com a senha padrão (o nome)
await p.setViewportSize({ width: 400, height: 860 });
await p.click('nav >> text=Sair'); await p.click('text=Sou aluno(a)'); await p.click('.pcard:has-text("Anne")');
await p.fill('#spw', 'ana'); await p.click('text=Entrar'); await p.waitForTimeout(200);
await must('text=Quase! Tente de novo.', 'aviso de senha errada');
await p.fill('#spw', 'ANNE'); await p.click('text=Entrar'); await p.waitForTimeout(200);
await must('.ktabs', 'trilha da aluna depois da senha');
await p.screenshot({ path: S + '16-aluna-trilha.png' });
await p.click('.ktabs >> text=Meu boletim'); await p.waitForTimeout(150);
await must('text=Anne leu a história sozinha.', 'descrição da aula no boletim da aluna');
await p.screenshot({ path: S + '17-aluna-boletim.png', fullPage: true });

if (errs.length) { console.error('ERROS NA TELA:', errs); process.exit(1); }
console.log('OK: aula iniciada e finalizada, todas as units e provinhas, prova do caderno, ficha completa e login da aluna.');
await b.close();
