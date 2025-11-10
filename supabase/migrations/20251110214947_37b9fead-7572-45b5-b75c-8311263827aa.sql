-- Add UPDATE and DELETE policies for brain_data
CREATE POLICY "Users can update brain data for their players"
  ON public.brain_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = brain_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete brain data for their players"
  ON public.brain_data FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = brain_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

-- Add UPDATE and DELETE policies for body_data
CREATE POLICY "Users can update body data for their players"
  ON public.body_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = body_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete body data for their players"
  ON public.body_data FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = body_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

-- Add UPDATE and DELETE policies for bat_data
CREATE POLICY "Users can update bat data for their players"
  ON public.bat_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = bat_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete bat data for their players"
  ON public.bat_data FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = bat_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

-- Add UPDATE and DELETE policies for ball_data
CREATE POLICY "Users can update ball data for their players"
  ON public.ball_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = ball_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ball data for their players"
  ON public.ball_data FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = ball_data.player_id
      AND players.profile_id = auth.uid()
    )
  );

-- Add UPDATE and DELETE policies for fourb_scores
CREATE POLICY "Users can update scores for their players"
  ON public.fourb_scores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = fourb_scores.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scores for their players"
  ON public.fourb_scores FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = fourb_scores.player_id
      AND players.profile_id = auth.uid()
    )
  );

-- Add UPDATE and DELETE policies for progression_history
CREATE POLICY "Users can update progression for their players"
  ON public.progression_history FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = progression_history.player_id
      AND players.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete progression for their players"
  ON public.progression_history FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE players.id = progression_history.player_id
      AND players.profile_id = auth.uid()
    )
  );