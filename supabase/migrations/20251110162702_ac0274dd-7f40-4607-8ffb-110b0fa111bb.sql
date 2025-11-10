-- Create storage bucket for swing videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('swing-videos', 'swing-videos', true);

-- RLS policies for swing-videos bucket
CREATE POLICY "Users can view videos for their players"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'swing-videos' AND
  EXISTS (
    SELECT 1 FROM public.video_analyses va
    JOIN public.players p ON p.id = va.player_id
    WHERE va.video_url LIKE '%' || storage.objects.name || '%'
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload videos for their players"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'swing-videos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their video files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'swing-videos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete videos for their players"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'swing-videos' AND
  EXISTS (
    SELECT 1 FROM public.video_analyses va
    JOIN public.players p ON p.id = va.player_id
    WHERE va.video_url LIKE '%' || storage.objects.name || '%'
    AND p.user_id = auth.uid()
  )
);