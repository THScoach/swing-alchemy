-- Add mode and FPS confirmation columns to video_analyses
DO $$ BEGIN
  CREATE TYPE analysis_mode AS ENUM ('player', 'model');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE video_analyses 
ADD COLUMN IF NOT EXISTS mode analysis_mode DEFAULT 'player',
ADD COLUMN IF NOT EXISTS fps_confirmed integer,
ADD COLUMN IF NOT EXISTS is_pro_model boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pro_swing_id uuid REFERENCES pro_swings(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS metrics_reboot jsonb;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_video_analyses_mode ON video_analyses(mode);
CREATE INDEX IF NOT EXISTS idx_video_analyses_pro_swing ON video_analyses(pro_swing_id);

-- Update pro_swings to track if analysis has been run
ALTER TABLE pro_swings
ADD COLUMN IF NOT EXISTS has_analysis boolean DEFAULT false;