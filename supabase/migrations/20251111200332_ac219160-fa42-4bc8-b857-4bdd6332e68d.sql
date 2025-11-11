-- Add proper model profile fields to pro_swings
-- Separating fps (numeric value) from fps_confirmed (boolean)
ALTER TABLE pro_swings
  ADD COLUMN IF NOT EXISTS player_name text,
  ADD COLUMN IF NOT EXISTS team text,
  ADD COLUMN IF NOT EXISTS height_inches int,
  ADD COLUMN IF NOT EXISTS weight_lbs int,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS handedness text DEFAULT 'R',
  ADD COLUMN IF NOT EXISTS is_model boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS fps int,
  ADD COLUMN IF NOT EXISTS fps_confirmed boolean DEFAULT false;

-- Backfill player_name from label where missing
UPDATE pro_swings
SET player_name = split_part(label, ' - ', 1)
WHERE player_name IS NULL AND label IS NOT NULL;

COMMENT ON COLUMN pro_swings.fps IS 'Numeric frame rate value (e.g., 240, 300, 120)';
COMMENT ON COLUMN pro_swings.fps_confirmed IS 'Boolean flag indicating FPS was manually confirmed by coach';