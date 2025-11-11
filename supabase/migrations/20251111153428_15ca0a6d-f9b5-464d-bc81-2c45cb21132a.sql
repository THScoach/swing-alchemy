-- Create pro_swings table for reference swing library
CREATE TABLE IF NOT EXISTS pro_swings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  handedness TEXT CHECK (handedness IN ('R', 'L')) DEFAULT 'R',
  level TEXT, -- e.g. MLB, MiLB, College, HS
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE pro_swings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Org members can view pro swings in their org"
ON pro_swings FOR SELECT
USING (user_has_org_access(auth.uid(), organization_id));

CREATE POLICY "Admins and coaches can insert pro swings"
ON pro_swings FOR INSERT
WITH CHECK (
  user_has_org_role(auth.uid(), organization_id, 'admin'::org_role) 
  OR user_has_org_role(auth.uid(), organization_id, 'coach'::org_role)
);

CREATE POLICY "Admins and coaches can update pro swings"
ON pro_swings FOR UPDATE
USING (
  user_has_org_role(auth.uid(), organization_id, 'admin'::org_role) 
  OR user_has_org_role(auth.uid(), organization_id, 'coach'::org_role)
);

CREATE POLICY "Admins and coaches can delete pro swings"
ON pro_swings FOR DELETE
USING (
  user_has_org_role(auth.uid(), organization_id, 'admin'::org_role) 
  OR user_has_org_role(auth.uid(), organization_id, 'coach'::org_role)
);

-- Add updated_at trigger
CREATE TRIGGER update_pro_swings_updated_at
BEFORE UPDATE ON pro_swings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create drills table for drill recommendations
CREATE TABLE IF NOT EXISTS drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Brain', 'Body', 'Bat', 'Ball')),
  focus_metric TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE drills ENABLE ROW LEVEL SECURITY;

-- Everyone can view drills
CREATE POLICY "Everyone can view drills"
ON drills FOR SELECT
USING (true);

-- Only admins can manage drills
CREATE POLICY "Admins can manage drills"
ON drills FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed initial drills
INSERT INTO drills (title, category, focus_metric, description, difficulty, duration_minutes) VALUES
-- Brain Drills
('Pitch Recognition Drill', 'Brain', 'decision_making', 'Practice identifying pitch types from video. Focus on spin, release point, and trajectory cues to improve decision making at the plate.', 'Beginner', 15),
('Two-Strike Approach Training', 'Brain', 'impulse_control', 'Work on controlling impulses with 2 strikes. Practice fouling off tough pitches and waiting for your pitch in the zone.', 'Intermediate', 20),
('Tracking Focus Exercises', 'Brain', 'tracking_focus', 'Use small objects or colored dots to track during soft toss. Enhances visual tracking and focus on the ball throughout its path.', 'Beginner', 10),
('Processing Speed Drills', 'Brain', 'processing_speed', 'React to color-coded signals during batting practice. Improves decision speed and bat-to-ball connection time.', 'Advanced', 15),

-- Body Drills
('Hip Rotation Mechanics', 'Body', 'com_forward_movement_pct', 'Focus on proper hip rotation and forward COM movement. Use resistance bands to feel proper sequencing and power generation.', 'Intermediate', 20),
('Spine Stability Work', 'Body', 'spine_stability_score', 'Practice maintaining spine angle throughout swing. Use mirror work and video feedback to ensure consistent posture.', 'Beginner', 15),
('Head Movement Reduction', 'Body', 'head_movement_inches', 'Work on keeping head still through contact. Use balance drills and soft toss with focus on quiet head mechanics.', 'Intermediate', 15),
('Kinetic Sequence Training', 'Body', 'sequence_correct', 'Practice proper kinetic chain sequencing: ground → legs → hips → torso → arms → bat. Use weighted balls and medicine ball throws.', 'Advanced', 25),

-- Bat Drills
('Bat Speed Development', 'Bat', 'avg_bat_speed', 'Use overload/underload training with various bat weights. Focus on explosive movements and maximizing speed through the zone.', 'Intermediate', 20),
('Attack Angle Optimization', 'Bat', 'attack_angle_avg', 'Work on matching pitch plane with proper attack angle. Use tee work at different heights to groove optimal bat path.', 'Advanced', 20),
('Time in Zone Extension', 'Bat', 'time_in_zone_ms', 'Practice extending through the hitting zone. Use connection drills and inside-out swing mechanics to maximize barrel time.', 'Intermediate', 15),
('Bat Speed Consistency', 'Bat', 'bat_speed_sd', 'Focus on repeatable swing mechanics. Use rhythm drills and tempo work to build consistent bat speed swing to swing.', 'Beginner', 15),

-- Ball Drills
('Exit Velocity Training', 'Ball', 'ev90', 'Maximize exit velocity through proper sequencing and impact mechanics. Use HitTrax or pocket radar for instant feedback.', 'Advanced', 25),
('Launch Angle Work', 'Ball', 'la90', 'Practice optimal launch angles for line drives and gap power. Use visual feedback and adjust swing plane as needed.', 'Intermediate', 20),
('Barrel Rate Improvement', 'Ball', 'barrel_like_rate', 'Focus on sweet spot contact and barrel control. Work on pitch recognition and swing decisions to improve quality contact.', 'Advanced', 20),
('Hard Hit Development', 'Ball', 'hard_hit_rate', 'Train for consistent hard contact. Combine bat speed work with timing drills and quality at-bat simulations.', 'Intermediate', 20)
ON CONFLICT DO NOTHING;