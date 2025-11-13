-- Add 3-pillar scoring columns to video_analyses table
ALTER TABLE video_analyses 
ADD COLUMN IF NOT EXISTS anchor_score numeric,
ADD COLUMN IF NOT EXISTS stability_score numeric,
ADD COLUMN IF NOT EXISTS whip_score numeric,
ADD COLUMN IF NOT EXISTS overall_swing_score numeric,
ADD COLUMN IF NOT EXISTS anchor_submetrics jsonb,
ADD COLUMN IF NOT EXISTS stability_submetrics jsonb,
ADD COLUMN IF NOT EXISTS whip_submetrics jsonb;

-- Add comment explaining the new scoring system
COMMENT ON COLUMN video_analyses.anchor_score IS '0-100 score for Anchor category (rear leg, COM control, pelvis timing)';
COMMENT ON COLUMN video_analyses.stability_score IS '0-100 score for Stability category (kinematic sequence, trunk control)';
COMMENT ON COLUMN video_analyses.whip_score IS '0-100 score for Whip category (bat lag, distal whip, hand acceleration)';
COMMENT ON COLUMN video_analyses.overall_swing_score IS 'Overall swing score (average of anchor, stability, whip)';
COMMENT ON COLUMN video_analyses.anchor_submetrics IS 'JSONB array of sub-metric scores for Anchor';
COMMENT ON COLUMN video_analyses.stability_submetrics IS 'JSONB array of sub-metric scores for Stability';
COMMENT ON COLUMN video_analyses.whip_submetrics IS 'JSONB array of sub-metric scores for Whip';