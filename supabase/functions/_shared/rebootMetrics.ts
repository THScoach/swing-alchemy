// Reboot-style biomechanics metrics engine for Model Mode
// Uses confirmed FPS and tight scoring bands for pro/model swings

export interface RebootMetrics {
  fps: number;
  com_forward_pct: number | null;
  com_score: number | null;
  head_movement_inches: number | null;
  head_movement_score: number | null;
  spine_std_deg: number | null;
  spine_score: number | null;
  sequence: {
    pelvis_frame?: number;
    torso_frame?: number;
    arm_frame?: number;
    bat_frame?: number;
    correct: boolean;
    score: number;
    details: string;
  };
  bat: {
    avg_bat_speed: number | null;
    bat_speed_score: number | null;
    attack_angle_avg: number | null;
    attack_angle_score: number | null;
    time_in_zone_ms: number | null;
    time_in_zone_score: number | null;
  };
  ball: {
    ev90: number | null;
    ev90_score: number | null;
    la90: number | null;
    la90_score: number | null;
    barrel_like_rate: number | null;
    barrel_like_score: number | null;
    hard_hit_rate: number | null;
    hard_hit_score: number | null;
  };
  aggregate: {
    body_score: number | null;
    bat_score: number | null;
    ball_score: number | null;
    overall_score: number | null;
  };
  weirdness: WeirdnessFlags;
  weirdness_message: string;
}

export interface WeirdnessFlags {
  comOutOfRange: boolean;
  excessiveHeadMovement: boolean;
  poorSpineStability: boolean;
  sequenceIncorrect: boolean;
  insufficientFrames: boolean;
}

// Helper to compute average of non-null values
export function safeAverage(values: (number | null | undefined)[]): number | null {
  const valid = values.filter((v): v is number => v != null && !isNaN(v));
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((sum, v) => sum + v, 0) / valid.length);
}

// COM Forward Movement (Model bands: 18-22% optimal)
export function scoreCOM(pct: number): number {
  if (pct >= 18 && pct <= 22) return 100;
  if (pct >= 15 && pct <= 25) return 80;
  if (pct >= 10 && pct <= 30) return 60;
  return 40;
}

// Head Movement (Model bands: ≤4" optimal)
export function scoreHead(inches: number): number {
  if (inches <= 4) return 100;
  if (inches <= 6) return 80;
  if (inches <= 10) return 60;
  return 40;
}

// Spine Stability (Model bands: ≤6° optimal)
export function scoreSpine(std: number): number {
  if (std <= 6) return 100;
  if (std <= 10) return 80;
  if (std <= 15) return 60;
  return 40;
}

// Bat Speed (Model bands by level)
export function scoreBatSpeed(speed: number, level: string): number {
  const targets: Record<string, number> = {
    'MLB': 75, 'Pro': 75, 'College': 70, 'HS': 65,
    'HS (14-18)': 65, 'Youth': 55, 'Youth (10-13)': 55, 'Other': 70
  };
  const target = targets[level] || 70;
  if (speed >= target) return 100;
  if (speed >= target * 0.9) return 80;
  if (speed >= target * 0.8) return 60;
  return 40;
}

// Attack Angle (Model bands: 8-20° optimal)
export function scoreAttackAngle(angle: number): number {
  if (angle >= 8 && angle <= 20) return 100;
  if (angle >= 5 && angle <= 25) return 80;
  if (angle >= 0 && angle <= 30) return 60;
  return 40;
}

// Time in Zone (Model bands: 150-200ms optimal)
export function scoreTimeInZone(ms: number): number {
  if (ms >= 150 && ms <= 200) return 100;
  if (ms >= 120 && ms <= 220) return 80;
  if (ms >= 100 && ms <= 250) return 60;
  return 40;
}

// Exit Velocity (Model bands by level)
export function scoreExitVelocity90(ev: number, level: string): number {
  const targets: Record<string, number> = {
    'MLB': 95, 'Pro': 95, 'College': 90, 'HS': 85,
    'HS (14-18)': 85, 'Youth': 75, 'Youth (10-13)': 75, 'Other': 90
  };
  const target = targets[level] || 90;
  if (ev >= target) return 100;
  if (ev >= target * 0.95) return 80;
  if (ev >= target * 0.9) return 60;
  return 40;
}

// Launch Angle (Model bands: 10-30° optimal)
export function scoreLaunchAngle90(la: number): number {
  if (la >= 10 && la <= 30) return 100;
  if (la >= 5 && la <= 35) return 80;
  if (la >= 0 && la <= 40) return 60;
  return 40;
}

// Rate scoring (generic for barrel rate, hard hit rate, etc.)
export function scoreRate(rate: number, target: number = 50): number {
  if (rate >= target) return 100;
  if (rate >= target * 0.8) return 80;
  if (rate >= target * 0.6) return 60;
  return 40;
}

// Sequence correctness check
export interface SequencePeaks {
  pelvis_frame?: number;
  torso_frame?: number;
  arm_frame?: number;
  bat_frame?: number;
}

export function computeSequenceCorrectness(peaks: SequencePeaks | null): {
  value: boolean;
  score: number;
  details: string;
} {
  if (!peaks) {
    return { value: false, score: 70, details: 'No kinematic data' };
  }

  const { pelvis_frame, torso_frame, arm_frame, bat_frame } = peaks;
  
  if (pelvis_frame == null || torso_frame == null || arm_frame == null || bat_frame == null) {
    return { value: false, score: 70, details: 'Incomplete kinematic data' };
  }

  // Check correct ordering
  const correctOrder = pelvis_frame < torso_frame && torso_frame < arm_frame && arm_frame < bat_frame;
  
  if (correctOrder) {
    return { value: true, score: 100, details: '3/3 transitions correct (pelvis→torso→arm→bat)' };
  } else {
    return { value: false, score: 50, details: 'Sequence timing out of order' };
  }
}

// Weirdness detection
export function detectWeirdness(params: {
  comPct: number | null;
  headMovement: number | null;
  spineStd: number | null;
  sequence: SequencePeaks | undefined;
  frameCount: number | undefined;
}): WeirdnessFlags {
  return {
    comOutOfRange: params.comPct != null && (params.comPct < 5 || params.comPct > 40),
    excessiveHeadMovement: params.headMovement != null && params.headMovement > 18,
    poorSpineStability: params.spineStd != null && params.spineStd > 25,
    sequenceIncorrect: params.sequence ? !computeSequenceCorrectness(params.sequence).value : false,
    insufficientFrames: params.frameCount != null && params.frameCount < 30,
  };
}

export function getWeirdnessMessage(flags: WeirdnessFlags): string {
  const messages: string[] = [];
  if (flags.comOutOfRange) messages.push('COM% out of realistic range');
  if (flags.excessiveHeadMovement) messages.push('Head movement > 18"');
  if (flags.poorSpineStability) messages.push('Spine instability > 25°');
  if (flags.sequenceIncorrect) messages.push('Kinetic sequence issues');
  if (flags.insufficientFrames) messages.push('Insufficient frame data');
  return messages.join(', ') || 'No issues detected';
}

export function hasAnyWeirdness(flags: WeirdnessFlags): boolean {
  return Object.values(flags).some(v => v === true);
}
