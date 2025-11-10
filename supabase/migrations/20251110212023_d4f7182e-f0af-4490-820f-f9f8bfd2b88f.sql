-- Add admin policy for viewing all video analyses
CREATE POLICY "Admins can view all analyses"
ON public.video_analyses
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Add admin policy for viewing all players
CREATE POLICY "Admins can view all players"
ON public.players
FOR SELECT
USING (has_role(auth.uid(), 'admin'));