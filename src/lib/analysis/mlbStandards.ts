// MLB Performance Standards for 3-Pillar Scoring
// Based on elite professional swing biomechanics research

export const mlbStandards = {
  // ANCHOR METRICS
  anchor: {
    comForwardMovement: {
      elite: { min: 15, max: 25 }, // % of total COM travel
      good: { min: 25, max: 35 },
      acceptable: { min: 10, max: 40 },
      poor: { min: 0, max: 50 }, // > 40% too much drift
    },
    rearLegBrake: {
      // Rear knee extension velocity (negative = braking)
      elite: { min: -200, max: -100 }, // deg/sec at foot plant
      good: { min: -100, max: -50 },
      acceptable: { min: -300, max: 0 },
    },
    pelvisRotationDelay: {
      // Frames between foot plant and pelvis rotation start
      elite: { min: 3, max: 8 },
      good: { min: 0, max: 12 },
      acceptable: { min: 0, max: 15 },
    },
    strideLength: {
      // As % of height
      elite: { min: 70, max: 90 },
      good: { min: 60, max: 100 },
      acceptable: { min: 50, max: 110 },
    },
    headMovement: {
      // Inches of head drift
      elite: { min: 0, max: 3 },
      good: { min: 3, max: 6 },
      acceptable: { min: 6, max: 9 },
    },
  },

  // STABILITY (SEQUENCE) METRICS
  stability: {
    pelvisPeakVelocity: {
      // Frame number (normalized to 100)
      elite: { min: 30, max: 45 },
      good: { min: 25, max: 50 },
      acceptable: { min: 20, max: 55 },
    },
    torsoPeakVelocity: {
      // Should peak after pelvis
      elite: { min: 40, max: 55 },
      good: { min: 35, max: 60 },
      acceptable: { min: 30, max: 65 },
    },
    leadArmPeakVelocity: {
      // Should peak after torso
      elite: { min: 50, max: 65 },
      good: { min: 45, max: 70 },
      acceptable: { min: 40, max: 75 },
    },
    handPeakVelocity: {
      // Should peak last, near contact
      elite: { min: 65, max: 80 },
      good: { min: 60, max: 85 },
      acceptable: { min: 55, max: 90 },
    },
    peakSuccessionGap: {
      // Average frames between peaks (should be evenly spaced)
      elite: { min: 8, max: 15 },
      good: { min: 5, max: 18 },
      acceptable: { min: 3, max: 22 },
    },
    spineSideBend: {
      // Degrees of lateral bend at contact
      elite: { min: 5, max: 15 },
      good: { min: 3, max: 20 },
      acceptable: { min: 0, max: 25 },
    },
    spineForwardBend: {
      // Degrees of forward bend variance
      elite: { min: 0, max: 10 },
      good: { min: 10, max: 20 },
      acceptable: { min: 20, max: 30 },
    },
    torsoPelvisRatio: {
      // Peak torso velocity / peak pelvis velocity
      elite: { min: 1.2, max: 1.8 },
      good: { min: 1.0, max: 2.0 },
      acceptable: { min: 0.8, max: 2.5 },
    },
  },

  // WHIP (DOUBLE PENDULUM) METRICS
  whip: {
    handAccelAfterTorsoDecel: {
      // Timing gap (frames) - hands should accelerate as torso slows
      elite: { min: -5, max: 5 }, // Slight overlap is good
      good: { min: -10, max: 10 },
      acceptable: { min: -15, max: 15 },
    },
    armHandPeakGap: {
      // Frames between lead arm and hand peaks
      elite: { min: 10, max: 20 },
      good: { min: 5, max: 25 },
      acceptable: { min: 0, max: 30 },
    },
    batLagAngle: {
      // Degrees of bat lag at torso peak rotation
      elite: { min: 30, max: 50 },
      good: { min: 20, max: 60 },
      acceptable: { min: 10, max: 70 },
    },
    batLagStability: {
      // Standard deviation of lag angle (lower is better)
      elite: { min: 0, max: 8 },
      good: { min: 8, max: 15 },
      acceptable: { min: 15, max: 25 },
    },
    arcRadiusEfficiency: {
      // Hand path circularity score (0-100)
      elite: { min: 80, max: 100 },
      good: { min: 65, max: 80 },
      acceptable: { min: 50, max: 65 },
    },
    handPathTightness: {
      // SD of hand path radius (inches) - lower is better
      elite: { min: 0, max: 2 },
      good: { min: 2, max: 4 },
      acceptable: { min: 4, max: 6 },
    },
    peakHandAcceleration: {
      // m/s^2
      elite: { min: 40, max: 70 },
      good: { min: 30, max: 80 },
      acceptable: { min: 20, max: 90 },
    },
  },
};

// Helper to map a value to 0-100 score based on standards
export function mapToScore(
  value: number | null | undefined,
  elite: { min: number; max: number },
  good: { min: number; max: number },
  acceptable: { min: number; max: number }
): number {
  if (value === null || value === undefined) return 50; // Default if no data

  // Check if in elite range
  if (value >= elite.min && value <= elite.max) {
    return 95; // Elite
  }

  // Check if in good range
  if (value >= good.min && value <= good.max) {
    return 80; // Good
  }

  // Check if in acceptable range
  if (value >= acceptable.min && value <= acceptable.max) {
    return 65; // Acceptable
  }

  // Outside all ranges - calculate distance from acceptable
  const distanceBelow = acceptable.min - value;
  const distanceAbove = value - acceptable.max;

  if (distanceBelow > 0) {
    // Below acceptable min
    return Math.max(0, 65 - distanceBelow * 2);
  } else {
    // Above acceptable max
    return Math.max(0, 65 - distanceAbove * 2);
  }
}
