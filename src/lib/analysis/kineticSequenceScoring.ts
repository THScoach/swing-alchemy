// Kinematic Sequence Scoring System
// Measures how well the body passes speed from hips → torso → arm → hands

import { getSeverity, SeverityLevel } from "./types";

export interface SequencePeak {
  segment: 'pelvis' | 'torso' | 'leadArm' | 'hands';
  peakTime: number; // normalized 0-1
  peakVelocity: number;
  decelStartTime: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  coachRickSays: string;
}

export interface KineticSequenceScore {
  overall: number; // 0-100
  severity: SeverityLevel;
  peakOrder: {
    score: number;
    severity: SeverityLevel;
    inCorrectOrder: boolean;
    message: string;
  };
  peakSpacing: {
    score: number;
    severity: SeverityLevel;
    avgGap: number;
    message: string;
  };
  accelDecelPattern: {
    score: number;
    severity: SeverityLevel;
    message: string;
  };
  energyTransfer: {
    score: number;
    severity: SeverityLevel;
    overlapPercent: number;
    message: string;
  };
  peaks: SequencePeak[];
  graphData: Array<{
    time: number;
    pelvis: number;
    torso: number;
    leadArm: number;
    hands: number;
  }>;
  coachRickSummary: string;
}

// Helper to find peak in velocity array
function findPeak(velocities: number[]): { index: number; value: number } {
  let maxIdx = 0;
  let maxVal = velocities[0] || 0;
  
  for (let i = 1; i < velocities.length; i++) {
    if (velocities[i] > maxVal) {
      maxVal = velocities[i];
      maxIdx = i;
    }
  }
  
  return { index: maxIdx, value: maxVal };
}

// Helper to find deceleration start (first frame after peak where velocity drops significantly)
function findDecelStart(velocities: number[], peakIdx: number): number {
  const peakVel = velocities[peakIdx];
  const threshold = peakVel * 0.9; // 10% drop
  
  for (let i = peakIdx + 1; i < velocities.length; i++) {
    if (velocities[i] < threshold) {
      return i;
    }
  }
  
  return Math.min(peakIdx + 5, velocities.length - 1);
}

// Grade based on timing and decel quality
function gradeSegment(
  peakTime: number,
  decelTime: number,
  expectedPeakMin: number,
  expectedPeakMax: number
): 'A' | 'B' | 'C' | 'D' | 'F' {
  const decelGap = decelTime - peakTime;
  const normalizedDecelGap = decelGap * 100; // convert to frame-like scale
  
  // Check if peak is in expected range
  const inRange = peakTime >= expectedPeakMin && peakTime <= expectedPeakMax;
  
  // Check decel quality (should decel within reasonable time)
  const goodDecel = normalizedDecelGap > 3 && normalizedDecelGap < 20;
  
  if (inRange && goodDecel) return 'A';
  if (inRange || goodDecel) return 'B';
  if (Math.abs(peakTime - (expectedPeakMin + expectedPeakMax) / 2) < 0.15) return 'C';
  if (Math.abs(peakTime - (expectedPeakMin + expectedPeakMax) / 2) < 0.25) return 'D';
  return 'F';
}

export function computeKineticSequenceScore(
  kinematics: any,
  poseData: any
): KineticSequenceScore {
  // Extract velocity curves (these should exist from existing analysis)
  // Normalize to 0-1 timeline
  const numFrames = kinematics?.pelvisAngVel?.length || 100;
  
  const pelvisVel = kinematics?.pelvisAngVel || Array(numFrames).fill(0);
  const torsoVel = kinematics?.torsoAngVel || Array(numFrames).fill(0);
  const leadArmVel = kinematics?.leadArmAngVel || Array(numFrames).fill(0);
  const handsVel = kinematics?.handVel || Array(numFrames).fill(0);
  
  // Build graph data
  const graphData = pelvisVel.map((_: any, i: number) => ({
    time: i / (numFrames - 1),
    pelvis: pelvisVel[i] || 0,
    torso: torsoVel[i] || 0,
    leadArm: leadArmVel[i] || 0,
    hands: handsVel[i] || 0,
  }));
  
  // Find peaks for each segment
  const pelvisPeak = findPeak(pelvisVel);
  const torsoPeak = findPeak(torsoVel);
  const leadArmPeak = findPeak(leadArmVel);
  const handsPeak = findPeak(handsVel);
  
  // Normalize peak times (0-1)
  const pelvisTime = pelvisPeak.index / (numFrames - 1);
  const torsoTime = torsoPeak.index / (numFrames - 1);
  const leadArmTime = leadArmPeak.index / (numFrames - 1);
  const handsTime = handsPeak.index / (numFrames - 1);
  
  // Find decel starts
  const pelvisDecel = findDecelStart(pelvisVel, pelvisPeak.index) / (numFrames - 1);
  const torsoDecel = findDecelStart(torsoVel, torsoPeak.index) / (numFrames - 1);
  const leadArmDecel = findDecelStart(leadArmVel, leadArmPeak.index) / (numFrames - 1);
  const handsDecel = findDecelStart(handsVel, handsPeak.index) / (numFrames - 1);
  
  // Grade each segment
  const pelvisGrade = gradeSegment(pelvisTime, pelvisDecel, 0.30, 0.45);
  const torsoGrade = gradeSegment(torsoTime, torsoDecel, 0.40, 0.55);
  const leadArmGrade = gradeSegment(leadArmTime, leadArmDecel, 0.50, 0.65);
  const handsGrade = gradeSegment(handsTime, handsDecel, 0.65, 0.80);
  
  // SUB-METRIC 1: Peak Order
  const correctOrder = 
    pelvisTime < torsoTime && 
    torsoTime < leadArmTime && 
    leadArmTime < handsTime;
  
  let orderScore = correctOrder ? 95 : 0;
  let orderMessage = "Perfect sequence: Pelvis → Torso → Arm → Hands";
  
  if (!correctOrder) {
    // Partial credit for some correct ordering
    const partialCorrect = (pelvisTime < torsoTime ? 1 : 0) + 
                          (torsoTime < leadArmTime ? 1 : 0) + 
                          (leadArmTime < handsTime ? 1 : 0);
    orderScore = partialCorrect * 25;
    
    if (handsTime < leadArmTime) {
      orderMessage = "Hands are firing too early - they peak before your arm";
    } else if (leadArmTime < torsoTime) {
      orderMessage = "Arms are firing too early - they peak before your chest";
    } else if (torsoTime < pelvisTime) {
      orderMessage = "Upper body is firing too early - chest peaks before hips";
    } else {
      orderMessage = "Peaks are out of order - energy is leaking";
    }
  }
  
  // SUB-METRIC 2: Peak Spacing
  const gaps = [
    torsoTime - pelvisTime,
    leadArmTime - torsoTime,
    handsTime - leadArmTime,
  ];
  const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
  
  // Ideal gap: 0.08-0.15 (8-15% of swing time between peaks)
  let spacingScore = 50;
  if (avgGap >= 0.08 && avgGap <= 0.15) {
    spacingScore = 95;
  } else if (avgGap >= 0.05 && avgGap <= 0.20) {
    spacingScore = 80;
  } else if (avgGap >= 0.03 && avgGap <= 0.25) {
    spacingScore = 65;
  } else if (avgGap < 0.03) {
    spacingScore = 30; // Too bunched
  } else {
    spacingScore = 40; // Too spread out
  }
  
  const spacingMessage = avgGap < 0.05 
    ? "Peaks are too close together - everything is turning as one piece"
    : avgGap > 0.20
    ? "Peaks are too spread out - losing connection between segments"
    : "Good spacing between peaks - clean energy hand-off";
  
  // SUB-METRIC 3: Accel-Decel Pattern
  // Each segment should clearly decel before the next peaks
  let accelDecelScore = 0;
  let accelDecelCount = 0;
  
  if (pelvisDecel < torsoTime) {
    accelDecelScore += 25;
    accelDecelCount++;
  }
  if (torsoDecel < leadArmTime) {
    accelDecelScore += 25;
    accelDecelCount++;
  }
  if (leadArmDecel < handsTime) {
    accelDecelScore += 25;
    accelDecelCount++;
  }
  // Hands should decel after peak
  if (handsDecel > handsTime) {
    accelDecelScore += 25;
    accelDecelCount++;
  }
  
  const accelDecelMessage = accelDecelCount >= 3
    ? "Clean acceleration and deceleration for each segment"
    : accelDecelCount >= 2
    ? "Most segments show good braking, but some are still pushing"
    : "Segments are not braking properly - energy is leaking";
  
  // SUB-METRIC 4: Energy Transfer Overlap
  // Calculate overlap between curves (less overlap = better whip)
  let overlapSum = 0;
  let overlapCount = 0;
  
  for (let i = 0; i < numFrames; i++) {
    // Count how many segments are near their peak at the same time
    const t = i / (numFrames - 1);
    const nearPeak = [
      Math.abs(t - pelvisTime) < 0.1 && pelvisVel[i] > pelvisPeak.value * 0.8,
      Math.abs(t - torsoTime) < 0.1 && torsoVel[i] > torsoPeak.value * 0.8,
      Math.abs(t - leadArmTime) < 0.1 && leadArmVel[i] > leadArmPeak.value * 0.8,
      Math.abs(t - handsTime) < 0.1 && handsVel[i] > handsPeak.value * 0.8,
    ].filter(Boolean).length;
    
    if (nearPeak > 1) {
      overlapSum += nearPeak - 1;
      overlapCount++;
    }
  }
  
  const overlapPercent = (overlapCount / numFrames) * 100;
  
  let energyScore = 95;
  if (overlapPercent > 30) energyScore = 40;
  else if (overlapPercent > 20) energyScore = 60;
  else if (overlapPercent > 10) energyScore = 80;
  
  const energyMessage = overlapPercent > 20
    ? "Too much overlap - everything is rotating together, losing whip"
    : overlapPercent > 10
    ? "Moderate overlap - some energy transfer, but could be cleaner"
    : "Clean energy transfer - body slows down as bat speeds up";
  
  // COMPUTE OVERALL SCORE
  const overall = Math.round(
    (orderScore * 0.35 + spacingScore * 0.25 + accelDecelScore * 0.20 + energyScore * 0.20)
  );
  
  // Build peaks array
  const peaks: SequencePeak[] = [
    {
      segment: 'pelvis',
      peakTime: pelvisTime,
      peakVelocity: pelvisPeak.value,
      decelStartTime: pelvisDecel,
      grade: pelvisGrade,
      coachRickSays: pelvisGrade === 'A' || pelvisGrade === 'B'
        ? "Hips fire first and brake cleanly - great start!"
        : "Hips need to fire earlier and brake harder to transfer energy.",
    },
    {
      segment: 'torso',
      peakTime: torsoTime,
      peakVelocity: torsoPeak.value,
      decelStartTime: torsoDecel,
      grade: torsoGrade,
      coachRickSays: torsoGrade === 'A' || torsoGrade === 'B'
        ? "Chest rotates after hips and slows down on time."
        : "Chest should slow down before your hands whip through.",
    },
    {
      segment: 'leadArm',
      peakTime: leadArmTime,
      peakVelocity: leadArmPeak.value,
      decelStartTime: leadArmDecel,
      grade: leadArmGrade,
      coachRickSays: leadArmGrade === 'A' || leadArmGrade === 'B'
        ? "Lead arm accelerates cleanly after the chest."
        : "Lead arm should speed up after your chest starts to slow.",
    },
    {
      segment: 'hands',
      peakTime: handsTime,
      peakVelocity: handsPeak.value,
      decelStartTime: handsDecel,
      grade: handsGrade,
      coachRickSays: handsGrade === 'A' || handsGrade === 'B'
        ? "Hands accelerate last - perfect whip action!"
        : "Hands should be the last thing to speed up, right at contact.",
    },
  ];
  
  // Coach Rick Summary
  const coachRickSummary = overall >= 80
    ? "We want your swing to move like a whip: hips go first, then chest, then arms, then hands. Your sequence is clean - you're passing speed down the chain beautifully!"
    : overall >= 60
    ? "We want your swing to move like a whip: hips go first, then chest, then arms, then hands. You're getting there, but " + (correctOrder ? "the timing gaps need work" : "the order needs to be fixed") + "."
    : "We want your swing to move like a whip: hips go first, then chest, then arms, then hands. Right now everything is turning together, so you're losing whip. Think: hips slow down so hands speed up.";
  
  return {
    overall,
    severity: getSeverity(overall),
    peakOrder: {
      score: orderScore,
      severity: getSeverity(orderScore),
      inCorrectOrder: correctOrder,
      message: orderMessage,
    },
    peakSpacing: {
      score: spacingScore,
      severity: getSeverity(spacingScore),
      avgGap,
      message: spacingMessage,
    },
    accelDecelPattern: {
      score: accelDecelScore,
      severity: getSeverity(accelDecelScore),
      message: accelDecelMessage,
    },
    energyTransfer: {
      score: energyScore,
      severity: getSeverity(energyScore),
      overlapPercent,
      message: energyMessage,
    },
    peaks,
    graphData,
    coachRickSummary,
  };
}
