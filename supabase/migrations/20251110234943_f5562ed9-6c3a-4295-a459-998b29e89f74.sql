-- Weekly Check-Ins Table
CREATE TABLE public.weekly_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  responses JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(player_id, week_start)
);

ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view check-ins for their players"
ON public.weekly_checkins FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = weekly_checkins.player_id
    AND players.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can insert check-ins for their players"
ON public.weekly_checkins FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = weekly_checkins.player_id
    AND players.profile_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all check-ins"
ON public.weekly_checkins FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Player Points Tables
CREATE TABLE public.player_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Bronze',
  streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.player_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view points for their players"
ON public.player_points FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = player_points.player_id
    AND players.profile_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all points"
ON public.player_points FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage points"
ON public.player_points FOR ALL
USING (true)
WITH CHECK (true);

CREATE TABLE public.points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  points INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_points_history_player ON public.points_history(player_id, created_at DESC);

ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view points history for their players"
ON public.points_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = points_history.player_id
    AND players.profile_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all points history"
ON public.points_history FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert points history"
ON public.points_history FOR INSERT
WITH CHECK (true);

-- Events Table for Calendar
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  event_type TEXT NOT NULL DEFAULT 'meeting',
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  zoom_link TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events in their org"
ON public.events FOR SELECT
USING (user_has_org_access(auth.uid(), organization_id));

CREATE POLICY "Org admins and coaches can manage events"
ON public.events FOR ALL
USING (
  user_has_org_role(auth.uid(), organization_id, 'admin'::org_role) OR
  user_has_org_role(auth.uid(), organization_id, 'coach'::org_role)
);

-- Triggers for updated_at
CREATE TRIGGER update_weekly_checkins_updated_at
BEFORE UPDATE ON public.weekly_checkins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_points_updated_at
BEFORE UPDATE ON public.player_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();