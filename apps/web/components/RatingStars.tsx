"use client";

type Props = { value?: number; max?: number };

export default function RatingStars({ value = 0, max = 5 }: Props) {
  const v = Math.max(0, Math.min(max, Math.round(value)));
  return (
    <span aria-label={`note ${v}/${max}`} title={`note ${v}/${max}`} style={{ letterSpacing: 2 }}>
      {"★".repeat(v)}
      <span style={{ opacity: 0.35 }}>{"★".repeat(max - v)}</span>
    </span>
  );
}
