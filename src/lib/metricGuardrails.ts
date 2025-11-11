/**
 * Metric guardrails to prevent unrealistic values from appearing in UI/reports
 */

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Validate and clamp COM (Center of Mass) forward movement percentage
 * Sane range: 0-200%
 */
export const safeComForward = (pct?: number | null): number | null => {
  if (pct == null || !isFinite(pct)) return null;
  return clamp(pct, 0, 200);
};

/**
 * Validate and clamp head movement in inches
 * Sane range: 0-24 inches
 */
export const safeHeadMovement = (inches?: number | null): number | null => {
  if (inches == null || !isFinite(inches)) return null;
  return clamp(inches, 0, 24);
};

/**
 * Validate and clamp 4B scores (0-100)
 */
export const safeScore = (val?: number | null): number | null => {
  if (val == null || !isFinite(val)) return null;
  return clamp(val, 0, 100);
};

/**
 * Validate and clamp bat speed (mph)
 * Sane range: 20-120 mph
 */
export const safeBatSpeed = (mph?: number | null): number | null => {
  if (mph == null || !isFinite(mph)) return null;
  return clamp(mph, 20, 120);
};

/**
 * Validate and clamp exit velocity (mph)
 * Sane range: 30-120 mph
 */
export const safeExitVelocity = (mph?: number | null): number | null => {
  if (mph == null || !isFinite(mph)) return null;
  return clamp(mph, 30, 120);
};

/**
 * Validate and clamp attack angle (degrees)
 * Sane range: -30 to 45 degrees
 */
export const safeAttackAngle = (deg?: number | null): number | null => {
  if (deg == null || !isFinite(deg)) return null;
  return clamp(deg, -30, 45);
};

/**
 * Validate and clamp spine angle variance (degrees)
 * Sane range: 0-30 degrees
 */
export const safeSpineAngleVar = (deg?: number | null): number | null => {
  if (deg == null || !isFinite(deg)) return null;
  return clamp(deg, 0, 30);
};

/**
 * Format a metric value with guardrails applied
 * Returns formatted string or placeholder if invalid
 */
export const formatSafeMetric = (
  value: number | null | undefined,
  unit: string = "",
  decimals: number = 1
): string => {
  if (value == null || !isFinite(value)) return "–";
  return `${value.toFixed(decimals)}${unit}`;
};
