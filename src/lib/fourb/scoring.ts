// 4B Scoring Engine

import { 
  BrainData, 
  BodyData, 
  BatData, 
  BallData,
  PlayerLevel,
  TileState 
} from './types';
import { 
  batSpeedTargets,
  ev90Targets,
  rebootBaselines,
  launchAngleStandards,
  batMechanicsStandards,
  s2Thresholds,
  scoreStates
} from './config';

// Brain Scoring (S2 Cognition)
export function calculateBrainScore(data: BrainData | null): {
  score: number | null;
  state: TileState;
  label: string;
} {
  if (!data || !data.overall_percentile) {
    return { score: null, state: 'no-data', label: 'No Data' };
  }

  const percentiles = [
    data.processing_speed,
    data.tracking_focus,
    data.impulse_control,
    data.decision_making
  ].filter(Boolean) as number[];

  const score = percentiles.length > 0 
    ? percentiles.reduce((a, b) => a + b, 0) / percentiles.length
    : data.overall_percentile;

  if (score >= s2Thresholds.synced) {
    return { score, state: 'synced', label: 'Synced' };
  } else if (score >= s2Thresholds.growing) {
    return { score, state: 'developing', label: 'Growing' };
  } else {
    return { score, state: 'limiting', label: 'Limiting Factor' };
  }
}

// Body Scoring (Motion/Kinematic)
export function calculateBodyScore(data: BodyData | null): {
  score: number | null;
  state: TileState;
  label: string;
} {
  if (!data) {
    return { score: null, state: 'no-data', label: 'No Data' };
  }

  let totalScore = 0;
  let factors = 0;

  // COM Forward Movement (lower is better)
  if (data.com_forward_movement_pct !== undefined) {
    factors++;
    if (data.com_forward_movement_pct <= rebootBaselines.com_forward_movement.excellent) {
      totalScore += 100;
    } else if (data.com_forward_movement_pct <= rebootBaselines.com_forward_movement.acceptable) {
      totalScore += 75;
    } else {
      totalScore += 50;
    }
  }

  // Spine Stability (higher is better)
  if (data.spine_stability_score !== undefined) {
    factors++;
    if (data.spine_stability_score >= rebootBaselines.spine_stability.excellent) {
      totalScore += 100;
    } else if (data.spine_stability_score >= rebootBaselines.spine_stability.acceptable) {
      totalScore += 75;
    } else {
      totalScore += 50;
    }
  }

  // Spine Angle Variance (lower is better)
  if (data.spine_angle_var_deg !== undefined) {
    factors++;
    if (data.spine_angle_var_deg <= rebootBaselines.spine_angle_variance.excellent) {
      totalScore += 100;
    } else if (data.spine_angle_var_deg <= rebootBaselines.spine_angle_variance.acceptable) {
      totalScore += 75;
    } else {
      totalScore += 50;
    }
  }

  // Head Movement (lower is better)
  if (data.head_movement_inches !== undefined) {
    factors++;
    if (data.head_movement_inches <= rebootBaselines.head_movement.excellent) {
      totalScore += 100;
    } else if (data.head_movement_inches <= rebootBaselines.head_movement.acceptable) {
      totalScore += 75;
    } else {
      totalScore += 50;
    }
  }

  if (factors === 0) {
    return { score: null, state: 'no-data', label: 'No Data' };
  }

  const score = totalScore / factors;

  if (score >= scoreStates.body.anchored) {
    return { score, state: 'synced', label: 'Anchored' };
  } else if (score >= scoreStates.body.drifting) {
    return { score, state: 'developing', label: 'Drifting' };
  } else {
    return { score, state: 'limiting', label: 'Unstable' };
  }
}

// Bat Scoring (Speed/Mechanics)
export function calculateBatScore(
  data: BatData | null,
  playerLevel: PlayerLevel
): {
  score: number | null;
  state: TileState;
  label: string;
} {
  if (!data || !data.avg_bat_speed) {
    return { score: null, state: 'no-data', label: 'No Data' };
  }

  const target = batSpeedTargets[playerLevel];
  const speedRatio = data.avg_bat_speed / target;

  let score = speedRatio * 100;

  // Apply penalties for inconsistency
  if (data.bat_speed_sd && data.bat_speed_sd > batMechanicsStandards.bat_speed_sd_excellent) {
    score *= 0.9;
  }

  // Check attack angle
  const aaInRange = data.attack_angle_avg && 
    data.attack_angle_avg >= batMechanicsStandards.attack_angle_min &&
    data.attack_angle_avg <= batMechanicsStandards.attack_angle_max;

  if (!aaInRange) {
    score *= 0.85;
  }

  // Cap at 100
  score = Math.min(score, 100);

  if (score >= scoreStates.bat.onPlane) {
    return { score, state: 'synced', label: 'Bat On Plane' };
  } else if (score >= scoreStates.bat.inconsistent) {
    return { score, state: 'developing', label: 'Inconsistent' };
  } else {
    return { score, state: 'limiting', label: 'Bat Leak' };
  }
}

// Ball Scoring (Outcomes)
export function calculateBallScore(
  data: BallData | null,
  playerLevel: PlayerLevel
): {
  score: number | null;
  state: TileState;
  label: string;
} {
  if (!data || !data.ev90) {
    return { score: null, state: 'no-data', label: 'No Data' };
  }

  const evTarget = ev90Targets[playerLevel];
  const evRatio = data.ev90 / evTarget;

  let score = evRatio * 100;

  // Penalize high LA standard deviation
  if (data.la_sd && data.la_sd > launchAngleStandards.sd_excellent) {
    score *= 0.9;
  }

  // Bonus for good barrel rate
  if (data.barrel_like_rate && data.barrel_like_rate > 0.4) {
    score *= 1.05;
  }

  // Cap at 100
  score = Math.min(score, 100);

  if (score >= scoreStates.ball.matched) {
    return { score, state: 'synced', label: 'Matched Impact' };
  } else if (score >= scoreStates.ball.underused) {
    return { score, state: 'developing', label: 'Underused Impact' };
  } else {
    return { score, state: 'limiting', label: 'Mismatched Impact' };
  }
}

// Calculate Overall 4B Score
export function calculateFourBSummary(scores: {
  brain?: number | null;
  body?: number | null;
  bat?: number | null;
  ball?: number | null;
}): {
  overallScore: number | null;
  overallState: TileState;
  overallLabel: string;
  strongestArea: string | null;
  focusArea: string | null;
} {
  const availableScores = Object.entries(scores)
    .filter(([_, score]) => score !== null && score !== undefined)
    .map(([key, score]) => ({ area: key, score: score as number }));

  if (availableScores.length === 0) {
    return {
      overallScore: null,
      overallState: 'no-data',
      overallLabel: 'No Data',
      strongestArea: null,
      focusArea: null,
    };
  }

  const overallScore = 
    availableScores.reduce((sum, s) => sum + s.score, 0) / availableScores.length;

  let overallState: TileState;
  let overallLabel: string;

  if (overallScore >= scoreStates.overall.synced) {
    overallState = 'synced';
    overallLabel = '4B Synced';
  } else if (overallScore >= scoreStates.overall.developing) {
    overallState = 'developing';
    overallLabel = '4B Developing';
  } else {
    overallState = 'limiting';
    overallLabel = '4B Out of Sync';
  }

  const sorted = [...availableScores].sort((a, b) => b.score - a.score);
  const strongestArea = sorted[0]?.area || null;
  const focusArea = sorted[sorted.length - 1]?.area || null;

  return {
    overallScore,
    overallState,
    overallLabel,
    strongestArea,
    focusArea,
  };
}

// Compute EV90, LA90, LA_SD from ball tracking data
export function computeBallMetrics(
  exitVelocities: number[],
  launchAngles: number[]
): {
  ev90: number;
  la90: number;
  la_sd: number;
} {
  const sortedEV = [...exitVelocities].sort((a, b) => b - a);
  const sortedLA = [...launchAngles].sort((a, b) => b - a);

  const ev90Index = Math.floor(exitVelocities.length * 0.1);
  const la90Index = Math.floor(launchAngles.length * 0.1);

  const ev90 = sortedEV[ev90Index] || sortedEV[0] || 0;
  const la90 = sortedLA[la90Index] || sortedLA[0] || 0;

  // Calculate LA standard deviation
  const laMean = launchAngles.reduce((a, b) => a + b, 0) / launchAngles.length;
  const laVariance = 
    launchAngles.reduce((sum, la) => sum + Math.pow(la - laMean, 2), 0) / 
    launchAngles.length;
  const la_sd = Math.sqrt(laVariance);

  return { ev90, la90, la_sd };
}

// Compute barrel-like rate from tracking data
export function computeBarrelLikeRate(
  exitVelocities: number[],
  launchAngles: number[],
  ev90Player: number
): number {
  const minBarrelEV = Math.max(0.9 * ev90Player, 70);
  
  let barrelCount = 0;
  const total = exitVelocities.length;

  for (let i = 0; i < total; i++) {
    const ev = exitVelocities[i];
    const la = launchAngles[i];

    if (
      ev >= minBarrelEV &&
      la >= launchAngleStandards.barrel_min &&
      la <= launchAngleStandards.barrel_max
    ) {
      barrelCount++;
    }
  }

  return total > 0 ? barrelCount / total : 0;
}
