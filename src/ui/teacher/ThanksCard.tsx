// Card do dia para os pais (só na área da professora): imagem quadrada + mensagem de agradecimento
// para mandar no WhatsApp. Só sai para quem esteve presente na aula.
import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../state';
import { Modal, toast, Avatar } from '../common';
import type { ClassRecord, Student } from '../../store/types';
import { findLesson, unitById } from '../../content';

const longDate = (iso: string) => new Date(iso + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

export function thanksText(c: ClassRecord, s: Student, teacher: string, guardianName?: string) {
  const a = s.gender === 'm' ? 'o' : 'a';
  const seen = c.lessons.map((l) => findLesson(l)?.lesson.title).filter(Boolean) as string[];
  return [
    `Oi${guardianName ? `, ${guardianName}` : ''}! 💛`,
    `Muito obrigada pela aula de hoje com ${a} ${s.name}!`,
    seen.length ? `Hoje a gente viu: ${seen.slice(0, 4).join(', ')}${seen.length > 4 ? ` e mais ${seen.length - 4}` : ''}.` : '',
    c.nextGoal ? `Próximo passo: ${c.nextGoal}` : '',
    `Um abraço, Teacher ${teacher}`,
  ].filter(Boolean).join('\n');
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = [];
  let line = '';
  for (const w of text.split(' ')) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
  }
  if (line) out.push(line);
  return out;
}

const loadImg = (src: string) => new Promise<HTMLImageElement | null>((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });

async function drawCard(cv: HTMLCanvasElement, c: ClassRecord, s: Student, teacher: string) {
  try { await (document as any).fonts?.ready; } catch { /* segue */ }
  const W = 1080, ctx = cv.getContext('2d')!;
  cv.width = W; cv.height = W;
  const main = s.gender === 'm' ? '#1F5AE2' : '#E8458B';
  const dark = s.gender === 'm' ? '#1744B0' : '#B92F6C';
  const D = '"Outfit", system-ui, sans-serif', B = '"Manrope", system-ui, sans-serif';
  ctx.fillStyle = '#F7F6F3'; ctx.fillRect(0, 0, W, W);
  // faixa de cima
  ctx.fillStyle = main; ctx.beginPath(); ctx.roundRect(40, 40, W - 80, 400, 48); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(120 + i * 110, 90 + (i % 2) * 300, 26 + (i % 3) * 10, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#FFC93C'; ctx.font = `800 40px ${B}`; ctx.fillText('★ ★ ★', 96, 130);
  ctx.fillStyle = '#fff'; ctx.font = `800 120px ${D}`; ctx.fillText('Thank you!', 92, 262);
  ctx.font = `700 40px ${B}`; ctx.fillText('Obrigada pela aula de hoje', 96, 330);
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = `700 30px ${B}`; ctx.fillText(longDate(c.date), 96, 390);
  // aluno
  const cx = W - 200, cy = 250, r = 110;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  const img = s.photo ? await loadImg(s.photo) : null;
  if (img) ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  else { ctx.fillStyle = dark; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); ctx.fillStyle = '#fff'; ctx.font = `800 110px ${D}`; ctx.textAlign = 'center'; ctx.fillText(s.name[0].toUpperCase(), cx, cy + 38); ctx.textAlign = 'left'; }
  ctx.restore();
  // cartão branco
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(40, 470, W - 80, 490, 48); ctx.fill();
  ctx.fillStyle = '#15171B'; ctx.font = `800 54px ${D}`; ctx.fillText(`${s.name} arrasou! 💛`, 96, 560);
  let y = 630;
  const all = c.lessons.map((l) => findLesson(l)).filter(Boolean) as NonNullable<ReturnType<typeof findLesson>>[];
  const seen = all.slice(0, 3);
  if (seen.length) {
    ctx.fillStyle = '#6B7080'; ctx.font = `800 26px ${B}`; ctx.fillText('HOJE A GENTE VIU', 96, y); y += 52;
    for (const f of seen) {
      ctx.fillStyle = unitById(f.unitId).color; ctx.beginPath(); ctx.arc(110, y - 12, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#15171B'; ctx.font = `700 34px ${B}`; ctx.fillText(`${f.lesson.title}  ·  Unit ${f.unitId}`, 140, y); y += 50;
    }
    if (all.length > 3) { ctx.fillStyle = '#6B7080'; ctx.font = `700 28px ${B}`; ctx.fillText(`e mais ${all.length - 3} ${all.length - 3 === 1 ? 'atividade' : 'atividades'} da apostila`, 140, y - 6); y += 40; }
  }
  if (c.nextGoal) {
    ctx.fillStyle = '#6B7080'; ctx.font = `800 26px ${B}`; ctx.fillText('PRÓXIMO PASSO', 96, y + 10); y += 52;
    ctx.fillStyle = '#15171B'; ctx.font = `700 32px ${B}`;
    for (const ln of wrap(ctx, c.nextGoal, W - 200).slice(0, 2)) { ctx.fillText(ln, 96, y + 6); y += 44; }
  }
  // rodapé
  ctx.fillStyle = '#15171B'; ctx.font = `800 40px ${D}`; ctx.fillText(`Teacher ${teacher}`, 60, 1028);
  ctx.fillStyle = '#8D93AB'; ctx.font = `700 24px ${B}`; ctx.textAlign = 'right'; ctx.fillText('Trilha da Camila · Uma criação Lesete', W - 60, 1028); ctx.textAlign = 'left';
}

export function ThanksCard({ c, onClose }: { c: ClassRecord; onClose: () => void }) {
  const { db } = useApp();
  const present = db.students.filter((s) => c.attendance[s.id] === 'P');
  const [sid, setSid] = useState(present[0]?.id ?? '');
  const s = present.find((x) => x.id === sid);
  const cv = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!s || !cv.current) return;
    drawCard(cv.current, c, s, db.settings.teacherName).then(() => setUrl(cv.current!.toDataURL('image/png')));
  }, [sid]);
  if (!s) return (
    <Modal label="Card do dia" onClose={onClose}><h2>Card do dia</h2><p className="mute">Ninguém marcado como presente nesta aula.</p><button className="btn ghost" onClick={onClose}>Fechar</button></Modal>
  );
  const fileName = `obrigada-${s.name.toLowerCase()}-${c.date}.png`;
  const guardians = (s.guardians ?? []).filter((g) => g.name);
  const share = async () => {
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], fileName, { type: 'image/png' });
      if ((navigator as any).canShare?.({ files: [file] })) { await navigator.share({ files: [file], text: thanksText(c, s, db.settings.teacherName) }); return; }
    } catch { /* cai no baixar */ }
    const a = document.createElement('a'); a.href = url; a.download = fileName; a.click();
    toast('Imagem baixada. Anexe no WhatsApp.');
  };
  return (
    <Modal label="Card do dia para os pais" onClose={onClose}>
      <h2>💬 Card do dia para os pais</h2>
      {present.length > 1 && <div className="seg">{present.map((x) => <button key={x.id} aria-pressed={x.id === sid} onClick={() => setSid(x.id)}>{x.name}</button>)}</div>}
      <canvas ref={cv} className="thanks-cv" aria-label={`Card de agradecimento da aula de ${s.name}`} />
      <div className="row wrap">
        <button className="btn blue" onClick={share}>📤 Enviar imagem</button>
        <button className="btn ghost" onClick={() => { const a = document.createElement('a'); a.href = url; a.download = fileName; a.click(); }}>⬇ Baixar</button>
        <button className="btn ghost" onClick={() => { navigator.clipboard?.writeText(thanksText(c, s, db.settings.teacherName)).then(() => toast('Mensagem copiada.'), () => toast('Não deu para copiar.')); }}>📋 Copiar mensagem</button>
      </div>
      {guardians.length > 0 && (
        <div className="col" style={{ gap: 6 }}>
          <span className="lbl">Abrir conversa no WhatsApp (a mensagem já vai escrita)</span>
          <div className="row wrap">
            {guardians.map((g) => {
              const digits = (g.phone ?? '').replace(/\D/g, '');
              const num = digits.length >= 10 && !digits.startsWith('55') ? `55${digits}` : digits;
              return num
                ? <a key={g.name} className="btn sm wa" href={`https://wa.me/${num}?text=${encodeURIComponent(thanksText(c, s, db.settings.teacherName, g.name))}`} target="_blank" rel="noreferrer"><Avatar s={{ name: g.name, gender: g.role === 'pai' ? 'm' : 'f' }} size={22} /> {g.name}</a>
                : <span key={g.name} className="small mute">{g.name}: sem WhatsApp cadastrado</span>;
            })}
          </div>
          <p className="small mute">No celular, “Enviar imagem” abre o WhatsApp com a foto. No computador, baixe a imagem e anexe na conversa.</p>
        </div>
      )}
    </Modal>
  );
}
