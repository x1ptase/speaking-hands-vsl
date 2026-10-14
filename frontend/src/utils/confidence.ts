/** Converts a backend confidence (0-1) to a percentage, or null when it is not a valid number. */
export function confidenceToPercent(confidence: unknown): number | null {
  if (typeof confidence !== 'number' || !Number.isFinite(confidence)) return null;
  return Math.round(Math.min(Math.max(confidence, 0), 1) * 1000) / 10;
}
