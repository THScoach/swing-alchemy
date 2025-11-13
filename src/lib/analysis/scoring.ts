// 3-Pillar Scoring Computation Engine
// Computes Anchor, Stability, and Whip scores from pose data

import { SubMetricScore, CategoryScore, SwingScore, getSeverity } from "./types";
import { mlbStandards, mapToScore } from "./mlbStandards";

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
    computeRearLegBrakeTiming(kinematics, poseData),
    computePelvisRotationTiming(kinematics, comTrace),
    computeBackKneeAngleVelocity(poseData, kinematics),
    computePelvisEarlyPushOff(kinematics),
    computeStrideLengthConsistency(poseData),
    computeStrideFootTiming(poseData, kinematics),
    computeHipHingeStability(poseData),
    computeRearFootPressure(poseData, kinematics),
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
    computeBatLagAngle(poseData, kinematics),
    computeBatLagStability(poseData, kinematics),
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
  const value = comTrace?.com_forward_movement_pct;
  const std = mlbStandards.anchor.comForwardMovement;
  const score = mapToScore(value, std.elite, std.good, std.acceptable);
  
  return {
    id: "com_forward_move",
    label: "COM Forward Move %",
    description: "Measures how much the center of mass drifts forward during the swing. Elite hitters keep COM back initially, then move forward under control.",
    simpleDescription: "This tells us if you're staying back or lunging forward too early. Good hitters load back first, then explode forward at the right time.",
    coachRickTip: "Feel like you're 'sitting into' your back leg as the pitcher releases. Your weight should move forward smoothly, not lunge or dive.",
    score,
    severity: getSeverity(score),
  };
}

function computeRearLegBrakeTiming(kinematics: any, poseData: any): SubMetricScore {
  // Extract rear knee angular velocity at foot plant
  const rearKneeVel = kinematics?.rear_knee_velocity || poseData?.rear_knee_angular_velocity;
  const std = mlbStandards.anchor.rearLegBrake;
  const score = mapToScore(rearKneeVel, std.elite, std.good, std.acceptable);
  
  return {
    id: "rear_leg_brake",
    label: "Rear Leg Brake Force",
    description: "Evaluates whether the rear leg acts as a brake (eccentric load) versus a push. Elite hitters brake into the rear leg to create ground force, not push off it.",
    simpleDescription: "We want your back leg to 'catch' your weight and brake, not push you forward. This helps you stay balanced and create power from the ground up.",
    coachRickTip: "Think 'sit and spin' not 'push and chase.' Your back knee should feel like it's resisting, not driving you toward the pitcher.",
    score,
    severity: getSeverity(score),
  };
}

function computePelvisRotationTiming(kinematics: any, comTrace: any): SubMetricScore {
  // Frames between foot plant and pelvis rotation start
  const delay = kinematics?.pelvis_rotation_delay || 5;
  const std = mlbStandards.anchor.pelvisRotationDelay;
  const score = mapToScore(delay, std.elite, std.good, std.acceptable);
  
  return {
    id: "pelvis_rotation_timing",
    label: "Pelvis Rotation Delay",
    description: "Timing of pelvis rotation relative to foot plant and COM positioning. Proper delay ensures energy is loaded before rotation begins.",
    simpleDescription: "This checks if your hips wait for the right moment to fire. Good hitters plant their foot, then explode their hips—not at the same time.",
    coachRickTip: "Feel a tiny pause between your front foot landing and your hips starting to turn. That 'load-then-explode' creates huge power.",
    score,
    severity: getSeverity(score),
  };
}

function computeBackKneeAngleVelocity(poseData: any, kinematics: any): SubMetricScore {
  // Rate of back knee extension
  const kneeVel = poseData?.back_knee_extension_rate || kinematics?.back_knee_velocity || 0;
  const score = kneeVel > -50 ? 85 : 70; // Simplified: negative = braking is good
  
  return {
    id: "back_knee_velocity",
    label: "Back Knee Extension Rate",
    description: "Rate of change of the back knee angle during rotation. Controlled extension maintains rear leg as an anchor point.",
    simpleDescription: "This shows how fast your back knee straightens. A smooth, controlled straightening keeps you balanced and powerful.",
    coachRickTip: "Don't lock your back leg early. Let it extend smoothly as you rotate—like a spring uncoiling, not a piston firing.",
    score,
    severity: getSeverity(score),
  };
}

function computePelvisEarlyPushOff(kinematics: any): SubMetricScore {
  // Detect early extension pattern
  const earlyPush = kinematics?.early_extension_score || 50;
  const score = 100 - earlyPush; // Lower early extension = higher score
  
  return {
    id: "pelvis_push_off",
    label: "Early Push-Off Pattern",
    description: "Detects premature pelvis extension and push-off, which disrupts sequencing and causes loss of posture.",
    simpleDescription: "This catches if you're standing up too early in your swing. Good hitters stay in their legs through contact, not pop up.",
    coachRickTip: "Feel like you're swinging 'through' your legs, not jumping out of them. Keep your chest down longer—'stay on the ball.'",
    score,
    severity: getSeverity(score),
  };
}

function computeStrideLengthConsistency(poseData: any): SubMetricScore {
  // Stride as % of height
  const strideLength = poseData?.stride_length_pct || 75;
  const std = mlbStandards.anchor.strideLength;
  const score = mapToScore(strideLength, std.elite, std.good, std.acceptable);
  
  return {
    id: "stride_consistency",
    label: "Stride Length Consistency",
    description: "Measures stride length relative to height and its consistency. Elite hitters use a repeatable stride that matches their body proportions.",
    simpleDescription: "This checks if your step is the right size for your body and if you do it the same way every time. A consistent stride = consistent timing.",
    coachRickTip: "Find a stride length that feels comfortable and stick with it. Too long = loss of balance; too short = less power. Practice makes it automatic.",
    score,
    severity: getSeverity(score),
  };
}

function computeStrideFootTiming(poseData: any, kinematics: any): SubMetricScore {
  // Timing of foot plant relative to pitch
  const timing = kinematics?.stride_timing_score || 70;
  const score = timing;
  
  return {
    id: "stride_timing",
    label: "Stride Foot Plant Timing",
    description: "Timing of the front foot landing relative to pitch release and ball flight. Proper timing allows for adjustment and rhythm.",
    simpleDescription: "This shows if your front foot lands at the right time—not too early (can't adjust) or too late (rushing).",
    coachRickTip: "Your front foot should land before the ball gets halfway to you. This gives you time to see it and make small adjustments.",
    score,
    severity: getSeverity(score),
  };
}

function computeHipHingeStability(poseData: any): SubMetricScore {
  // Hip hinge angle stability
  const stability = poseData?.hip_hinge_variance || 10;
  const score = stability < 15 ? 85 : 65;
  
  return {
    id: "hip_hinge_stability",
    label: "Hip Hinge Stability",
    description: "Stability of the hip hinge angle throughout the swing. Maintaining hinge preserves posture and allows for rotational power.",
    simpleDescription: "This checks if you keep your hips bent (athletic position) through the swing. Standing up early kills your power and balance.",
    coachRickTip: "Imagine sitting on a tall stool through contact. Your belt buckle should stay angled down, not pointing at the pitcher.",
    score,
    severity: getSeverity(score),
  };
}

function computeRearFootPressure(poseData: any, kinematics: any): SubMetricScore {
  // Rear foot pressure pattern (approximated from pose)
  const pressure = poseData?.rear_foot_pressure_score || kinematics?.rear_leg_force || 70;
  const score = pressure;
  
  return {
    id: "rear_foot_pressure",
    label: "Rear Foot Pressure Pattern",
    description: "Rear foot pressure distribution during the swing. Elite hitters maintain pressure into the back foot initially, then transfer smoothly.",
    simpleDescription: "This shows how you use your back foot to push into the ground. Good hitters feel strong pressure there before transferring forward.",
    coachRickTip: "Feel like you're 'squashing a bug' with your back foot as you start to rotate. This creates the ground force that powers your swing.",
    score,
    severity: getSeverity(score),
  };
}

function computeLateralCOMRange(comTrace: any): SubMetricScore {
  // Lateral sway of COM
  const sway = comTrace?.lateral_sway || comTrace?.lateral_range || 0;
  const score = sway < 4 ? 90 : sway < 8 ? 75 : 60;
  
  return {
    id: "lateral_com_range",
    label: "Lateral COM Drift",
    description: "Lateral (side-to-side) movement of center of mass. Excessive sway disrupts balance and timing. Elite hitters minimize lateral drift.",
    simpleDescription: "This checks if you're swaying side-to-side or staying balanced. Too much sway = poor balance and weak contact.",
    coachRickTip: "Feel stable over your legs—move forward and rotate, but don't rock side to side. Practice soft toss while standing on one leg to build balance.",
    score,
    severity: getSeverity(score),
  };
}

// =========================================
// STABILITY SUB-METRICS
// =========================================

function computePelvisPeakTiming(kinematics: any): SubMetricScore {
  // Normalized frame of pelvis peak velocity
  const timing = kinematics?.pelvis_peak_frame || 40;
  const std = mlbStandards.stability.pelvisPeakVelocity;
  const score = mapToScore(timing, std.elite, std.good, std.acceptable);
  
  return {
    id: "pelvis_peak_timing",
    label: "Pelvis Peak Velocity Timing",
    description: "Frame at which pelvis reaches maximum rotational velocity. Should occur early in the sequence, before torso and arms.",
    simpleDescription: "This tells us if your hips start the swing. Good hitters fire their hips first—chest, arms, and bat follow in order.",
    coachRickTip: "Think 'hips lead, hands follow.' Your lower body should feel like it's pulling your upper body around, not the other way.",
    score,
    severity: getSeverity(score),
  };
}

function computeTorsoPeakTiming(kinematics: any): SubMetricScore {
  const timing = kinematics?.torso_peak_frame || 50;
  const std = mlbStandards.stability.torsoPeakVelocity;
  const score = mapToScore(timing, std.elite, std.good, std.acceptable);
  
  return {
    id: "torso_peak_timing",
    label: "Torso Peak Velocity Timing",
    description: "Frame at which torso reaches maximum rotational velocity. Should peak after pelvis but before arms, maintaining proper sequence.",
    simpleDescription: "This checks if your chest fires after your hips. The sequence should be: hips → chest → arms → bat.",
    coachRickTip: "Feel your chest 'chasing' your hips. By the time your chest is fully rotated, your hips should already be slowing down.",
    score,
    severity: getSeverity(score),
  };
}

function computeLeadArmPeakTiming(kinematics: any): SubMetricScore {
  const timing = kinematics?.lead_arm_peak_frame || 60;
  const std = mlbStandards.stability.leadArmPeakVelocity;
  const score = mapToScore(timing, std.elite, std.good, std.acceptable);
  
  return {
    id: "lead_arm_peak_timing",
    label: "Lead Arm Peak Velocity Timing",
    description: "Frame at which lead arm reaches maximum velocity. Should peak after torso, continuing the kinematic chain to the bat.",
    simpleDescription: "This shows if your lead arm speeds up after your chest. Each body part should 'hand off' energy to the next one.",
    coachRickTip: "Your front elbow should feel like it's being 'pulled' by your rotating chest. Don't push with your arms—let rotation do the work.",
    score,
    severity: getSeverity(score),
  };
}

function computeHandPeakTiming(kinematics: any): SubMetricScore {
  const timing = kinematics?.hand_peak_frame || 75;
  const std = mlbStandards.stability.handPeakVelocity;
  const score = mapToScore(timing, std.elite, std.good, std.acceptable);
  
  return {
    id: "hand_peak_timing",
    label: "Hand Peak Velocity Timing",
    description: "Frame at which hands reach maximum velocity. Should be last in the sequence, closest to contact, for maximum bat speed.",
    simpleDescription: "This checks if your hands are the last thing to speed up. When everything works right, your hands whip through last and fastest.",
    coachRickTip: "Feel like your hands are 'thrown' by your body rotation. They should speed up right before you hit the ball, not early in the swing.",
    score,
    severity: getSeverity(score),
  };
}

function computePeakSuccessionDelay(kinematics: any): SubMetricScore {
  // Average gap between peaks
  const gaps = [
    (kinematics?.torso_peak_frame || 50) - (kinematics?.pelvis_peak_frame || 40),
    (kinematics?.lead_arm_peak_frame || 60) - (kinematics?.torso_peak_frame || 50),
    (kinematics?.hand_peak_frame || 75) - (kinematics?.lead_arm_peak_frame || 60),
  ];
  const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
  const std = mlbStandards.stability.peakSuccessionGap;
  const score = mapToScore(avgGap, std.elite, std.good, std.acceptable);
  
  return {
    id: "peak_succession_delay",
    label: "Peak Succession Timing",
    description: "Average delay between kinematic peaks. Consistent spacing indicates smooth energy transfer through the body.",
    simpleDescription: "This tells us if each body part fires in a nice rhythm: hips → chest → arms → bat, with even spacing between them.",
    coachRickTip: "Think of your swing like dominoes falling in order—not all at once, but one smooth chain reaction from the ground up.",
    score,
    severity: getSeverity(score),
  };
}

function computePeakOverlap(kinematics: any): SubMetricScore {
  // Check if any peaks occur simultaneously (bad)
  const pelvisPeak = kinematics?.pelvis_peak_frame || 40;
  const torsoPeak = kinematics?.torso_peak_frame || 50;
  const armPeak = kinematics?.lead_arm_peak_frame || 60;
  
  const overlap1 = Math.abs(torsoPeak - pelvisPeak) < 5;
  const overlap2 = Math.abs(armPeak - torsoPeak) < 5;
  
  const score = (overlap1 || overlap2) ? 60 : 90;
  
  return {
    id: "peak_overlap",
    label: "Peak Overlap Detection",
    description: "Detects if kinematic peaks occur simultaneously rather than in sequence. Overlapping peaks indicate disconnection or 'spinning out.'",
    simpleDescription: "This catches if multiple body parts speed up at the same time. Good swings have each part speeding up one after another, not all together.",
    coachRickTip: "If everything fires at once, you're 'spinning' or 'casting.' Practice step-back drills to feel each part fire separately: hips, chest, arms.",
    score,
    severity: getSeverity(score),
  };
}

function computeSpineSideBend(poseData: any): SubMetricScore {
  // Lateral spine tilt at contact
  const sideBend = poseData?.spine_side_bend || 10;
  const std = mlbStandards.stability.spineSideBend;
  const score = mapToScore(sideBend, std.elite, std.good, std.acceptable);
  
  return {
    id: "spine_side_bend",
    label: "Spine Side Bend Angle",
    description: "Lateral tilt of the spine at contact. Proper side bend maintains posture while allowing for full rotation and extension.",
    simpleDescription: "This checks if you're tilting sideways at contact. A little tilt is good—it helps you stay over the ball and drive it down.",
    coachRickTip: "Feel like your back shoulder goes down slightly as you swing. This keeps your barrel above the ball and creates backspin for carry.",
    score,
    severity: getSeverity(score),
  };
}

function computeSpineForwardBend(poseData: any): SubMetricScore {
  // Forward bend variance
  const bendVariance = poseData?.spine_angle_var_deg || 8;
  const std = mlbStandards.stability.spineForwardBend;
  const score = mapToScore(bendVariance, std.elite, std.good, std.acceptable);
  
  return {
    id: "spine_forward_bend",
    label: "Spine Forward Bend Stability",
    description: "Variation in forward spine angle throughout swing. Consistent angle maintains posture and balance. Too much variation = loss of position.",
    simpleDescription: "This shows if you keep your posture (chest angle) consistent through the swing. Standing up or diving forward disrupts everything.",
    coachRickTip: "Keep your nose over your belly button through contact. Don't raise up or lunge forward—stay in your athletic position.",
    score,
    severity: getSeverity(score),
  };
}

function computeTorsoPelvisRatio(kinematics: any): SubMetricScore {
  // Ratio of peak velocities
  const torsoPeak = kinematics?.torso_peak_velocity || 400;
  const pelvisPeak = kinematics?.pelvis_peak_velocity || 300;
  const ratio = pelvisPeak > 0 ? torsoPeak / pelvisPeak : 1.5;
  const std = mlbStandards.stability.torsoPelvisRatio;
  const score = mapToScore(ratio, std.elite, std.good, std.acceptable);
  
  return {
    id: "torso_pelvis_ratio",
    label: "Torso-Pelvis Velocity Ratio",
    description: "Ratio of peak torso to pelvis velocity. Proper ratio indicates effective energy transfer—torso should amplify pelvis speed.",
    simpleDescription: "This checks if your chest speeds up more than your hips. When the sequence works, your chest should spin faster than your hips did.",
    coachRickTip: "Your hips start the motion, but your chest should feel like it's 'ripping' through faster. That's energy building up the chain.",
    score,
    severity: getSeverity(score),
  };
}

function computeDynamicPostureVariance(poseData: any): SubMetricScore {
  // Overall posture stability score
  const variance = poseData?.posture_variance || poseData?.spine_angle_var_deg || 8;
  const score = variance < 5 ? 95 : variance < 10 ? 80 : variance < 15 ? 65 : 50;
  
  return {
    id: "dynamic_posture_variance",
    label: "Dynamic Posture Variance",
    description: "Overall postural stability throughout the swing. Consistent posture from load through contact indicates strong core control and balance.",
    simpleDescription: "This measures if you stay in a good athletic position through the whole swing—not standing up, leaning, or tilting differently.",
    coachRickTip: "Film yourself from the side and watch your head. If it moves up and down or forward a lot, work on 'staying in your legs' through contact.",
    score,
    severity: getSeverity(score),
  };
}

// =========================================
// WHIP SUB-METRICS
// =========================================

function computeHandAccelAfterTorsoDecel(kinematics: any): SubMetricScore {
  // Frame difference: hand accel peak vs torso decel start
  const torsoDecelFrame = kinematics?.torso_decel_frame || 55;
  const handAccelFrame = kinematics?.hand_accel_peak_frame || 60;
  const gap = handAccelFrame - torsoDecelFrame;
  const std = mlbStandards.whip.handAccelAfterTorsoDecel;
  const score = mapToScore(gap, std.elite, std.good, std.acceptable);
  
  return {
    id: "hand_accel_after_torso_decel",
    label: "Hand Accel After Torso Decel",
    description: "Measures whether hands accelerate after the torso starts to decelerate, indicating efficient energy transfer from body to bat.",
    simpleDescription: "We want your body to slow down so your hands and bat can speed up. This tells us if your swing is 'whipping' or just turning together.",
    coachRickTip: "Feel your chest start to slow as the barrel whips through. If everything is turning as one piece, practice step-back or hover drills to create more whip.",
    score,
    severity: getSeverity(score),
  };
}

function computeLeadArmHandPeakGap(kinematics: any): SubMetricScore {
  // Frames between lead arm and hand peaks
  const armPeak = kinematics?.lead_arm_peak_frame || 60;
  const handPeak = kinematics?.hand_peak_frame || 75;
  const gap = handPeak - armPeak;
  const std = mlbStandards.whip.armHandPeakGap;
  const score = mapToScore(gap, std.elite, std.good, std.acceptable);
  
  return {
    id: "lead_arm_hand_peak_gap",
    label: "Lead Arm to Hand Peak Gap",
    description: "Time delay between lead arm and hand peak velocities. Proper lag creates a whip effect, multiplying bat speed at contact.",
    simpleDescription: "This checks if your hands lag behind your arm, then catch up fast. That 'lag and snap' is where bat speed comes from.",
    coachRickTip: "Your hands should feel like they're 'waiting' until the last moment, then explode through. Practice 'hold the bat back' drills to feel the lag.",
    score,
    severity: getSeverity(score),
  };
}

function computeBatLagAngle(poseData: any, kinematics: any): SubMetricScore {
  // Bat lag angle at torso peak
  const lagAngle = poseData?.bat_lag_angle || kinematics?.bat_lag_at_torso_peak || 40;
  const std = mlbStandards.whip.batLagAngle;
  const score = mapToScore(lagAngle, std.elite, std.good, std.acceptable);
  
  return {
    id: "bat_lag_angle",
    label: "Bat Lag Angle",
    description: "Angle between the bat and lead forearm at peak torso rotation. Larger lag angles indicate better energy storage for release at contact.",
    simpleDescription: "This shows if the bat is 'lagging behind' your hands as your body turns. More lag = more stored energy = more bat speed later.",
    coachRickTip: "Feel the barrel staying back behind your hands as you start to rotate. Then 'snap' it through at the last moment—like cracking a whip.",
    score,
    severity: getSeverity(score),
  };
}

function computeBatLagStability(poseData: any, kinematics: any): SubMetricScore {
  // Standard deviation of lag angle
  const lagSD = poseData?.bat_lag_sd || kinematics?.bat_lag_stability || 10;
  const std = mlbStandards.whip.batLagStability;
  const score = mapToScore(lagSD, std.elite, std.good, std.acceptable);
  
  return {
    id: "bat_lag_stability",
    label: "Bat Lag Consistency",
    description: "Consistency of bat lag angle throughout the swing. Stable lag indicates controlled energy storage and release.",
    simpleDescription: "This checks if your bat lag is the same every swing. Consistent lag = consistent timing and bat speed.",
    coachRickTip: "Work on repeating your swing path every time. Dry swings with a mirror help you see and feel the same barrel position each rep.",
    score,
    severity: getSeverity(score),
  };
}

function computeArcRadiusEfficiency(poseData: any): SubMetricScore {
  // Hand path circularity
  const efficiency = poseData?.hand_path_efficiency || 75;
  const std = mlbStandards.whip.arcRadiusEfficiency;
  const score = mapToScore(efficiency, std.elite, std.good, std.acceptable);
  
  return {
    id: "arc_radius_efficiency",
    label: "Hand Path Arc Efficiency",
    description: "Circularity and tightness of the hand path. Efficient arcs maximize linear speed at contact while minimizing wasted motion.",
    simpleDescription: "This measures if your hands take a smooth, circular path. A tight circle = faster hands and more consistent contact.",
    coachRickTip: "Imagine your hands tracing a perfect circle behind you and through the zone. No loops or dips—just one smooth, fast circle.",
    score,
    severity: getSeverity(score),
  };
}

function computeHandPathTightness(poseData: any): SubMetricScore {
  // SD of hand path radius
  const tightness = poseData?.hand_path_sd || 3;
  const std = mlbStandards.whip.handPathTightness;
  const score = mapToScore(tightness, std.elite, std.good, std.acceptable);
  
  return {
    id: "hand_path_tightness",
    label: "Hand Path Tightness",
    description: "Variability in hand path radius. Tighter paths with less variance create more consistent barrel control and contact quality.",
    simpleDescription: "This shows if your hands follow the same path every time. Less variation = better barrel control and more hard contact.",
    coachRickTip: "Use tee work to groove your swing. Place a cone or obstacle where your hands shouldn't go—practice avoiding it to build a tight, repeatable path.",
    score,
    severity: getSeverity(score),
  };
}

function computeHandAccelCurve(kinematics: any): SubMetricScore {
  // Peak hand acceleration magnitude
  const peakAccel = kinematics?.hand_peak_acceleration || 50;
  const std = mlbStandards.whip.peakHandAcceleration;
  const score = mapToScore(peakAccel, std.elite, std.good, std.acceptable);
  
  return {
    id: "hand_accel_curve",
    label: "Hand Acceleration Curve",
    description: "Shape and magnitude of hand acceleration profile. Elite hitters show explosive hand acceleration peaking just before contact.",
    simpleDescription: "This measures how fast your hands speed up right before contact. The faster they accelerate at the end, the more bat speed you create.",
    coachRickTip: "Feel like your hands 'explode' through the zone at the last second. Start smooth and controlled, then fire them through as fast as possible.",
    score,
    severity: getSeverity(score),
  };
}

function computeHandDecelTiming(kinematics: any): SubMetricScore {
  // When hands start to decelerate (should be after contact)
  const decelFrame = kinematics?.hand_decel_frame || 80;
  const contactFrame = kinematics?.contact_frame || 75;
  const score = decelFrame >= contactFrame ? 90 : 65;
  
  return {
    id: "hand_decel_timing",
    label: "Hand Deceleration Timing",
    description: "Frame at which hands begin decelerating. Should occur at or after contact. Early decel indicates 'slowing down' before contact.",
    simpleDescription: "This checks if your hands slow down before you hit the ball. Good hitters accelerate through contact, not into it and then stop.",
    coachRickTip: "Swing 'through' the ball, not 'to' the ball. Imagine trying to hit two balls—one in front of the other—to keep accelerating.",
    score,
    severity: getSeverity(score),
  };
}

function computeLeadArmAngularVelocity(kinematics: any): SubMetricScore {
  // Lead arm rotation speed
  const armVel = kinematics?.lead_arm_angular_velocity || 800;
  const score = armVel > 700 ? 90 : armVel > 500 ? 75 : 60;
  
  return {
    id: "lead_arm_angular_velocity",
    label: "Lead Arm Angular Velocity",
    description: "Rotational speed of the lead arm during the swing. Higher velocities indicate better energy transfer from torso to hands.",
    simpleDescription: "This measures how fast your front arm spins around. A fast front arm pulls your hands and bat through faster.",
    coachRickTip: "Your front arm should feel like it's 'ripping' across your chest. Practice 'throwing your hands' drills to build that quick arm action.",
    score,
    severity: getSeverity(score),
  };
}

function computeDistalSegmentSync(poseData: any, kinematics: any): SubMetricScore {
  // Coordination between hand and bat movement
  const sync = kinematics?.hand_bat_sync || poseData?.distal_sync_score || 75;
  const score = sync;
  
  return {
    id: "distal_segment_sync",
    label: "Hand-Bat Synchronization",
    description: "Coordination between hand acceleration and bat speed. Optimal sync indicates efficient energy transfer from hands to bat.",
    simpleDescription: "This shows if your hands and bat are working together smoothly. When they sync up right, all your energy goes into bat speed.",
    coachRickTip: "Feel like the bat is an extension of your arms—not fighting it, not muscling it, just letting it whip through naturally as your hands fire.",
    score,
    severity: getSeverity(score),
  };
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
  // Extract data structures
  const poseData = videoAnalysis?.pose_data || {};
  const kinematics = videoAnalysis?.kinematics || {};
  const comTrace = {
    com_forward_movement_pct: bodyData?.com_forward_movement_pct,
    lateral_sway: bodyData?.lateral_sway,
    lateral_range: bodyData?.lateral_range,
  };

  // Compute scores
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
