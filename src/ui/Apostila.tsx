// A apostila de verdade dentro do app: a criança e a professora abrem a página de qualquer exercício.
import { useEffect, useState } from 'react';
import { UNITS, REVIEWS, allLessons } from '../content';

export const TOTAL_PAGES = 52;
export const pageSrc = (pdf: number) => `./apostila/p${String(pdf).padStart(2, '0')}.webp`;

/** Nome de cada página do PDF, na ordem da apostila. */
export function pageInfo(pdf: number): { label: string; unit?: number; color: string } {
  if (pdf === 1) return { label: 'Capa', color: '#272C67' };
  if (pdf === 52) return { label: 'You Did It!', color: '#272C67' };
  if (pdf === 50 || pdf === 51) return { label: `Fun Zone · p. ${pdf - 22}`, color: '#FF5C5C' };
  const rv = REVIEWS.find((r) => r.lesson.ref.pdf === pdf);
  if (rv) return { label: `${rv.lesson.title} · p. ${rv.lesson.ref.printed}`, color: rv.color };
  for (const { unitId, lesson } of allLessons()) {
    if (lesson.ref.pdf === pdf) {
      const u = UNITS.find((x) => x.id === unitId)!;
      return { label: `Unit ${unitId} · ${lesson.ref.printed ? `p. ${lesson.ref.printed}` : lesson.ref.section}`, unit: unitId, color: u.color };
    }
  }
  for (const u of UNITS) for (const l of u.lessons) for (const it of l.items) if (it.ref?.pdf === pdf) return { label: `Unit ${u.id} · ${it.ref.printed ? `p. ${it.ref.printed}` : it.ref.section}`, unit: u.id, color: u.color };
  return { label: `Página ${pdf}`, color: '#272C67' };
}

let owner = { name: '', color: '#1F5AE2' };
/** Dono do livro (nome da aluna e cor do tema), mostrado na capa e no rodapé das páginas. */
export function setBookOwner(name: string, color: string) { owner = { name, color }; }

export function openApostila(pdf: number) {
  window.dispatchEvent(new CustomEvent('apostila', { detail: pdf }));
}

export function ApostilaHost() {
  const [pdf, setPdf] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    const h = (e: Event) => { setPdf((e as CustomEvent<number>).detail); setZoom(false); };
    window.addEventListener('apostila', h);
    return () => window.removeEventListener('apostila', h);
  }, []);
  useEffect(() => {
    if (pdf === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPdf(null);
      if (e.key === 'ArrowRight') setPdf((p) => Math.min(TOTAL_PAGES, (p ?? 1) + 1));
      if (e.key === 'ArrowLeft') setPdf((p) => Math.max(1, (p ?? 1) - 1));
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [pdf]);
  if (pdf === null) return null;
  const info = pageInfo(pdf);
  const title = owner.name ? `Livro ${/[aeiouáé]$/i.test(owner.name) ? 'da' : 'do'} ${owner.name}` : 'Apostila 1';
  return (
    <div className="apv" role="dialog" aria-label="Página da apostila" style={{ ['--own' as string]: owner.color }}>
      <div className="apv-bar">
        <button className="chipbtn" onClick={() => setPdf(null)}>✕ Fechar</button>
        <span className="apv-title"><b>📒 {title}</b><small style={{ color: info.color }}>{info.label}</small></span>
        <span className="small mute tnum">{pdf}/{TOTAL_PAGES}</span>
      </div>
      <div className="apv-stage">
        <button className="apv-arrow l" disabled={pdf <= 1} onClick={() => setPdf(pdf - 1)} aria-label="Página anterior">‹</button>
        <div className={`apv-page${zoom ? ' zoom' : ''}`} onClick={() => setZoom(!zoom)}>
          <div className="sheet-paper" key={pdf}>
            <div className="spiral" aria-hidden="true">{Array.from({ length: 14 }).map((_, i) => <i key={i} />)}</div>
            <img src={pageSrc(pdf)} alt={`Apostila, ${info.label}`} />
            <div className="sheet-foot"><span>{title}</span><span className="tnum">{pdf}</span></div>
          </div>
        </div>
        <button className="apv-arrow r" disabled={pdf >= TOTAL_PAGES} onClick={() => setPdf(pdf + 1)} aria-label="Próxima página">›</button>
      </div>
      <div className="apv-strip">
        {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
          <button key={i} className={i + 1 === pdf ? 'on' : ''} style={{ background: pageInfo(i + 1).color }} onClick={() => setPdf(i + 1)} aria-label={`Página ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

/** Estante da apostila em forma de caderno: capa com o nome da aluna e abas por unit. */
export function ApostilaShelf({ name, color = '#1F5AE2' }: { name?: string; color?: string }) {
  const groups: { id: string; title: string; short: string; color: string; pages: number[] }[] = [{ id: 'capa', title: 'Capa', short: 'Capa', color: '#272C67', pages: [1] }];
  for (const u of UNITS) {
    const pages = Array.from(new Set(u.lessons.map((l) => l.ref.pdf).concat(u.lessons.flatMap((l) => l.items.map((i) => i.ref?.pdf ?? l.ref.pdf))))).sort((a, b) => a - b);
    groups.push({ id: `u${u.id}`, title: `Unit ${u.id} · ${u.title}`, short: `${u.emoji} ${u.id}`, color: u.color, pages });
    const rv = REVIEWS.find((r) => r.afterUnit === u.id);
    if (rv) groups.push({ id: rv.lesson.id, title: rv.title, short: '🔄', color: rv.color, pages: [rv.lesson.ref.pdf] });
  }
  groups.push({ id: 'fun', title: 'Fun Zone · You Did It!', short: '🎮', color: '#FF5C5C', pages: [50, 51, 52] });
  const [sel, setSel] = useState('u1');
  useEffect(() => { setBookOwner(name ?? '', color); }, [name, color]);
  const g = groups.find((x) => x.id === sel) ?? groups[1];
  const title = name ? `Livro ${/[aeiouáé]$/i.test(name) ? 'da' : 'do'} ${name}` : 'Apostila 1';
  return (
    <div className="notebook" style={{ ['--own' as string]: color }}>
      <div className="nb-cover">
        <div className="spiral" aria-hidden="true">{Array.from({ length: 9 }).map((_, i) => <i key={i} />)}</div>
        <div>
          <small>My First English Adventure! · Apostila 1</small>
          <h2>📒 {title}</h2>
          <p>{TOTAL_PAGES} páginas · toque numa página para estudar</p>
        </div>
      </div>
      <div className="nb-tabs" role="tablist">
        {groups.map((x) => (
          <button key={x.id} role="tab" aria-selected={x.id === g.id} style={{ ['--tc' as string]: x.color }} onClick={() => setSel(x.id)}>{x.short}</button>
        ))}
      </div>
      <div className="nb-page">
        <h3 style={{ color: g.color }}>{g.title}</h3>
        <div className="shelf">
          {g.pages.map((p) => (
            <button key={p} className="thumb" onClick={() => openApostila(p)} style={{ borderColor: g.color }}>
              <img src={pageSrc(p)} alt="" loading="lazy" />
              <span>{pageInfo(p).label.replace(/^Unit \d+ · /, '')}</span>
            </button>
          ))}
        </div>
        <p className="nb-hint">✏️ Dica: abra a página antes do exercício e leia junto com a Camila.</p>
      </div>
    </div>
  );
}
