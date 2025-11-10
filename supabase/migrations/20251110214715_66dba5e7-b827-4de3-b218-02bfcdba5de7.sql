-- Create player level enum
CREATE TYPE player_level AS ENUM ('Youth (10-13)', 'HS (14-18)', 'College', 'Pro', 'Other');

-- Create context tag enum
CREATE TYPE context_tag AS ENUM ('Game', 'Practice', 'Drill');

-- Add new columns to players table
ALTER TABLE public.players
ADD COLUMN player_level player_level,
ADD COLUMN organization text,
ADD COLUMN contact text,
ADD COLUMN s2_report_url text,
ADD COLUMN has_reboot_report boolean DEFAULT false,
ADD COLUMN has_coach_rick_avatar boolean DEFAULT false;

-- Update video_analyses table to include context and source
ALTER TABLE public.video_analyses
ADD COLUMN context_tag context_tag,
ADD COLUMN pitch_type text,
ADD COLUMN pitch_velocity numeric,
ADD COLUMN source_system text;

-- Create brain_data table for S2 cognition scores
CREATE TABLE public.brain_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  analysis_id uuid REFERENCES public.video_analyses(id) ON DELETE CASCADE,
  processing_speed numeric,
  tracking_focus numeric,
  impulse_control numeric,
  decision_making numeric,
  overall_percentile numeric,
  s2_report_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create body_data table for motion/kinematic data
CREATE TABLE public.body_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  analysis_id uuid REFERENCES public.video_analyses(id) ON DELETE CASCADE,
  com_forward_movement_pct numeric,
  back_leg_lift_time numeric,
  contact_time numeric,
  spine_stability_score numeric,
  spine_angle_var_deg numeric,
  head_movement_inches numeric,
  sequence_correct boolean,
  reboot_report_url text,
  context_tag context_tag,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create bat_data table for bat speed/mechanics
CREATE TABLE public.bat_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  analysis_id uuid REFERENCES public.video_analyses(id) ON DELETE CASCADE,
  avg_bat_speed numeric,
  bat_speed_sd numeric,
  attack_angle_avg numeric,
  attack_angle_sd numeric,
  time_in_zone_ms numeric,
  blast_report_url text,
  context_tag context_tag,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create ball_data table for outcome metrics
CREATE TABLE public.ball_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  analysis_id uuid REFERENCES public.video_analyses(id) ON DELETE CASCADE,
  ev90 numeric,
  la90 numeric,
  la_sd numeric,
  barrel_like_rate numeric,
  hard_hit_rate numeric,
  exit_velocities numeric[],
  launch_angles numeric[],
  source_system text,
  context_tag context_tag,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create 4b_scores table for calculated scores
CREATE TABLE public.fourb_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  analysis_id uuid REFERENCES public.video_analyses(id) ON DELETE CASCADE,
  brain_score numeric,
  body_score numeric,
  bat_score numeric,
  ball_score numeric,
  overall_score numeric,
  brain_state text,
  body_state text,
  bat_state text,
  ball_state text,
  overall_state text,
  strongest_area text,
  focus_area text,
  session_date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create progression_history table
CREATE TABLE public.progression_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  date date NOT NULL,
  brain_score numeric,
  body_score numeric,
  bat_score numeric,
  ball_score numeric,
  overall_4b_score numeric,
  context_tag context_tag,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.brain_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bat_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ball_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fourb_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progression_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for brain_data
CREATE POLICY "Users can view brain data for their players"
  ON public.brain_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = brain_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert brain data for their players"
  ON public.brain_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = brain_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all brain data"
  ON public.brain_data FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS policies for body_data
CREATE POLICY "Users can view body data for their players"
  ON public.body_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = body_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert body data for their players"
  ON public.body_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = body_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all body data"
  ON public.body_data FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS policies for bat_data
CREATE POLICY "Users can view bat data for their players"
  ON public.bat_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = bat_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert bat data for their players"
  ON public.bat_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = bat_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all bat data"
  ON public.bat_data FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS policies for ball_data
CREATE POLICY "Users can view ball data for their players"
  ON public.ball_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = ball_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert ball data for their players"
  ON public.ball_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = ball_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all ball data"
  ON public.ball_data FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS policies for fourb_scores
CREATE POLICY "Users can view scores for their players"
  ON public.fourb_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = fourb_scores.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scores for their players"
  ON public.fourb_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = fourb_scores.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all scores"
  ON public.fourb_scores FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS policies for progression_history
CREATE POLICY "Users can view progression for their players"
  ON public.progression_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = progression_history.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert progression for their players"
  ON public.progression_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = progression_history.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all progression"
  ON public.progression_history FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_brain_data_updated_at
  BEFORE UPDATE ON public.brain_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_body_data_updated_at
  BEFORE UPDATE ON public.body_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bat_data_updated_at
  BEFORE UPDATE ON public.bat_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ball_data_updated_at
  BEFORE UPDATE ON public.ball_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fourb_scores_updated_at
  BEFORE UPDATE ON public.fourb_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();