-- Add missing columns to pro_swings for model analysis
ALTER TABLE pro_swings
ADD COLUMN IF NOT EXISTS fps_confirmed integer,
ADD COLUMN IF NOT EXISTS metrics_reboot jsonb,
ADD COLUMN IF NOT EXISTS weirdness_flags jsonb;

-- Add weirdness_flags to video_analyses if not exists
ALTER TABLE video_analyses
ADD COLUMN IF NOT EXISTS weirdness_flags jsonb;