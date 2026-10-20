// Robô de testes: joga lições respondendo certo, usando window.__answer (?test).
export async function solve(p, wrong=false){
  const ex = await p.evaluate(()=>window.__answer);
  if (!ex) return false;
  if (wrong && (ex.t==='choice'||ex.t==='pic') && (ex.options||ex.opts||[]).length>1){ const w=(ex.options||ex.opts).find(o=>o!==ex.a); await p.locator('.opt').filter({ hasText: new RegExp('^\\s*'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$') }).first().click(); await p.click('button.btn:has-text("Verificar")'); return true; }
  const clickTile = async (sel, text) => { const loc = p.locator(sel).filter({ hasText: new RegExp('^\\s*'+text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$') }); await loc.first().click(); };
  if (ex.t==='match'){ for (const [a,b] of ex.pairs){ await clickTile('.pairs .c:nth-child(1) .pair:not(.ok)', a); await clickTile('.pairs .c:nth-child(2) .pair:not(.ok)', b);} await p.waitForTimeout(500); return; }
  if (ex.t==='speak'){ const f=p.locator('.judge .btn.ok'); if (await f.count()) await f.click(); else await p.click('text=Não posso falar agora'); return; }
  if (ex.t==='build'||ex.t==='order'){ const words = ex.t==='build'? ex.a.split(/\s+/): ex.a; for (const w of words) await clickTile('.bank .tile:not(.ghost)', w); }
  if (ex.t==='scramble'){ for (const l of ex.a.replace(/\s/g,'').split('')) await clickTile('.bank .tile:not(.ghost)', l); }
  if (ex.t==='fill'){ await clickTile('.bank .tile', ex.a); }
  if (ex.t==='choice'||ex.t==='pic'||ex.t==='hear'){ await clickTile('.opt', ex.a); }
  if (ex.t==='type'){ await p.fill('.typein', ex.a); }
  if (ex.t==='sort'){ for (const [gi,[,ws]] of ex.groups.entries()) for (const w of ws){ await clickTile('.bank .tile', w); await p.locator('.sortcol').nth(gi).locator('.target').click(); } }
  await p.click('button.btn:has-text("Verificar")');
  return false;
}
export async function play(p, wrongFirst=0){
  if (await p.locator('text=Começar os exercícios').count()) await p.click('text=Começar os exercícios');
  for (let i=0;i<80;i++){
    await p.waitForTimeout(80);
    if (await p.locator('.result').count()) return;
    if (await p.locator('.pfoot >> text=Continuar').count()) { await p.click('.pfoot >> text=Continuar'); continue; }
    if (await solve(p, wrongFirst>0)) wrongFirst--;
  }
}
