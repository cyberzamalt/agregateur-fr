// apps/web/components/RatingStars.tsx
export default function RatingStars({ value = 0, outOf = 5 }: { value?: number; outOf?: number }) {
  const filled = Math.round(Math.max(0, Math.min(outOf, value)));
  const chars = Array.from({ length: outOf }, (_, i) => (i < filled ? '★' : '☆')).join('');
  return <span aria-label={`note ${value}/${outOf}`} style={{ letterSpacing: 1 }}>{chars}</span>;
}
