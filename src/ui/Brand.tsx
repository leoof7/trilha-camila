// Assinatura discreta da casa: "Uma criação Lesete". O produto mantém o próprio nome.
export function LeseteSymbol({ color = '#1F5AE2', height = 16 }: { color?: string; height?: number }) {
  return (
    <svg viewBox="0 0 658 374" height={height} aria-hidden="true">
      <path d="M130 0 H285 L191 290 H420 L347 374 H0 Z" fill={color} />
      <path d="M330 0 H658 L460 252 H330 L466 89 H300 Z" fill={color} />
      <path d="M446 290 H492 L468 374 H373 Z" fill={color} />
    </svg>
  );
}

export function LeseteSignature({ light }: { light?: boolean }) {
  return (
    <span className="signature" style={light ? { color: '#8D93AB' } : undefined}>
      <LeseteSymbol color={light ? '#8FB0FF' : '#1F5AE2'} /> Uma criação Lesete
    </span>
  );
}
