// 4B Swing Story System Types

export type PlayerLevel = 'Youth (10-13)' | 'HS (14-18)' | 'College' | 'Pro' | 'Other';
export type ContextTag = 'Game' | 'Practice' | 'Drill';

export interface BrainData {
  id?: string;
  player_id: string;
  analysis_id?: string;
  processing_speed?: number;
  tracking_focus?: number;
  impulse_control?: number;
  decision_making?: number;
  overall_percentile?: number;
  s2_report_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BodyData {
  id?: string;
  player_id: string;
  analysis_id?: string;
  com_forward_movement_pct?: number;
  back_leg_lift_time?: number;
  contact_time?: number;
  spine_stability_score?: number;
  spine_angle_var_deg?: number;
  head_movement_inches?: number;
  sequence_correct?: boolean;
  reboot_report_url?: string;
  context_tag?: ContextTag;
  created_at?: string;
  updated_at?: string;
}

export interface BatData {
  id?: string;
  player_id: string;
  analysis_id?: string;
  avg_bat_speed?: number;
  bat_speed_sd?: number;
  attack_angle_avg?: number;
  attack_angle_sd?: number;
  time_in_zone_ms?: number;
  blast_report_url?: string;
  context_tag?: ContextTag;
  created_at?: string;
  updated_at?: string;
}

export interface BallData {
  id?: string;
  player_id: string;
  analysis_id?: string;
  ev90?: number;
  la90?: number;
  la_sd?: number;
  barrel_like_rate?: number;
  hard_hit_rate?: number;
  exit_velocities?: number[];
  launch_angles?: number[];
  source_system?: string;
  context_tag?: ContextTag;
  created_at?: string;
  updated_at?: string;
}

export interface FourBScores {
  id?: string;
  player_id: string;
  analysis_id?: string;
  brain_score?: number;
  body_score?: number;
  bat_score?: number;
  ball_score?: number;
  overall_score?: number;
  brain_state?: string;
  body_state?: string;
  bat_state?: string;
  ball_state?: string;
  overall_state?: string;
  strongest_area?: string;
  focus_area?: string;
  session_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProgressionHistory {
  id?: string;
  player_id: string;
  date: string;
  brain_score?: number;
  body_score?: number;
  bat_score?: number;
  ball_score?: number;
  overall_4b_score?: number;
  context_tag?: ContextTag;
  notes?: string;
  created_at?: string;
}

export type TileState = 'synced' | 'developing' | 'limiting' | 'no-data';
export type TileName = 'brain' | 'body' | 'bat' | 'ball';

export interface TileData {
  name: TileName;
  title: string;
  score?: number;
  state: TileState;
  description: string;
  color: string;
}
