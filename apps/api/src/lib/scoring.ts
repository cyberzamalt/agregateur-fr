// apps/api/src/lib/scoring.ts
import type { Site } from "../types";

export function computeScore(s: Site): number {
  let score = 40;

  if (s.coords) score += 25;
  if (s.departement) score += 10;
  if (s.type) score += 10;
  if (s.source) score += 5;
  if (s.rating) score += Math.max(0, Math.min(10, s.rating * 2)); // 0..10

  return Math.max(0, Math.min(100, score));
}
