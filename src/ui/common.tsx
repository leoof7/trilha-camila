import { useEffect, useState, type ReactNode } from 'react';
import type { Student } from '../store/types';
import { letter, type GradeScale } from '../engine/grade';
import { refLabel, type Ref } from '../content';
import { openApostila } from './Apostila';

export function Avatar({ s, size = 44 }: { s: Pick<Student, 'name' | 'photo' | 'gender'>; size?: number }) {
  const bg = s.gender === 'm' ? '#1F5AE2' : '#E8458B';
  return (
    <span className="avatar" style={{ width: size, height: size, background: bg, fontSize: size * 0.45 }}>
      {s.photo ? <img src={s.photo} alt="" /> : s.name.trim()[0]?.toUpperCase()}
    </span>
  );
}

export function LetterBadge({ points, scale, sm }: { points: number; scale: GradeScale; sm?: boolean }) {
  const l = letter(points, scale);
  return <span className={`lt lt-${l}${sm ? ' sm' : ''}`} aria-label={`Nota ${l}`}>{l}</span>;
}

export function RefTag({ r }: { r?: Ref }) {
  if (!r) return null;
  return (
    <button className="ref" onClick={() => openApostila(r.pdf)} title="Abrir esta página da apostila">
      📖 <b>{r.printed ? `p. ${r.printed}` : 'Apostila'}</b> {r.section} <u>ver página</u>
    </button>
  );
}
export { refLabel };

export function Modal({ children, onClose, label }: { children: ReactNode; onClose: () => void; label: string }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" role="dialog" aria-label={label} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

let toastSet: ((s: string) => void) | null = null;
export function toast(msg: string) { toastSet?.(msg); }
export function ToastHost() {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    toastSet = (s) => { setMsg(s); setTimeout(() => setMsg(''), 2600); };
    return () => { toastSet = null; };
  }, []);
  return msg ? <div className="toast" role="status">{msg}</div> : null;
}

export function Confetti() {
  const colors = ['#FF5C5C', '#FFD43B', '#5BB8FF', '#00C9A7', '#C084FC', '#FF6B9D', '#FFAB40'];
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 60 }).map((_, i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, background: colors[i % colors.length], animationDelay: `${(i % 12) * 0.08}s` }} />
      ))}
    </div>
  );
}

/** Estrelinhas explodindo do centro (fim de lição) e chuva de estrelas (unit completa). */
export function StarBurst({ big }: { big?: boolean }) {
  const n = big ? 36 : 18;
  return (
    <>
      <div className="starburst" aria-hidden="true">
        {Array.from({ length: n }).map((_, i) => {
          const ang = (i / n) * Math.PI * 2, dist = 140 + (i % 4) * 45;
          return <i key={i} style={{ ['--dx' as string]: `${Math.cos(ang) * dist}px`, ['--dy' as string]: `${Math.sin(ang) * dist}px`, ['--rot' as string]: `${(i % 2 ? 1 : -1) * 220}deg`, animationDelay: `${(i % 6) * 0.04}s` }}>{i % 5 === 0 ? '🌟' : '⭐'}</i>;
        })}
      </div>
      {big && (
        <div className="starburst starrain" aria-hidden="true">
          {Array.from({ length: 40 }).map((_, i) => <i key={i} style={{ left: `${(i * 23) % 100}%`, fontSize: 18 + (i % 4) * 8, animationDelay: `${0.4 + (i % 10) * 0.12}s` }}>{['⭐', '🌟', '✨', '💫'][i % 4]}</i>)}
        </div>
      )}
    </>
  );
}

export function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 24, c = 2 * Math.PI * r;
  return (
    <svg className="ring" viewBox="0 0 58 58" aria-hidden="true">
      <circle cx="29" cy="29" r={r} fill="none" stroke="#E4E5F2" strokeWidth="7" />
      <circle cx="29" cy="29" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, pct))} transform="rotate(-90 29 29)" />
      <text x="29" y="34" textAnchor="middle" fontSize="16" fontWeight="800" fill="#23264F">{pct >= 1 ? '✓' : `${Math.round(pct * 100)}%`}</text>
    </svg>
  );
}

export function fmtDate(d: string) {
  const [y, m, dd] = d.split('-');
  return `${dd}/${m}/${y}`;
}

export const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

/** Presença: Presente ou Falta. "Justificada" é um detalhe da falta (o dado continua 'J'). */
export function PresencePick({ value, onChange }: { value?: 'P' | 'F' | 'J'; onChange: (p: 'P' | 'F' | 'J') => void }) {
  const absent = value === 'F' || value === 'J';
  return (
    <div className="presence">
      <button className="P" aria-pressed={value === 'P'} onClick={() => onChange('P')}>Presente</button>
      <button className={value === 'J' ? 'J' : 'F'} aria-pressed={absent} onClick={() => onChange(absent ? value! : 'F')}>Falta</button>
      {absent && (
        <label className="just">
          <input type="checkbox" checked={value === 'J'} onChange={() => onChange(value === 'J' ? 'F' : 'J')} /> justificada
        </label>
      )}
    </div>
  );
}
