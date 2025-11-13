interface FourBScores {
  brain_score?: number | null;
  body_score?: number | null;
  bat_score?: number | null;
  ball_score?: number | null;
  overall_score?: number | null;
}

interface Drill {
  id: string;
  title: string;
  category: string;
  focus_metric: string;
  description: string;
  difficulty?: string;
  duration_minutes?: number;
}

interface BrainData {
  decision_making?: number | null;
  impulse_control?: number | null;
  tracking_focus?: number | null;
  processing_speed?: number | null;
}

interface BodyData {
  com_forward_movement_pct?: number | null;
  spine_stability_score?: number | null;
  head_movement_inches?: number | null;
  sequence_correct?: boolean | null;
}

interface BatData {
  avg_bat_speed?: number | null;
  attack_angle_avg?: number | null;
  time_in_zone_ms?: number | null;
  bat_speed_sd?: number | null;
}

interface BallData {
  ev90?: number | null;
  la90?: number | null;
  barrel_like_rate?: number | null;
  hard_hit_rate?: number | null;
}

import type { SwingScore } from "./analysis/types";
import { selectDrills, type Drill as PrescriptionDrill } from "./drillPrescription";

export function getRecommendedDrills(
  fourbScores: FourBScores,
  allDrills: Drill[],
  brainData?: BrainData,
  bodyData?: BodyData,
  batData?: BatData,
  ballData?: BallData,
  swingScore?: SwingScore
): Drill[] {
  // If we have the new swing score system, use the intelligent algorithm
  if (swingScore && allDrills.length > 0) {
    const recommendations = selectDrills(swingScore, allDrills as PrescriptionDrill[]);
    return recommendations.map(rec => rec.drill as Drill);
  }
  
  // Fallback to legacy algorithm
  const recommendations: Drill[] = [];
  const scores = {
    Brain: fourbScores.brain_score ?? 0,
    Body: fourbScores.body_score ?? 0,
    Bat: fourbScores.bat_score ?? 0,
    Ball: fourbScores.ball_score ?? 0,
  };

  // Find the two lowest scoring areas
  const sortedAreas = Object.entries(scores)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2);

  // For each weak area, find specific metrics and recommend drills
  sortedAreas.forEach(([category, score]) => {
    if (score < 70) { // Focus on areas below 70
      let focusMetrics: string[] = [];

      // Identify specific weak metrics per category
      if (category === 'Brain' && brainData) {
        const brainMetrics = [
          { metric: 'decision_making', value: brainData.decision_making ?? 100 },
          { metric: 'impulse_control', value: brainData.impulse_control ?? 100 },
          { metric: 'tracking_focus', value: brainData.tracking_focus ?? 100 },
          { metric: 'processing_speed', value: brainData.processing_speed ?? 100 },
        ];
        focusMetrics = brainMetrics
          .filter(m => m.value < 70)
          .sort((a, b) => a.value - b.value)
          .slice(0, 2)
          .map(m => m.metric);
      } else if (category === 'Body' && bodyData) {
        const bodyMetrics = [
          { metric: 'com_forward_movement_pct', value: bodyData.com_forward_movement_pct ?? 100 },
          { metric: 'spine_stability_score', value: bodyData.spine_stability_score ?? 100 },
          { metric: 'head_movement_inches', value: 100 - (bodyData.head_movement_inches ?? 0) * 10 }, // Lower is better, invert
          { metric: 'sequence_correct', value: bodyData.sequence_correct ? 100 : 50 },
        ];
        focusMetrics = bodyMetrics
          .filter(m => m.value < 70)
          .sort((a, b) => a.value - b.value)
          .slice(0, 2)
          .map(m => m.metric);
      } else if (category === 'Bat' && batData) {
        const batMetrics = [
          { metric: 'avg_bat_speed', value: batData.avg_bat_speed ? Math.min((batData.avg_bat_speed / 80) * 100, 100) : 50 },
          { metric: 'attack_angle_avg', value: 70 }, // Placeholder scoring
          { metric: 'time_in_zone_ms', value: batData.time_in_zone_ms ? Math.min((batData.time_in_zone_ms / 200) * 100, 100) : 50 },
          { metric: 'bat_speed_sd', value: batData.bat_speed_sd ? Math.max(100 - batData.bat_speed_sd * 10, 0) : 50 }, // Lower SD is better
        ];
        focusMetrics = batMetrics
          .filter(m => m.value < 70)
          .sort((a, b) => a.value - b.value)
          .slice(0, 2)
          .map(m => m.metric);
      } else if (category === 'Ball' && ballData) {
        const ballMetrics = [
          { metric: 'ev90', value: ballData.ev90 ? Math.min((ballData.ev90 / 100) * 100, 100) : 50 },
          { metric: 'la90', value: 70 }, // Placeholder scoring
          { metric: 'barrel_like_rate', value: ballData.barrel_like_rate ?? 50 },
          { metric: 'hard_hit_rate', value: ballData.hard_hit_rate ?? 50 },
        ];
        focusMetrics = ballMetrics
          .filter(m => m.value < 70)
          .sort((a, b) => a.value - b.value)
          .slice(0, 2)
          .map(m => m.metric);
      }

      // Find drills matching category and focus metrics
      const categoryDrills = allDrills.filter(drill => 
        drill.category === category &&
        (focusMetrics.length === 0 || focusMetrics.includes(drill.focus_metric))
      );

      // Add up to 2 drills per weak category
      recommendations.push(...categoryDrills.slice(0, 2));
    }
  });

  // If we have fewer than 3 recommendations, add general drills for the weakest category
  if (recommendations.length < 3 && sortedAreas.length > 0) {
    const weakestCategory = sortedAreas[0][0];
    const additionalDrills = allDrills
      .filter(drill => 
        drill.category === weakestCategory && 
        !recommendations.some(r => r.id === drill.id)
      )
      .slice(0, 3 - recommendations.length);
    
    recommendations.push(...additionalDrills);
  }

  // Return top 5 unique recommendations
  return recommendations.slice(0, 5);
}

export function getTopOngoingDrills(
  recentAnalyses: Array<{ fourbScores: FourBScores }>,
  allDrills: Drill[]
): Drill[] {
  if (recentAnalyses.length === 0) return [];

  // Aggregate weak areas across recent analyses
  const areaCounts = { Brain: 0, Body: 0, Bat: 0, Ball: 0 };
  
  recentAnalyses.forEach(analysis => {
    const scores = analysis.fourbScores;
    if ((scores.brain_score ?? 100) < 70) areaCounts.Brain++;
    if ((scores.body_score ?? 100) < 70) areaCounts.Body++;
    if ((scores.bat_score ?? 100) < 70) areaCounts.Bat++;
    if ((scores.ball_score ?? 100) < 70) areaCounts.Ball++;
  });

  // Sort by frequency of weakness
  const topAreas = Object.entries(areaCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([area]) => area);

  // Get one drill per top area
  const topDrills: Drill[] = [];
  topAreas.forEach(area => {
    const drill = allDrills.find(d => d.category === area);
    if (drill) topDrills.push(drill);
  });

  return topDrills;
}
