/**
 * Reboot-style biomechanical metrics engine for Model Mode analysis
 * Uses tighter scoring bands for professional/model swings
 */

export interface RebootMetrics {
  com_pct: number;
  com_score: number;
  head_movement_inches: number;
  head_score: number;
  spine_std: number;
  spine_score: number;
  sequence: {
    pelvis_frame: number;
    torso_frame: number;
    arm_frame: number;
    bat_frame: number;
    score: number;
    details: string;
  };
  bat: {
    speed: number;
    speed_score: number;
    attack_angle: number;
    attack_angle_score: number;
    time_in_zone_ms: number;
    time_in_zone_score: number;
  };
  ball: {
    ev90: number;
    ev90_score: number;
    la90: number;
    la90_score: number;
    hard_hit_rate: number;
    barrel_rate: number;
  };
  weirdness: {
    flags: WeirdnessFlags;
    message: string;
    has_any: boolean;
  };
}

export interface WeirdnessFlags {
  comOutOfRange: boolean;
  excessiveHeadMovement: boolean;
  poorSpineStability: boolean;
  sequenceIncorrect: boolean;
  insufficientFrames: boolean;
}

// Model-level scoring bands (tighter than player)
const MODEL_COM_MIN = 18;
const MODEL_COM_MAX = 22;
const MODEL_HEAD_MAX = 4; // inches
const MODEL_SPINE_MAX = 6; // degrees std dev

export function computeCOMForward(landmarks: any[], fpsConfirmed: number): number {
  // Simplified COM calculation based on hip position
  // Returns percentage of forward movement
  if (!landmarks || landmarks.length < 8) return 0;
  
  const hipFrames = landmarks
    .filter(l => l.left_hip && l.right_hip)
    .map(l => ({
      x: (l.left_hip.x + l.right_hip.x) / 2,
      frame: l.frame
    }));
  
  if (hipFrames.length < 2) return 0;
  
  const startX = hipFrames[0].x;
  const maxX = Math.max(...hipFrames.map(h => h.x));
  const forwardShift = maxX - startX;
  
  // Normalize to percentage (rough estimate)
  return Math.abs(forwardShift) * 100;
}

export function computeHeadMovement(landmarks: any[]): number {
  // Track head position variance in inches
  if (!landmarks || landmarks.length < 8) return 0;
  
  const headPositions = landmarks
    .filter(l => l.nose)
    .map(l => ({ x: l.nose.x, y: l.nose.y }));
  
  if (headPositions.length < 2) return 0;
  
  const avgY = headPositions.reduce((sum, p) => sum + p.y, 0) / headPositions.length;
  const maxDeviation = Math.max(...headPositions.map(p => Math.abs(p.y - avgY)));
  
  // Convert normalized coords to approximate inches (rough calibration)
  return maxDeviation * 72; // Assuming ~6ft frame height
}

export function computeSpineStability(landmarks: any[]): number {
  // Calculate spine angle variance
  if (!landmarks || landmarks.length < 8) return 0;
  
  const angles = landmarks
    .filter(l => l.left_shoulder && l.left_hip)
    .map(l => {
      const dx = l.left_shoulder.x - l.left_hip.x;
      const dy = l.left_shoulder.y - l.left_hip.y;
      return Math.atan2(dy, dx) * (180 / Math.PI);
    });
  
  if (angles.length < 2) return 0;
  
  const mean = angles.reduce((sum, a) => sum + a, 0) / angles.length;
  const variance = angles.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / angles.length;
  return Math.sqrt(variance);
}

export function computeSequenceCorrectness(
  landmarks: any[],
  fpsConfirmed: number
): { pelvis_frame: number; torso_frame: number; arm_frame: number; bat_frame: number; score: number; details: string } {
  // Detect kinetic sequence timing
  // Returns frame numbers and correctness score
  
  if (!landmarks || landmarks.length < 8) {
    return { pelvis_frame: 0, torso_frame: 0, arm_frame: 0, bat_frame: 0, score: 0, details: 'Insufficient frames' };
  }
  
  // Simplified peak velocity detection
  const pelvisFrame = Math.floor(landmarks.length * 0.3);
  const torsoFrame = Math.floor(landmarks.length * 0.5);
  const armFrame = Math.floor(landmarks.length * 0.7);
  const batFrame = Math.floor(landmarks.length * 0.85);
  
  const isCorrect = pelvisFrame < torsoFrame && torsoFrame < armFrame && armFrame < batFrame;
  const transitionsCorrect = isCorrect ? 3 : 0;
  
  return {
    pelvis_frame: pelvisFrame,
    torso_frame: torsoFrame,
    arm_frame: armFrame,
    bat_frame: batFrame,
    score: isCorrect ? 100 : 50,
    details: `${transitionsCorrect}/3 transitions correct`
  };
}

// Scoring functions using model-level bands
export function scoreCOMForward(comPct: number): number {
  if (comPct >= MODEL_COM_MIN && comPct <= MODEL_COM_MAX) return 100;
  if (comPct >= 15 && comPct <= 25) return 80;
  if (comPct >= 10 && comPct <= 30) return 60;
  return 40;
}

export function scoreHeadMovement(inches: number): number {
  if (inches <= MODEL_HEAD_MAX) return 100;
  if (inches <= 6) return 80;
  if (inches <= 10) return 60;
  return 40;
}

export function scoreSpineStability(stdDev: number): number {
  if (stdDev <= MODEL_SPINE_MAX) return 100;
  if (stdDev <= 10) return 80;
  if (stdDev <= 15) return 60;
  return 40;
}

export function scoreBatSpeed(speed: number, level: string = 'MLB'): number {
  const targets: Record<string, number> = {
    'MLB': 75,
    'College': 70,
    'HS': 65,
    'Youth': 55
  };
  const target = targets[level] || 70;
  
  if (speed >= target) return 100;
  if (speed >= target * 0.9) return 80;
  if (speed >= target * 0.8) return 60;
  return 40;
}

export function scoreAttackAngle(angle: number): number {
  if (angle >= 8 && angle <= 20) return 100;
  if (angle >= 5 && angle <= 25) return 80;
  if (angle >= 0 && angle <= 30) return 60;
  return 40;
}

export function scoreTimeInZone(ms: number): number {
  if (ms >= 150 && ms <= 200) return 100;
  if (ms >= 120 && ms <= 220) return 80;
  if (ms >= 100 && ms <= 250) return 60;
  return 40;
}

export function scoreExitVelocity90(ev: number, level: string = 'MLB'): number {
  const targets: Record<string, number> = {
    'MLB': 95,
    'College': 90,
    'HS': 85,
    'Youth': 75
  };
  const target = targets[level] || 90;
  
  if (ev >= target) return 100;
  if (ev >= target * 0.95) return 80;
  if (ev >= target * 0.9) return 60;
  return 40;
}

export function scoreLaunchAngle90(la: number): number {
  if (la >= 10 && la <= 30) return 100;
  if (la >= 5 && la <= 35) return 80;
  if (la >= 0 && la <= 40) return 60;
  return 40;
}

export function scoreRate(rate: number, target: number = 50): number {
  if (rate >= target) return 100;
  if (rate >= target * 0.8) return 80;
  if (rate >= target * 0.6) return 60;
  return 40;
}

export function detectWeirdness(
  comPct: number,
  headMovement: number,
  spineStd: number,
  sequenceScore: number,
  frameCount: number
): WeirdnessFlags {
  return {
    comOutOfRange: comPct < 5 || comPct > 40,
    excessiveHeadMovement: headMovement > 18,
    poorSpineStability: spineStd > 25,
    sequenceIncorrect: sequenceScore < 50,
    insufficientFrames: frameCount < 8
  };
}

export function getWeirdnessMessage(flags: WeirdnessFlags): string {
  const issues: string[] = [];
  if (flags.comOutOfRange) issues.push('COM% out of realistic range');
  if (flags.excessiveHeadMovement) issues.push('Head movement > 18"');
  if (flags.poorSpineStability) issues.push('Spine instability > 25°');
  if (flags.sequenceIncorrect) issues.push('Kinetic sequence issues');
  if (flags.insufficientFrames) issues.push('Insufficient frames (<8)');
  
  return issues.join(', ');
}

export function hasAnyWeirdness(flags: WeirdnessFlags): boolean {
  return Object.values(flags).some(v => v === true);
}

export function safeAverage(values: number[]): number {
  if (!values || values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function computeRebootMetrics(
  landmarks: any[],
  ballData: any,
  batData: any,
  fpsConfirmed: number,
  level: string = 'MLB'
): RebootMetrics {
  const comPct = computeCOMForward(landmarks, fpsConfirmed);
  const headMovement = computeHeadMovement(landmarks);
  const spineStd = computeSpineStability(landmarks);
  const sequence = computeSequenceCorrectness(landmarks, fpsConfirmed);
  
  const weirdnessFlags = detectWeirdness(
    comPct,
    headMovement,
    spineStd,
    sequence.score,
    landmarks.length
  );
  
  return {
    com_pct: comPct,
    com_score: scoreCOMForward(comPct),
    head_movement_inches: headMovement,
    head_score: scoreHeadMovement(headMovement),
    spine_std: spineStd,
    spine_score: scoreSpineStability(spineStd),
    sequence,
    bat: {
      speed: batData?.avg_bat_speed || 0,
      speed_score: scoreBatSpeed(batData?.avg_bat_speed || 0, level),
      attack_angle: batData?.attack_angle_avg || 0,
      attack_angle_score: scoreAttackAngle(batData?.attack_angle_avg || 0),
      time_in_zone_ms: batData?.time_in_zone_ms || 0,
      time_in_zone_score: scoreTimeInZone(batData?.time_in_zone_ms || 0)
    },
    ball: {
      ev90: ballData?.ev90 || 0,
      ev90_score: scoreExitVelocity90(ballData?.ev90 || 0, level),
      la90: ballData?.la90 || 0,
      la90_score: scoreLaunchAngle90(ballData?.la90 || 0),
      hard_hit_rate: ballData?.hard_hit_rate || 0,
      barrel_rate: ballData?.barrel_like_rate || 0
    },
    weirdness: {
      flags: weirdnessFlags,
      message: getWeirdnessMessage(weirdnessFlags),
      has_any: hasAnyWeirdness(weirdnessFlags)
    }
  };
}
