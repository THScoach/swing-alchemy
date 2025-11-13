-- Extend drills table with new fields for prescription system
ALTER TABLE drills 
ADD COLUMN IF NOT EXISTS priority_level text CHECK (priority_level IN ('very_high', 'high', 'moderate', 'low')),
ADD COLUMN IF NOT EXISTS targets jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS coaching_cues jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS progression text,
ADD COLUMN IF NOT EXISTS checklist_items_trained jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS prescription_triggers jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS contraindications jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS simple_explanation text,
ADD COLUMN IF NOT EXISTS coach_rick_says text;

-- Create drill_recommendations table
CREATE TABLE IF NOT EXISTS drill_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  swing_id uuid REFERENCES video_analyses(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  recommended_drills jsonb NOT NULL DEFAULT '[]'::jsonb,
  severity_context jsonb,
  prescription_notes text
);

-- Enable RLS
ALTER TABLE drill_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drill_recommendations
CREATE POLICY "Users can view drill recommendations for their players"
  ON drill_recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = drill_recommendations.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all drill recommendations"
  ON drill_recommendations FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert drill recommendations"
  ON drill_recommendations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update drill recommendations"
  ON drill_recommendations FOR UPDATE
  USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_drill_recommendations_player 
  ON drill_recommendations(player_id);
CREATE INDEX IF NOT EXISTS idx_drill_recommendations_swing 
  ON drill_recommendations(swing_id);
CREATE INDEX IF NOT EXISTS idx_drills_category 
  ON drills(category);
CREATE INDEX IF NOT EXISTS idx_drills_priority 
  ON drills(priority_level);