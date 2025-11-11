-- Add analysis_id to pro_swings for linking model swings to video analyses
ALTER TABLE pro_swings
ADD COLUMN IF NOT EXISTS analysis_id uuid REFERENCES video_analyses(id);

COMMENT ON COLUMN pro_swings.analysis_id IS 'Linked model video_analyses row for this pro swing (used for comparison/ghost)';

-- Create pro-swings storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('pro-swings', 'pro-swings', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for pro-swings bucket
CREATE POLICY "Admins and coaches can upload pro swings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pro-swings' AND
  (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Pro swing videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'pro-swings');

CREATE POLICY "Admins can delete pro swing videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pro-swings' AND
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);