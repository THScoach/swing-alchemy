-- Add extended COM fields to body_data table for Reboot-style metrics
ALTER TABLE public.body_data 
  ADD COLUMN IF NOT EXISTS com_negative_move_pct numeric,
  ADD COLUMN IF NOT EXISTS com_foot_down_pct numeric,
  ADD COLUMN IF NOT EXISTS com_max_forward_pct numeric;

COMMENT ON COLUMN public.body_data.com_negative_move_pct IS 'COM position % at negative move (load phase)';
COMMENT ON COLUMN public.body_data.com_foot_down_pct IS 'COM position % at front foot plant';
COMMENT ON COLUMN public.body_data.com_max_forward_pct IS 'COM position % at maximum forward movement';