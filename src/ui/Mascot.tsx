// Mascote: um salsicha (dachshund) com cara de danadinho. Discreto: fica quieto respirando e
// abanando o rabo devagar; pula de alegria no acerto, murcha a orelha no erro e comemora no fim.
import { useEffect, useState } from 'react';

export type Mood = 'idle' | 'happy' | 'sad' | 'cheer' | 'listen';

export function Mascot({ mood = 'idle', size = 96, say, nonce = 0 }: { mood?: Mood; size?: number; say?: string; nonce?: number }) {
  const [m, setM] = useState<Mood>(mood);
  useEffect(() => {
    setM(mood);
    if (mood === 'happy' || mood === 'sad') {
      const t = setTimeout(() => setM('idle'), mood === 'happy' ? 1400 : 1800);
      return () => clearTimeout(t);
    }
  }, [mood, nonce]);

  return (
    <div className={`mascot m-${m}`} style={{ width: size, height: size * 0.72 }} aria-hidden="true">
      {say && <span className="mbubble">{say}</span>}
      <svg viewBox="0 0 160 115" width={size} height={size * 0.72}>
        <ellipse className="mshadow" cx="80" cy="108" rx="52" ry="5" fill="#0A0F1F" opacity=".12" />
        <g className="mdog">
          {/* rabo */}
          <g className="mtail">
            <path d="M30 58 C18 52 12 40 16 30" stroke="#A85A1E" strokeWidth="7" strokeLinecap="round" fill="none" />
          </g>
          {/* patas de trás */}
          <rect className="mleg l1" x="34" y="78" width="11" height="22" rx="5.5" fill="#8F4B17" />
          <rect className="mleg l2" x="48" y="80" width="11" height="20" rx="5.5" fill="#A85A1E" />
          {/* corpo comprido */}
          <g className="mbody">
            <rect x="26" y="50" width="88" height="38" rx="19" fill="#B8662A" />
            <path d="M44 84 C60 92 92 92 106 82 L106 74 C88 82 62 82 44 76 Z" fill="#E3A86B" />
            {/* coleira com plaquinha azul Lesete */}
            <rect x="99" y="50" width="9" height="34" rx="4.5" fill="#1F5AE2" />
            <circle cx="104" cy="86" r="5" fill="#FFC93C" stroke="#E0A800" strokeWidth="1.5" />
          </g>
          {/* patas da frente */}
          <rect className="mleg l3" x="86" y="80" width="11" height="20" rx="5.5" fill="#A85A1E" />
          <rect className="mleg l4" x="99" y="78" width="11" height="22" rx="5.5" fill="#8F4B17" />
          {/* cabeça */}
          <g className="mhead">
            <path d="M100 30 C100 14 116 6 128 10 C138 13 142 22 142 30 L154 40 C158 44 156 52 150 53 L128 56 C112 58 100 46 100 30 Z" fill="#B8662A" />
            <path d="M138 44 L152 41 C156 44 155 50 150 51 L134 52 Z" fill="#E3A86B" />
            <ellipse className="mnose" cx="153" cy="41" rx="5" ry="4.2" fill="#1B1B1F" />
            {/* olho de danadinho: meio fechado, de lado */}
            <g className="meye">
              <ellipse cx="127" cy="27" rx="5" ry="5.6" fill="#1B1B1F" />
              <circle cx="128.8" cy="25" r="1.8" fill="#fff" />
              <path className="mlid" d="M120.5 23.5 Q127 19 133.5 23" stroke="#8F4B17" strokeWidth="3" strokeLinecap="round" fill="#B8662A" />
            </g>
            <path className="msmile" d="M136 50 Q140 54 145 51" stroke="#5B2D0C" strokeWidth="2" strokeLinecap="round" fill="none" />
            <ellipse className="mblush" cx="134" cy="38" rx="4" ry="2.4" fill="#F28C8C" opacity=".55" />
            {/* orelha caída */}
            <g className="mear">
              <path d="M108 18 C96 20 92 36 96 50 C99 58 108 58 111 50 C114 40 114 26 108 18 Z" fill="#7A3E12" />
            </g>
          </g>
        </g>
        {/* estrelinhas no acerto */}
        <g className="msparks" fill="#FFC93C">
          <path d="M60 18 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
          <path d="M92 6 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
          <path d="M28 26 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z" />
        </g>
      </svg>
    </div>
  );
}
