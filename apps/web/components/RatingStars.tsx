'use client';

import React from 'react';

type Props = { value?: number; max?: number };

export default function RatingStars({ value = 0, max = 5 }: Props) {
  // si la note vient sur 10, on la ramène sur 5
  const v = value > max ? value / 2 : value;
  const full = Math.round(Math.max(0, Math.min(max, v)));

  return (
    <span aria-label={`note ${value.toFixed(1)}/${max}`}>
      {'★'.repeat(full)}
      {'☆'.repeat(max - full)}
    </span>
  );
}
