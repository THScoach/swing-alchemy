-- Add raw_fps_guess for debug/tracking of auto-detected FPS
ALTER TABLE public.video_analyses
  ADD COLUMN IF NOT EXISTS raw_fps_guess integer;

COMMENT ON COLUMN public.video_analyses.raw_fps_guess IS 'Auto-detected FPS guess for debugging (may differ from final fps used)';