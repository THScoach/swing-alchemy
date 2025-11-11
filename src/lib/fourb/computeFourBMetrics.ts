/**
 * 4B Metrics Computation Engine
 * 
 * Computes Body, Bat, Ball, and Brain metrics with robust guardrails
 * and support for both player and model modes.
 */

export type AnalysisMode = 'player' | 'model';
export type PlayerLevel = 'youth' | 'hs' | 'college' | 'pro' | 'other';

export interface FourBConfig {
  mode: AnalysisMode;
  level: PlayerLevel;
  pixelsPerInch?: number; // Camera calibration factor
  minNorm?: number; // Minimum normalization scalar
}

export interface PoseFrame {
  frame: number;
  timestamp: number;
  pelvis: { x: number; y: number } | null;
  shoulders: { x: number; y: number } | null;
  head: { x: number; y: number } | null;
}

export interface KinematicPeaks {
  pelvis: number | null;
  torso: number | null;
  arm: number | null;
  bat: number | null;
}

export interface WeirdnessFlags {
  comOutOfRange: boolean;
  headMovementExtreme: boolean;
  spineStdHigh: boolean;
  sequenceImpossible: boolean;
  insufficientFrames: boolean;
}

// ============================================================================
// BODY METRICS
// ============================================================================

/**
 * Generic range-based scoring function for Reboot-style metrics
 */
export function rangeScore(
  value: number | null | undefined,
  idealMin: number,
  idealMax: number,
  hardMin: number,
  hardMax: number
): number {
  if (value == null || isNaN(value)) return 50;

  // Hard guardrail - outside realistic bounds
  if (value < hardMin || value > hardMax) return 40;

  // Inside ideal range - perfect score
  if (value >= idealMin && value <= idealMax) return 100;

  // Calculate distance from ideal range
  const dist = value < idealMin ? idealMin - value : value - idealMax;

  // Lose 5 points per unit outside ideal range, floor at 60
  const score = 100 - dist * 5;
  return Math.max(60, Math.min(100, score));
}

/**
 * Compute COM forward movement percentage (legacy single metric)
 */
export function computeCOMForward(
  pelvisStance: { x: number; y: number },
  pelvisContact: { x: number; y: number },
  plateX: number,
  config: FourBConfig
): { value: number; score: number; confidence: 'high' | 'low' } {
  const deltaX = pelvisContact.x - pelvisStance.x;
  const normalize = Math.max(plateX - pelvisStance.x, config.minNorm || 1);
  
  let comPct = (deltaX / normalize) * 100;

  // Guardrails
  if (!isFinite(comPct)) comPct = 0;
  comPct = Math.max(-5, Math.min(comPct, 60));

  const confidence = (comPct < 0 || comPct > 40) ? 'low' : 'high';
  const score = scoreCOM(comPct, config.mode);

  return { value: comPct, score, confidence };
}

/**
 * Reboot-style extended COM scoring using three-phase metrics
 */
export function scoreRebootCOM(
  negativeMovePct: number | null,
  footDownPct: number | null,
  maxForwardPct: number | null
): {
  negMoveScore: number;
  footDownScore: number;
  maxForwardScore: number;
  overallScore: number;
} {
  // Score each phase using rangeScore
  const negMoveScore = rangeScore(negativeMovePct, 30, 40, 10, 60);
  const footDownScore = rangeScore(footDownPct, 40, 50, 20, 70);
  const maxForwardScore = rangeScore(maxForwardPct, 55, 65, 30, 80);

  // Weighted overall: max_forward is most important
  const overallScore = Math.round(
    maxForwardScore * 0.5 +
    footDownScore * 0.3 +
    negMoveScore * 0.2
  );

  return {
    negMoveScore,
    footDownScore,
    maxForwardScore,
    overallScore: Math.max(40, Math.min(100, overallScore))
  };
}

function scoreCOM(comPct: number, mode: AnalysisMode): number {
  if (comPct <= 0) return 40;
  if (comPct >= 40) return 50;

  if (mode === 'model') {
    // Elite band: 18-22%
    const ideal = 20;
    const diff = Math.abs(comPct - ideal);
    if (diff <= 2) return 100 - diff * 2; // 18-22% => 96-100
    if (diff <= 5) return 90 - (diff - 2) * 3; // narrow bands
    if (diff <= 8) return 75 - (diff - 5) * 4;
    return Math.max(40, 60 - (diff - 8) * 2);
  }

  // Player mode - broader bands
  const ideal = 20;
  const diff = Math.abs(comPct - ideal);
  if (diff <= 5) return 95 - diff * 1; // 15-25% => 90-95
  if (diff <= 10) return 85 - (diff - 5) * 2; // 10-15 / 25-30 => 75-85
  return Math.max(40, 70 - (diff - 10) * 2);
}

/**
 * Compute head movement in inches
 */
export function computeHeadMovement(
  headStance: { x: number; y: number },
  headContact: { x: number; y: number },
  config: FourBConfig
): { value: number; score: number; confidence: 'high' | 'low' } | null {
  const dx = headContact.x - headStance.x;
  const dy = headContact.y - headStance.y;
  
  const pixelsPerInch = config.pixelsPerInch || 10;
  let headMoveInches = Math.sqrt(dx * dx + dy * dy) / pixelsPerInch;

  if (!isFinite(headMoveInches) || headMoveInches < 0) return null;

  // Guardrails
  headMoveInches = Math.max(0, Math.min(headMoveInches, 18));
  const confidence = headMoveInches > 15 ? 'low' : 'high';
  const score = scoreHeadMovement(headMoveInches, config.mode);

  return { value: headMoveInches, score, confidence };
}

function scoreHeadMovement(inches: number, mode: AnalysisMode): number {
  const x = Math.max(0, Math.min(inches, 18));

  if (mode === 'model') {
    // Elite expectations: 0-2.5" => 98-100
    if (x <= 2.5) return 100 - x * 0.8;
    if (x <= 4) return 94 - (x - 2.5) * 4; // 4" => 88
    if (x <= 6) return 88 - (x - 4) * 6;
    return Math.max(40, 76 - (x - 6) * 4);
  }

  // Player mode
  if (x <= 3) return 100 - x * 2; // 0"=100, 3"=94
  if (x <= 6) return 94 - (x - 3) * 4; // 6"≈82
  if (x <= 9) return 82 - (x - 6) * 6; // 9"≈64
  return Math.max(40, 64 - (x - 9) * 3);
}

/**
 * Compute spine stability (variance in tilt angle)
 */
export function computeSpineStability(
  poseSeries: PoseFrame[],
  startFrame: number,
  endFrame: number
): { value: number; score: number; confidence: 'high' | 'low' } | null {
  const validFrames = poseSeries
    .filter(f => f.frame >= startFrame && f.frame <= endFrame)
    .filter(f => f.pelvis && f.shoulders);

  if (validFrames.length < 8) return null;

  const tilts = validFrames.map(f => {
    const angle = Math.atan2(
      f.shoulders!.y - f.pelvis!.y,
      f.shoulders!.x - f.pelvis!.x
    );
    return Math.abs(90 - (angle * 180 / Math.PI));
  });

  const mean = tilts.reduce((a, b) => a + b, 0) / tilts.length;
  const variance = tilts.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / tilts.length;
  let std = Math.sqrt(variance);

  // Guardrails
  std = Math.max(0, Math.min(std, 25));
  const confidence = std > 20 ? 'low' : 'high';
  const score = scoreSpineStability(std);

  return { value: std, score, confidence };
}

function scoreSpineStability(std: number): number {
  const s = Math.max(0, Math.min(std, 25));
  if (s <= 3) return 100 - s * 2; // 0=100, 3=94
  if (s <= 6) return 94 - (s - 3) * 4; // 6=82
  if (s <= 10) return 82 - (s - 6) * 5; // 10=62
  return Math.max(40, 62 - (s - 10) * 3);
}

/**
 * Compute kinematic sequence correctness
 */
export function computeSequenceCorrectness(
  peaks: KinematicPeaks
): { value: boolean; score: number; details: string } {
  const { pelvis, torso, arm, bat } = peaks;

  if (![pelvis, torso, arm, bat].every(t => typeof t === 'number')) {
    return {
      value: false,
      score: 70,
      details: 'Incomplete kinematic data'
    };
  }

  const eps = 0.008; // 8ms tolerance

  const pelvisFirst = pelvis! + eps <= torso!;
  const torsoNext = torso! + eps <= arm!;
  const armNext = arm! + eps <= bat!;

  const correctCount = [pelvisFirst, torsoNext, armNext].filter(Boolean).length;

  let score: number;
  if (correctCount === 3) score = 100;
  else if (correctCount === 2) score = 85;
  else if (correctCount === 1) score = 70;
  else score = 55;

  return {
    value: correctCount === 3,
    score,
    details: `${correctCount}/3 transitions correct`
  };
}

// ============================================================================
// BAT METRICS
// ============================================================================

const BAT_SPEED_TARGETS = {
  youth: { good: 55, elite: 65 },
  hs: { good: 65, elite: 75 },
  college: { good: 70, elite: 80 },
  pro: { good: 75, elite: 90 },
  other: { good: 60, elite: 70 },
};

export function scoreBatSpeed(v: number, level: PlayerLevel): number {
  if (!v || v <= 0) return 50;
  
  const targets = BAT_SPEED_TARGETS[level] || BAT_SPEED_TARGETS.hs;
  const { good, elite } = targets;

  if (v <= good - 10) return 40;
  if (v >= elite) return 100;

  const min = good - 10;
  return Math.max(40, Math.min(100, 40 + ((v - min) / (elite - min)) * 60));
}

export function scoreAttackAngle(angle: number): number {
  // Ideal band: 8-20°
  const clamped = Math.max(-10, Math.min(angle, 35));
  
  if (clamped >= 8 && clamped <= 20) return 95 + (15 - Math.abs(clamped - 14)) * 0.5;
  if (clamped >= 5 && clamped <= 25) {
    const diff = Math.min(Math.abs(clamped - 8), Math.abs(clamped - 20));
    return 85 - diff * 3;
  }
  if (clamped >= 0 && clamped <= 30) {
    const diff = Math.min(Math.abs(clamped - 5), Math.abs(clamped - 25));
    return 70 - diff * 4;
  }
  return Math.max(40, 60 - Math.abs(clamped - 15) * 2);
}

export function scoreTimeInZone(ms: number): number {
  // Target: 150-200ms
  const clamped = Math.max(50, Math.min(ms, 250));
  
  if (clamped >= 150 && clamped <= 200) return 95 + (175 - Math.abs(clamped - 175)) * 0.2;
  if (clamped >= 120 && clamped <= 220) {
    const diff = Math.min(Math.abs(clamped - 150), Math.abs(clamped - 200));
    return 85 - diff * 0.4;
  }
  return Math.max(40, 70 - Math.abs(clamped - 175) * 0.3);
}

// ============================================================================
// BALL METRICS
// ============================================================================

const EV90_TARGETS = {
  youth: { good: 75, elite: 85 },
  hs: { good: 85, elite: 95 },
  college: { good: 90, elite: 100 },
  pro: { good: 95, elite: 105 },
  other: { good: 80, elite: 90 },
};

export function scoreExitVelocity90(ev90: number, level: PlayerLevel): number {
  if (!ev90 || ev90 <= 0) return 50;
  
  const targets = EV90_TARGETS[level] || EV90_TARGETS.hs;
  const { good, elite } = targets;

  if (ev90 <= good - 15) return 40;
  if (ev90 >= elite) return 100;

  const min = good - 15;
  return Math.max(40, Math.min(100, 40 + ((ev90 - min) / (elite - min)) * 60));
}

export function scoreLaunchAngle90(la90: number): number {
  // Ideal band: 10-30°
  const clamped = Math.max(-5, Math.min(la90, 50));
  
  if (clamped >= 10 && clamped <= 30) return 95 + (20 - Math.abs(clamped - 20)) * 0.3;
  if (clamped >= 5 && clamped <= 35) {
    const diff = Math.min(Math.abs(clamped - 10), Math.abs(clamped - 30));
    return 85 - diff * 2;
  }
  return Math.max(40, 70 - Math.abs(clamped - 20) * 2);
}

export function scoreRate(rate: number): number {
  // Direct percentage mapping (0-1 -> 0-100)
  const pct = Math.max(0, Math.min(rate, 1));
  return 40 + pct * 60; // Scale 0-1 to 40-100
}

// ============================================================================
// AGGREGATE SCORES
// ============================================================================

export function safeAverage(scores: (number | null | undefined)[]): number | null {
  const valid = scores.filter((s): s is number => typeof s === 'number' && !isNaN(s) && isFinite(s));
  if (valid.length === 0) return null;
  
  const clamped = valid.map(s => Math.max(0, Math.min(100, s)));
  return clamped.reduce((a, b) => a + b, 0) / clamped.length;
}

// ============================================================================
// WEIRDNESS DETECTOR
// ============================================================================

export function detectWeirdness(metrics: {
  comPct?: number | null;
  headMovement?: number | null;
  spineStd?: number | null;
  sequence?: KinematicPeaks;
  frameCount?: number;
}): WeirdnessFlags {
  const flags: WeirdnessFlags = {
    comOutOfRange: false,
    headMovementExtreme: false,
    spineStdHigh: false,
    sequenceImpossible: false,
    insufficientFrames: false,
  };

  // COM out of realistic range
  if (metrics.comPct != null) {
    flags.comOutOfRange = metrics.comPct < -2 || metrics.comPct > 45;
  }

  // Head movement impossibly large
  if (metrics.headMovement != null) {
    flags.headMovementExtreme = metrics.headMovement > 18;
  }

  // Spine variance too high (likely tracking error)
  if (metrics.spineStd != null) {
    flags.spineStdHigh = metrics.spineStd > 25;
  }

  // Kinematic sequence timestamps impossible
  if (metrics.sequence) {
    const { pelvis, torso, arm, bat } = metrics.sequence;
    if ([pelvis, torso, arm, bat].every(t => typeof t === 'number')) {
      // Check for backwards time or unrealistic gaps
      const times = [pelvis!, torso!, arm!, bat!];
      for (let i = 1; i < times.length; i++) {
        if (times[i] < times[i - 1] - 0.05) { // >50ms backwards
          flags.sequenceImpossible = true;
        }
        if (times[i] - times[i - 1] > 0.15) { // >150ms gap
          flags.sequenceImpossible = true;
        }
      }
    }
  }

  // Not enough frames for reliable metrics
  if (metrics.frameCount != null) {
    flags.insufficientFrames = metrics.frameCount < 8;
  }

  return flags;
}

export function hasAnyWeirdness(flags: WeirdnessFlags): boolean {
  return Object.values(flags).some(v => v === true);
}

export function getWeirdnessMessage(flags: WeirdnessFlags): string | null {
  const issues: string[] = [];
  
  if (flags.comOutOfRange) issues.push("COM% out of realistic range");
  if (flags.headMovementExtreme) issues.push("Head movement >18 inches");
  if (flags.spineStdHigh) issues.push("Spine variance >25°");
  if (flags.sequenceImpossible) issues.push("Kinematic sequence timing inconsistent");
  if (flags.insufficientFrames) issues.push("Not enough frames for reliable analysis");

  return issues.length > 0 
    ? `⚠️ Tracking quality issues: ${issues.join(", ")}`
    : null;
}
