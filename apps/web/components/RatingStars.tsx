'use client';

type Props = { value?: number; size?: number; title?: string };

export default function RatingStars({ value = 0, size = 16, title }: Props) {
  const clamp = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(clamp);
  const half = clamp - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  const starStyle: React.CSSProperties = {
    fontSize: size,
    lineHeight: 1,
    marginRight: 2,
    display: 'inline-block',
  };

  return (
    <span title={title ?? `${clamp.toFixed(1)}/5`}>
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f${i}`} style={starStyle}>★</span>
      ))}
      {half === 1 && (
        <span key="h" style={{ ...starStyle, position: 'relative' }}>
          <span aria-hidden>☆</span>
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '50%',
              overflow: 'hidden',
            }}
          >
            ★
          </span>
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} style={starStyle}>☆</span>
      ))}
    </span>
  );
}
