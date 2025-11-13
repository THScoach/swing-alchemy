import { SwingScore, SubMetricScore } from "./analysis/types";

export type DrillPriority = 'very_high' | 'high' | 'moderate' | 'low';
export type DrillCategory = 'anchor' | 'stability' | 'whip' | 'multi';

export interface Drill {
  id: string;
  title: string;
  category: DrillCategory;
  priority_level: DrillPriority;
  targets: string[]; // Checklist item numbers (e.g., ["1.1", "1.2"])
  description: string;
  coaching_cues: string[];
  progression: string;
  video_url?: string;
  simple_explanation?: string;
  coach_rick_says?: string;
  checklist_items_trained: string[];
  prescription_triggers: string[];
  contraindications: string[];
  difficulty?: string;
  duration_minutes?: number;
  focus_metric?: string;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DrillRecommendation {
  drill: Drill;
  reason: string;
  priority: number;
  targetedMetrics: SubMetricScore[];
}

export interface PrescriptionContext {
  criticalMetrics: SubMetricScore[];
  moderateMetrics: SubMetricScore[];
  adequateMetrics: SubMetricScore[];
  weakestPillar: 'anchor' | 'stability' | 'whip';
}

/**
 * Determines severity level based on score
 * 1-40: CRITICAL (scores 1-2 in 1-5 scale)
 * 41-59: MODERATE (score 3)
 * 60+: ADEQUATE (scores 4-5)
 */
export function categorizeSeverity(swingScore: SwingScore): PrescriptionContext {
  const allMetrics = [
    ...swingScore.anchor.subMetrics,
    ...swingScore.stability.subMetrics,
    ...swingScore.whip.subMetrics
  ];

  const criticalMetrics = allMetrics.filter(m => m.score < 40);
  const moderateMetrics = allMetrics.filter(m => m.score >= 40 && m.score < 60);
  const adequateMetrics = allMetrics.filter(m => m.score >= 60);

  // Determine weakest pillar
  const pillarScores = {
    anchor: swingScore.anchor.score,
    stability: swingScore.stability.score,
    whip: swingScore.whip.score
  };

  const weakestPillar = Object.entries(pillarScores)
    .sort(([, a], [, b]) => a - b)[0][0] as 'anchor' | 'stability' | 'whip';

  return {
    criticalMetrics,
    moderateMetrics,
    adequateMetrics,
    weakestPillar
  };
}

/**
 * Maps sub-metric IDs to checklist item numbers
 * This connects the biomechanical scoring (1.1-3.5) to drill targets
 */
export function mapMetricToChecklistItem(metricId: string): string {
  const mapping: Record<string, string> = {
    // Anchor metrics (1.x)
    'rear_leg_brake_force': '1.1',
    'com_stays_back': '1.2',
    'negative_move_control': '1.3',
    'rear_hip_back_pocket': '1.4',
    'head_stable_vertical': '1.5',
    'foot_down_position': '1.6',
    'pelvis_sway_minimal': '1.7',
    'back_leg_angle_braced': '1.8',
    'front_leg_stable': '1.9',
    'anchor_consistency': '1.10',
    
    // Stability metrics (2.x)
    'pelvis_peak_timing': '2.1',
    'torso_peak_timing': '2.2',
    'lead_arm_peak_timing': '2.3',
    'hands_peak_timing': '2.4',
    'peak_succession_delay': '2.5',
    'torso_rotational_control': '2.6',
    'trunk_tilt_consistency': '2.7',
    'shoulder_plane_match': '2.8',
    'lead_arm_path_efficiency': '2.9',
    'stability_overall': '2.10',
    
    // Whip metrics (3.x)
    'hand_accel_after_torso_decel': '3.1',
    'bat_lag_angle_maintenance': '3.2',
    'arc_radius_efficiency': '3.3',
    'distal_segment_whip': '3.4',
    'whip_overall': '3.5'
  };

  return mapping[metricId] || metricId;
}

/**
 * Intelligent drill selection algorithm
 * Priority: CRITICAL first, kinetic-chain order, max 3-5 drills
 */
export function selectDrills(
  swingScore: SwingScore,
  allDrills: Drill[]
): DrillRecommendation[] {
  const context = categorizeSeverity(swingScore);
  const recommendations: DrillRecommendation[] = [];

  // Step 1: Address CRITICAL metrics first
  if (context.criticalMetrics.length > 0) {
    const criticalDrills = context.criticalMetrics
      .slice(0, 3) // Top 3 critical issues
      .map(metric => {
        const checklistItem = mapMetricToChecklistItem(metric.id);
        
        // Find drills that target this specific metric
        const matchingDrills = allDrills.filter(drill => 
          drill.targets.includes(checklistItem) &&
          (drill.priority_level === 'very_high' || drill.priority_level === 'high')
        );

        if (matchingDrills.length > 0) {
          // Pick the highest priority drill
          const drill = matchingDrills.sort((a, b) => {
            const priorityOrder = { very_high: 0, high: 1, moderate: 2, low: 3 };
            return priorityOrder[a.priority_level] - priorityOrder[b.priority_level];
          })[0];

          return {
            drill,
            reason: `Critical: ${metric.label} scoring ${metric.score}/100`,
            priority: 10,
            targetedMetrics: [metric]
          };
        }
        return null;
      })
      .filter(Boolean) as DrillRecommendation[];

    recommendations.push(...criticalDrills);
  }

  // Step 2: If no critical or need more drills, address MODERATE metrics
  if (recommendations.length < 3 && context.moderateMetrics.length > 0) {
    const moderateDrills = context.moderateMetrics
      .slice(0, 2)
      .map(metric => {
        const checklistItem = mapMetricToChecklistItem(metric.id);
        const matchingDrills = allDrills.filter(drill =>
          drill.targets.includes(checklistItem) &&
          !recommendations.some(r => r.drill.id === drill.id)
        );

        if (matchingDrills.length > 0) {
          return {
            drill: matchingDrills[0],
            reason: `Needs work: ${metric.label} at ${metric.score}/100`,
            priority: 5,
            targetedMetrics: [metric]
          };
        }
        return null;
      })
      .filter(Boolean) as DrillRecommendation[];

    recommendations.push(...moderateDrills);
  }

  // Step 3: Add one integration drill if multiple pillars are weak
  if (recommendations.length < 5) {
    const pillarScores = [
      { name: 'anchor', score: swingScore.anchor.score },
      { name: 'stability', score: swingScore.stability.score },
      { name: 'whip', score: swingScore.whip.score }
    ];

    const weakPillars = pillarScores.filter(p => p.score < 60);
    
    if (weakPillars.length >= 2) {
      const multiDrills = allDrills.filter(drill =>
        drill.category === 'multi' &&
        !recommendations.some(r => r.drill.id === drill.id)
      );

      if (multiDrills.length > 0) {
        recommendations.push({
          drill: multiDrills[0],
          reason: 'Integration drill for multiple weak areas',
          priority: 7,
          targetedMetrics: []
        });
      }
    }
  }

  // Sort by priority and return max 5 drills
  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);
}

/**
 * Get drills specific to a pillar (for breakdown modals)
 */
export function getDrillsForPillar(
  pillarName: 'anchor' | 'stability' | 'whip',
  subMetrics: SubMetricScore[],
  allDrills: Drill[]
): DrillRecommendation[] {
  const weakMetrics = subMetrics.filter(m => m.score < 60);
  
  if (weakMetrics.length === 0) {
    return [];
  }

  const drillRecs = weakMetrics
    .slice(0, 3) // Top 3 weak metrics in this pillar
    .map(metric => {
      const checklistItem = mapMetricToChecklistItem(metric.id);
      const matchingDrills = allDrills.filter(drill =>
        drill.category === pillarName &&
        drill.targets.includes(checklistItem)
      );

      if (matchingDrills.length > 0) {
        return {
          drill: matchingDrills[0],
          reason: `Targets ${metric.label}`,
          priority: metric.score < 40 ? 10 : 5,
          targetedMetrics: [metric]
        };
      }
      return null;
    })
    .filter(Boolean) as DrillRecommendation[];

  return drillRecs;
}

/**
 * Generate Coach Rick explanation for drill recommendations
 */
export function generateDrillExplanation(
  recommendations: DrillRecommendation[],
  context: PrescriptionContext
): string {
  if (recommendations.length === 0) {
    return "You're looking solid across the board! Keep working on consistency and we'll fine-tune from there.";
  }

  let explanation = `Based on your swing, here's what we're focusing on:\n\n`;

  if (context.criticalMetrics.length > 0) {
    explanation += `**Priority Areas** (need immediate work):\n`;
    context.criticalMetrics.slice(0, 3).forEach(metric => {
      explanation += `- ${metric.label}: ${metric.simpleDescription}\n`;
    });
    explanation += `\n`;
  }

  explanation += `**Drill Plan**:\n`;
  recommendations.forEach((rec, i) => {
    explanation += `${i + 1}. **${rec.drill.title}**\n`;
    explanation += `   ${rec.reason}\n`;
    if (rec.drill.coach_rick_says) {
      explanation += `   💡 ${rec.drill.coach_rick_says}\n`;
    }
    explanation += `\n`;
  });

  explanation += `\nWork these drills in order, focusing on quality over quantity. `;
  explanation += `Once you feel comfortable with the first drill, add the next one. `;
  explanation += `Check your progress after 2-3 weeks and we'll adjust from there.`;

  return explanation;
}
