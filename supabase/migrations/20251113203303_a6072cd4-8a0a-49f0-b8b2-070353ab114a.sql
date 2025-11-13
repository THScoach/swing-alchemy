-- Fix search path for the update_drill_updated_at function
DROP FUNCTION IF EXISTS update_drill_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_drill_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER drill_updated_at_trigger
  BEFORE UPDATE ON drills
  FOR EACH ROW
  EXECUTE FUNCTION update_drill_updated_at();