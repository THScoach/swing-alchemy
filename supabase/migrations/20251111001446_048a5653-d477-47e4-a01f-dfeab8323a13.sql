-- Create player equipment profile table
CREATE TABLE public.player_equipment_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  swing_sensors TEXT[] DEFAULT '{}',
  ball_trackers TEXT[] DEFAULT '{}',
  motion_tools TEXT[] DEFAULT '{}',
  training_facility TEXT,
  setup_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.player_equipment_profile ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view equipment for their players"
ON public.player_equipment_profile FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = player_equipment_profile.player_id
    AND players.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can insert equipment for their players"
ON public.player_equipment_profile FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = player_equipment_profile.player_id
    AND players.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can update equipment for their players"
ON public.player_equipment_profile FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = player_equipment_profile.player_id
    AND players.profile_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all equipment"
ON public.player_equipment_profile FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create sessions/bookings table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  location TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_id TEXT,
  add_ons JSONB DEFAULT '{}',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view sessions for their players"
ON public.sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = sessions.player_id
    AND players.profile_id = auth.uid()
  )
);

CREATE POLICY "Users can create sessions for their players"
ON public.sessions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.players
    WHERE players.id = sessions.player_id
    AND players.profile_id = auth.uid()
  )
);

CREATE POLICY "Coaches and admins can view all sessions in their org"
ON public.sessions FOR SELECT
USING (
  user_has_org_role(auth.uid(), organization_id, 'admin'::org_role) 
  OR user_has_org_role(auth.uid(), organization_id, 'coach'::org_role)
);

CREATE POLICY "Coaches and admins can update sessions in their org"
ON public.sessions FOR UPDATE
USING (
  user_has_org_role(auth.uid(), organization_id, 'admin'::org_role) 
  OR user_has_org_role(auth.uid(), organization_id, 'coach'::org_role)
);

CREATE POLICY "Admins can view all sessions"
ON public.sessions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_player_equipment_profile_updated_at
BEFORE UPDATE ON public.player_equipment_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();