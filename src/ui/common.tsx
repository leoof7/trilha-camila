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
