-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS public.team_invites CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.team_passes CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_email TEXT NOT NULL,
  name TEXT NOT NULL,
  player_limit INTEGER NOT NULL DEFAULT 10,
  expires_on TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create team_passes table
CREATE TABLE public.team_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  duration_days INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  amount_paid INTEGER,
  plan_label TEXT CHECK (plan_label IN ('3m', '4m', '6m'))
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  player_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_email TEXT NOT NULL,
  player_name TEXT,
  role TEXT NOT NULL DEFAULT 'player',
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'removed')),
  joined_at TIMESTAMPTZ,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, player_email)
);

-- Create team_invites table
CREATE TABLE public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  email TEXT,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'sent', 'claimed', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_teams_coach ON public.teams(coach_user_id, status);
CREATE INDEX idx_team_passes_team ON public.team_passes(team_id);
CREATE INDEX idx_team_members_team ON public.team_members(team_id, status);
CREATE INDEX idx_team_members_player ON public.team_members(player_user_id);
CREATE INDEX idx_team_invites_token ON public.team_invites(token, status);

-- Add updated_at trigger
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- RLS: Teams
CREATE POLICY "Coaches view own teams"
  ON public.teams FOR SELECT
  USING (auth.uid() = coach_user_id);

CREATE POLICY "Coaches update own teams"
  ON public.teams FOR UPDATE
  USING (auth.uid() = coach_user_id);

CREATE POLICY "System insert teams"
  ON public.teams FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins view all teams"
  ON public.teams FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- RLS: Team passes
CREATE POLICY "Coaches view passes"
  ON public.team_passes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_passes.team_id
        AND teams.coach_user_id = auth.uid()
    )
  );

CREATE POLICY "System insert passes"
  ON public.team_passes FOR INSERT
  WITH CHECK (true);

-- RLS: Team members
CREATE POLICY "Coaches view members"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_members.team_id
        AND teams.coach_user_id = auth.uid()
    )
  );

CREATE POLICY "Players view own membership"
  ON public.team_members FOR SELECT
  USING (auth.uid() = player_user_id);

CREATE POLICY "Coaches manage members"
  ON public.team_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_members.team_id
        AND teams.coach_user_id = auth.uid()
    )
  );

CREATE POLICY "System insert members"
  ON public.team_members FOR INSERT
  WITH CHECK (true);

-- RLS: Team invites
CREATE POLICY "Coaches view invites"
  ON public.team_invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_invites.team_id
        AND teams.coach_user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches manage invites"
  ON public.team_invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_invites.team_id
        AND teams.coach_user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone read invites by token"
  ON public.team_invites FOR SELECT
  USING (true);

CREATE POLICY "System insert invites"
  ON public.team_invites FOR INSERT
  WITH CHECK (true);