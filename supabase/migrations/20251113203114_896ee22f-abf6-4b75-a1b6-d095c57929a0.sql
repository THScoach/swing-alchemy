-- Add archived flag and video storage fields to drills table
ALTER TABLE drills 
ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create storage bucket for drill videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('drill-videos', 'drill-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for drill videos
CREATE POLICY "Anyone can view drill videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'drill-videos');

CREATE POLICY "Coaches and admins can upload drill videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'drill-videos' AND
    (has_role(auth.uid(), 'admin') OR 
     EXISTS (
       SELECT 1 FROM organization_members
       WHERE user_id = auth.uid() AND role = 'coach'
     ))
  );

CREATE POLICY "Coaches and admins can update drill videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'drill-videos' AND
    (has_role(auth.uid(), 'admin') OR 
     EXISTS (
       SELECT 1 FROM organization_members
       WHERE user_id = auth.uid() AND role = 'coach'
     ))
  );

CREATE POLICY "Coaches and admins can delete drill videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'drill-videos' AND
    (has_role(auth.uid(), 'admin') OR 
     EXISTS (
       SELECT 1 FROM organization_members
       WHERE user_id = auth.uid() AND role = 'coach'
     ))
  );

-- Update RLS policies for drills table to include coach role
DROP POLICY IF EXISTS "Admins can manage drills" ON drills;

CREATE POLICY "Admins and coaches can manage drills"
  ON drills FOR ALL
  USING (
    has_role(auth.uid(), 'admin') OR 
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE user_id = auth.uid() AND role = 'coach'
    )
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE user_id = auth.uid() AND role = 'coach'
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_drill_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER drill_updated_at_trigger
  BEFORE UPDATE ON drills
  FOR EACH ROW
  EXECUTE FUNCTION update_drill_updated_at();

-- Add index for archived drills
CREATE INDEX IF NOT EXISTS idx_drills_archived ON drills(archived) WHERE archived = false;