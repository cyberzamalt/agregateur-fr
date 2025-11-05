// apps/web/components/RatingStars.tsx
export default function RatingStars({ value = 0, outOf = 5, size = 16 }: { value?: number; outOf?: number; size?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5 ? 1 : 0;
  const empty = Math.max(0, outOf - full - half);

  const starStyle: React.CSSProperties = { display: "inline-block", fontSize: size, lineHeight: 1, marginRight: 2 };

  return (
    <span aria-label={`${value} sur ${outOf} étoiles`}>
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f${i}`} style={starStyle}>★</span>
      ))}
      {half === 1 && <span style={starStyle}>☆</span>}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} style={{ ...starStyle, opacity: 0.35 }}>☆</span>
      ))}
    </span>
  );
}
