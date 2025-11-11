-- Add rich metadata fields to pro_swings for model profiles
ALTER TABLE pro_swings
ADD COLUMN IF NOT EXISTS player_name text,
ADD COLUMN IF NOT EXISTS team text,
ADD COLUMN IF NOT EXISTS height_inches integer,
ADD COLUMN IF NOT EXISTS weight_lbs integer,
ADD COLUMN IF NOT EXISTS is_model boolean DEFAULT true;

-- Backfill player_name from label where possible
UPDATE pro_swings
SET player_name = split_part(label, ' - ', 1)
WHERE player_name IS NULL AND label IS NOT NULL;