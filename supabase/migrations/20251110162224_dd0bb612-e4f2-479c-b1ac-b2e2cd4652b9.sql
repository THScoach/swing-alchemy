-- Create players table
CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  sport text NOT NULL DEFAULT 'Baseball',
  position text,
  bats text CHECK (bats IN ('Right', 'Left', 'Switch')),
  throws text CHECK (throws IN ('Right', 'Left')),
  date_of_birth date,
  height integer, -- height in inches
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create video_analyses table
CREATE TABLE public.video_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  video_url text NOT NULL,
  thumbnail_url text,
  skeleton_data jsonb,
  swing_phases jsonb, -- {load, launch, contact, extension} with frame numbers
  kinetic_sequence jsonb, -- timing data for pelvis, torso, arms, bat
  brain_scores jsonb, -- {reaction_time, pitch_recognition, decision_making}
  body_scores jsonb, -- {tempo_ratio, hip_shoulder_separation, weight_transfer, balance}
  bat_scores jsonb, -- {bat_speed, attack_angle, time_to_contact, path_efficiency}
  ball_scores jsonb, -- {exit_velocity, launch_angle, distance, contact_quality}
  session_notes text,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create pocket_radar_readings table
CREATE TABLE public.pocket_radar_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  video_analysis_id uuid REFERENCES public.video_analyses(id) ON DELETE SET NULL,
  exit_velocity numeric(5,2) NOT NULL,
  reading_date timestamptz DEFAULT now() NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create courses table
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  level text CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  duration_minutes integer,
  module_count integer DEFAULT 0,
  thumbnail_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create course_modules table
CREATE TABLE public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  module_number integer NOT NULL,
  title text NOT NULL,
  video_url text,
  content text,
  duration_minutes integer,
  key_points text[], -- array of key points
  action_items text[], -- array of action items
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(course_id, module_number)
);

-- Create course_progress table
CREATE TABLE public.course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  module_id uuid REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(player_id, module_id)
);

-- Enable Row Level Security
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pocket_radar_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for players
CREATE POLICY "Users can view their own players"
  ON public.players FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own players"
  ON public.players FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own players"
  ON public.players FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own players"
  ON public.players FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for video_analyses
CREATE POLICY "Users can view analyses for their players"
  ON public.video_analyses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.players 
    WHERE players.id = video_analyses.player_id 
    AND players.user_id = auth.uid()
  ));

CREATE POLICY "Users can create analyses for their players"
  ON public.video_analyses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.players 
    WHERE players.id = video_analyses.player_id 
    AND players.user_id = auth.uid()
  ));

CREATE POLICY "Users can update analyses for their players"
  ON public.video_analyses FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.players 
    WHERE players.id = video_analyses.player_id 
    AND players.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete analyses for their players"
  ON public.video_analyses FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.players 
    WHERE players.id = video_analyses.player_id 
    AND players.user_id = auth.uid()
  ));

-- RLS Policies for pocket_radar_readings
CREATE POLICY "Users can view readings for their players"
  ON public.pocket_radar_readings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.players 
    WHERE players.id = pocket_radar_readings.player_id 
    AND players.user_id = auth.uid()
  ));

CREATE POLICY "Users can create readings for their players"
  ON public.pocket_radar_readings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.players 
    WHERE players.id = pocket_radar_readings.player_id 
    AND players.user_id = auth.uid()
  ));

CREATE POLICY "Users can update readings for their players"
  ON public.pocket_radar_readings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.players 
    WHERE players.id = pocket_radar_readings.player_id 
    AND players.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete readings for their players"
  ON public.pocket_radar_readings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.players 
    WHERE players.id = pocket_radar_readings.player_id 
    AND players.user_id = auth.uid()
  ));

-- RLS Policies for courses (publicly readable)
CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for course_modules (publicly readable)
CREATE POLICY "Anyone can view course modules"
  ON public.course_modules FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for course_progress
CREATE POLICY "Users can view their own progress"
  ON public.course_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.players 
    WHERE players.id = course_progress.player_id 
    AND players.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own progress"
  ON public.course_progress FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.players 
    WHERE players.id = course_progress.player_id 
    AND players.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own progress"
  ON public.course_progress FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.players 
    WHERE players.id = course_progress.player_id 
    AND players.user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_players_user_id ON public.players(user_id);
CREATE INDEX idx_video_analyses_player_id ON public.video_analyses(player_id);
CREATE INDEX idx_pocket_radar_readings_player_id ON public.pocket_radar_readings(player_id);
CREATE INDEX idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX idx_course_progress_player_id ON public.course_progress(player_id);
CREATE INDEX idx_course_progress_course_id ON public.course_progress(course_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_analyses_updated_at
  BEFORE UPDATE ON public.video_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_progress_updated_at
  BEFORE UPDATE ON public.course_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();