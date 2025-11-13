// 3-Pillar Scoring Computation Engine
// Computes Anchor, Stability, and Whip scores from pose data

import { SubMetricScore, CategoryScore, SwingScore, getSeverity } from "./types";

// =========================================
// ANCHOR SCORING (0-100)
// Purpose: rear leg stability, COM control, pelvis timing
// =========================================

export function computeAnchorScore(
  poseData: any,
  comTrace: any,
  kinematics: any
): CategoryScore {
  const subMetrics: SubMetricScore[] = [
    computeCOMForwardMove(comTrace),
    computeRearLegBrakeTiming(kinematics),
    computePelvisRotationTiming(kinematics, comTrace),
    computeBackKneeAngleVelocity(poseData),
    computePelvisEarlyPushOff(kinematics),
    computeStrideLengthConsistency(poseData),
    computeStrideFootTiming(poseData, kinematics),
    computeHipHingeStability(poseData),
    computeRearFootPressure(poseData),
    computeLateralCOMRange(comTrace),
  ];

  const avgScore = subMetrics.reduce((sum, m) => sum + m.score, 0) / subMetrics.length;

  return {
    score: Math.round(avgScore),
    subMetrics,
  };
}

// =========================================
// STABILITY (SEQUENCE) SCORING (0-100)
// Purpose: kinematic sequence, trunk control, posture
// =========================================

export function computeStabilityScore(
  poseData: any,
  kinematics: any
): CategoryScore {
  const subMetrics: SubMetricScore[] = [
    computePelvisPeakTiming(kinematics),
    computeTorsoPeakTiming(kinematics),
    computeLeadArmPeakTiming(kinematics),
    computeHandPeakTiming(kinematics),
    computePeakSuccessionDelay(kinematics),
    computePeakOverlap(kinematics),
    computeSpineSideBend(poseData),
    computeSpineForwardBend(poseData),
    computeTorsoPelvisRatio(kinematics),
    computeDynamicPostureVariance(poseData),
  ];

  const avgScore = subMetrics.reduce((sum, m) => sum + m.score, 0) / subMetrics.length;

  return {
    score: Math.round(avgScore),
    subMetrics,
  };
}

// =========================================
// WHIP (DOUBLE PENDULUM) SCORING (0-100)
// Purpose: bat lag, distal whip, hand acceleration
// =========================================

export function computeWhipScore(
  poseData: any,
  kinematics: any
): CategoryScore {
  const subMetrics: SubMetricScore[] = [
    computeHandAccelAfterTorsoDecel(kinematics),
    computeLeadArmHandPeakGap(kinematics),
    computeBatLagAngle(poseData),
    computeBatLagStability(poseData),
    computeArcRadiusEfficiency(poseData),
    computeHandPathTightness(poseData),
    computeHandAccelCurve(kinematics),
    computeHandDecelTiming(kinematics),
    computeLeadArmAngularVelocity(kinematics),
    computeDistalSegmentSync(poseData, kinematics),
  ];

  const avgScore = subMetrics.reduce((sum, m) => sum + m.score, 0) / subMetrics.length;

  return {
    score: Math.round(avgScore),
    subMetrics,
  };
}

// =========================================
// OVERALL SCORE (EQUAL WEIGHT)
// =========================================

export function computeOverallScore(
  anchor: CategoryScore,
  stability: CategoryScore,
  whip: CategoryScore
): number {
  return Math.round((anchor.score + stability.score + whip.score) / 3);
}

// =========================================
// ANCHOR SUB-METRICS
// =========================================

function computeCOMForwardMove(comTrace: any): SubMetricScore {
  // Approximate from existing body_data.com_forward_movement_pct
  const score = approximateScore(comTrace?.com_forward_movement_pct, 15, 30, true);
  return {
    id: "com_forward_move",
    label: "COM Forward Move %",
    description: "Center of mass forward movement control",
    score,
    severity: getSeverity(score),
  };
}

function computeRearLegBrakeTiming(kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.rear_leg_brake_timing, 0, 50);
  return {
    id: "rear_leg_brake",
    label: "Rear Leg Brake Timing",
    description: "Rear leg acts as brake vs push",
    score,
    severity: getSeverity(score),
  };
}

function computePelvisRotationTiming(kinematics: any, comTrace: any): SubMetricScore {
  const score = approximateScore(kinematics?.pelvis_rotation_timing, 0, 100);
  return {
    id: "pelvis_rotation_timing",
    label: "Pelvis Rotation Timing vs COM",
    description: "Pelvis rotation relative to COM shift",
    score,
    severity: getSeverity(score),
  };
}

function computeBackKneeAngleVelocity(poseData: any): SubMetricScore {
  const score = approximateScore(poseData?.back_knee_velocity, 0, 100);
  return {
    id: "back_knee_velocity",
    label: "Back Knee Angle Velocity",
    description: "Rate of back knee angle change",
    score,
    severity: getSeverity(score),
  };
}

function computePelvisEarlyPushOff(kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.pelvis_push_off, 0, 100);
  return {
    id: "pelvis_push_off",
    label: "Pelvis Early Push-Off",
    description: "Early pelvis push-off pattern detection",
    score,
    severity: getSeverity(score),
  };
}

function computeStrideLengthConsistency(poseData: any): SubMetricScore {
  const score = approximateScore(poseData?.stride_consistency, 0, 100);
  return {
    id: "stride_consistency",
    label: "Stride Length Consistency",
    description: "Consistency of stride length",
    score,
    severity: getSeverity(score),
  };
}

function computeStrideFootTiming(poseData: any, kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.stride_timing, 0, 100);
  return {
    id: "stride_timing",
    label: "Stride Foot Timing",
    description: "Stride foot timing relative to pelvis",
    score,
    severity: getSeverity(score),
  };
}

function computeHipHingeStability(poseData: any): SubMetricScore {
  const score = approximateScore(poseData?.hip_hinge_stability, 0, 100);
  return {
    id: "hip_hinge_stability",
    label: "Hip Hinge Stability",
    description: "Hip hinge stability throughout swing",
    score,
    severity: getSeverity(score),
  };
}

function computeRearFootPressure(poseData: any): SubMetricScore {
  const score = approximateScore(poseData?.rear_foot_pressure, 0, 100);
  return {
    id: "rear_foot_pressure",
    label: "Rear Foot Pressure Pattern",
    description: "Rear foot pressure distribution (approximated)",
    score,
    severity: getSeverity(score),
  };
}

function computeLateralCOMRange(comTrace: any): SubMetricScore {
  const score = approximateScore(comTrace?.lateral_range, 0, 100);
  return {
    id: "lateral_com_range",
    label: "Lateral COM Range",
    description: "Lateral center of mass movement range",
    score,
    severity: getSeverity(score),
  };
}

// =========================================
// STABILITY SUB-METRICS
// =========================================

function computePelvisPeakTiming(kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.pelvis_peak_timing, 0, 100);
  return {
    id: "pelvis_peak_timing",
    label: "Pelvis Peak Velocity Timing",
    description: "Timing of peak pelvis velocity",
    score,
    severity: getSeverity(score),
  };
}

function computeTorsoPeakTiming(kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.torso_peak_timing, 0, 100);
  return {
    id: "torso_peak_timing",
    label: "Torso Peak Velocity Timing",
    description: "Timing of peak torso velocity",
    score,
    severity: getSeverity(score),
  };
}

function computeLeadArmPeakTiming(kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.arm_peak_timing, 0, 100);
  return {
    id: "arm_peak_timing",
    label: "Lead Arm Peak Velocity Timing",
    description: "Timing of peak lead arm velocity",
    score,
    severity: getSeverity(score),
  };
}

function computeHandPeakTiming(kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.hand_peak_timing, 0, 100);
  return {
    id: "hand_peak_timing",
    label: "Hand Peak Velocity Timing",
    description: "Timing of peak hand velocity",
    score,
    severity: getSeverity(score),
  };
}

function computePeakSuccessionDelay(kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.succession_delay, 0, 100);
  return {
    id: "succession_delay",
    label: "Peak Succession Delay",
    description: "Spacing between kinematic peaks",
    score,
    severity: getSeverity(score),
  };
}

function computePeakOverlap(kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.peak_overlap, 0, 100);
  return {
    id: "peak_overlap",
    label: "Peak Overlap / Energy Leakage",
    description: "Overlap between kinematic peaks",
    score,
    severity: getSeverity(score),
  };
}

function computeSpineSideBend(poseData: any): SubMetricScore {
  // Use existing spine_angle_var_deg from body_data
  const score = approximateScore(poseData?.spine_angle_var_deg, 5, 15, true);
  return {
    id: "spine_side_bend",
    label: "Spine Side Bend Control",
    description: "Control of spine lateral bend",
    score,
    severity: getSeverity(score),
  };
}

function computeSpineForwardBend(poseData: any): SubMetricScore {
  const score = approximateScore(poseData?.spine_forward_bend, 0, 100);
  return {
    id: "spine_forward_bend",
    label: "Spine Forward Bend Control",
    description: "Control of spine forward flexion",
    score,
    severity: getSeverity(score),
  };
}

function computeTorsoPelvisRatio(kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.torso_pelvis_ratio, 0, 100);
  return {
    id: "torso_pelvis_ratio",
    label: "Torso/Pelvis Rotation Ratio",
    description: "Ratio of torso to pelvis rotation",
    score,
    severity: getSeverity(score),
  };
}

function computeDynamicPostureVariance(poseData: any): SubMetricScore {
  // Use head_movement_inches from body_data as proxy
  const score = approximateScore(poseData?.head_movement_inches, 3, 8, true);
  return {
    id: "dynamic_posture",
    label: "Dynamic Posture Variance",
    description: "Posture consistency through swing phases",
    score,
    severity: getSeverity(score),
  };
}

// =========================================
// WHIP SUB-METRICS
// =========================================

function computeHandAccelAfterTorsoDecel(kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.hand_accel_after_torso, 0, 100);
  return {
    id: "hand_accel_after_torso",
    label: "Hand Accel After Torso Decel",
    description: "Hand acceleration after torso decelerates",
    score,
    severity: getSeverity(score),
  };
}

function computeLeadArmHandPeakGap(kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.arm_hand_peak_gap, 0, 100);
  return {
    id: "arm_hand_gap",
    label: "Lead Arm → Hand Peak Gap",
    description: "Timing gap between arm and hand peaks",
    score,
    severity: getSeverity(score),
  };
}

function computeBatLagAngle(poseData: any): SubMetricScore {
  const score = approximateScore(poseData?.bat_lag_angle, 0, 100);
  return {
    id: "bat_lag_angle",
    label: "Bat Lag Angle",
    description: "Bat lag angle at key positions",
    score,
    severity: getSeverity(score),
  };
}

function computeBatLagStability(poseData: any): SubMetricScore {
  const score = approximateScore(poseData?.bat_lag_stability, 0, 100);
  return {
    id: "bat_lag_stability",
    label: "Bat Lag Angle Stability",
    description: "Consistency of bat lag angle",
    score,
    severity: getSeverity(score),
  };
}

function computeArcRadiusEfficiency(poseData: any): SubMetricScore {
  const score = approximateScore(poseData?.arc_radius, 0, 100);
  return {
    id: "arc_radius",
    label: "Arc Radius Efficiency",
    description: "Efficiency of bat path arc radius",
    score,
    severity: getSeverity(score),
  };
}

function computeHandPathTightness(poseData: any): SubMetricScore {
  const score = approximateScore(poseData?.hand_path_tightness, 0, 100);
  return {
    id: "hand_path_tightness",
    label: "Hand Path Tightness",
    description: "Tightness of hand path trajectory",
    score,
    severity: getSeverity(score),
  };
}

function computeHandAccelCurve(kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.hand_accel_curve, 0, 100);
  return {
    id: "hand_accel_curve",
    label: "Hand Acceleration Curve",
    description: "Shape of hand acceleration curve",
    score,
    severity: getSeverity(score),
  };
}

function computeHandDecelTiming(kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.hand_decel_timing, 0, 100);
  return {
    id: "hand_decel_timing",
    label: "Hand Deceleration Timing",
    description: "Timing of hand deceleration",
    score,
    severity: getSeverity(score),
  };
}

function computeLeadArmAngularVelocity(kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.arm_angular_velocity, 0, 100);
  return {
    id: "arm_angular_velocity",
    label: "Lead Arm Angular Velocity",
    description: "Angular velocity of lead arm",
    score,
    severity: getSeverity(score),
  };
}

function computeDistalSegmentSync(poseData: any, kinematics: any): SubMetricScore {
  const score = approximateScore(kinematics?.distal_sync, 0, 100);
  return {
    id: "distal_sync",
    label: "Distal Segment Sync",
    description: "Synchronization of distal segments",
    score,
    severity: getSeverity(score),
  };
}

// =========================================
// HELPER FUNCTIONS
// =========================================

/**
 * Approximate score from existing data or generate baseline
 * @param value - Actual value from data (may be null/undefined)
 * @param idealLow - Lower bound of ideal range
 * @param idealHigh - Upper bound of ideal range
 * @param lowerIsBetter - If true, lower values score higher
 * @returns Score 0-100
 */
function approximateScore(
  value: number | null | undefined,
  idealLow: number,
  idealHigh: number,
  lowerIsBetter: boolean = false
): number {
  // If no data, return moderate baseline score
  if (value == null || !isFinite(value)) {
    return 65; // Neutral baseline
  }

  let score: number;

  if (lowerIsBetter) {
    // Lower values are better (e.g., COM forward move, head movement)
    if (value <= idealLow) {
      score = 100;
    } else if (value >= idealHigh) {
      score = 40;
    } else {
      // Linear interpolation between idealLow and idealHigh
      const range = idealHigh - idealLow;
      const excess = value - idealLow;
      score = 100 - (excess / range) * 60; // Maps to 100-40 range
    }
  } else {
    // Higher values are better
    if (value >= idealHigh) {
      score = 100;
    } else if (value <= idealLow) {
      score = 40;
    } else {
      // Linear interpolation
      const range = idealHigh - idealLow;
      const progress = value - idealLow;
      score = 40 + (progress / range) * 60; // Maps to 40-100 range
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

// =========================================
// MAIN COMPUTATION FUNCTION
// =========================================

export function computeSwingScore(
  bodyData: any,
  batData: any,
  ballData: any,
  videoAnalysis: any
): SwingScore {
  // Extract relevant data from existing structures
  const poseData = {
    spine_angle_var_deg: bodyData?.spine_angle_var_deg,
    head_movement_inches: bodyData?.head_movement_inches,
    // Additional fields would be populated from video_analysis pose landmarks
  };

  const comTrace = {
    com_forward_movement_pct: bodyData?.com_forward_movement_pct,
    // Additional COM data from analysis
  };

  const kinematics = {
    // Would be computed from pose landmarks over time
    // For now, using approximations
  };

  const anchor = computeAnchorScore(poseData, comTrace, kinematics);
  const stability = computeStabilityScore(poseData, kinematics);
  const whip = computeWhipScore(poseData, kinematics);
  const overall = computeOverallScore(anchor, stability, whip);

  return {
    anchor,
    stability,
    whip,
    overall,
  };
}
