// 4B System Configuration - Level-based targets and baselines

import { PlayerLevel } from './types';

// Bat Speed Targets by Level (mph)
export const batSpeedTargets: Record<PlayerLevel, number> = {
  'Youth (10-13)': 55,
  'HS (14-18)': 68,
  'College': 73,
  'Pro': 78,
  'Other': 65,
};

// Exit Velocity (EV90) Targets by Level (mph)
export const ev90Targets: Record<PlayerLevel, number> = {
  'Youth (10-13)': 70,
  'HS (14-18)': 87,
  'College': 97,
  'Pro': 102,
  'Other': 85,
};

// Reboot Motion Baselines
export const rebootBaselines = {
  com_forward_movement: {
    excellent: 20, // ≤ 20%
    acceptable: 40, // 20-40%
    // > 40% is problematic
  },
  spine_angle_variance: {
    excellent: 5, // ≤ 5°
    acceptable: 10, // 6-10°
    // > 10° is problematic
  },
  head_movement: {
    excellent: 3, // ≤ 3 inches
    acceptable: 6, // 4-6 inches
    // > 6 inches is problematic
  },
  spine_stability: {
    excellent: 85, // ≥ 85
    acceptable: 70, // 70-84
    // < 70 is problematic
  },
};

// Launch Angle Standards
export const launchAngleStandards = {
  barrel_min: 10,
  barrel_max: 30,
  ideal_min: 8,
  ideal_max: 20,
  sd_excellent: 8, // ≤ 8° SD
};

// Bat Mechanics Standards
export const batMechanicsStandards = {
  attack_angle_min: 8,
  attack_angle_max: 20,
  attack_angle_sd_max: 5,
  bat_speed_sd_excellent: 3,
  bat_speed_sd_acceptable: 5,
};

// S2 Cognition Thresholds
export const s2Thresholds = {
  synced: 70, // ≥ 70th percentile
  growing: 40, // 40-69th percentile
  // < 40 is limiting
};

// Score State Mappings
export const scoreStates = {
  brain: {
    synced: 70,
    growing: 40,
  },
  body: {
    anchored: 85,
    drifting: 65,
  },
  bat: {
    onPlane: 80,
    inconsistent: 60,
  },
  ball: {
    matched: 80,
    underused: 60,
  },
  overall: {
    synced: 80,
    developing: 60,
  },
};
