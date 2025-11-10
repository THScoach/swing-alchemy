-- Create organizations table for multi-tenancy
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'team' CHECK (subscription_tier IN ('team', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization_members table for RBAC
CREATE TYPE public.org_role AS ENUM ('admin', 'coach', 'player', 'viewer');

CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.org_role NOT NULL DEFAULT 'player',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Add organization_id to players table
ALTER TABLE public.players
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create signed_urls table for video security
CREATE TABLE public.signed_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signed_urls ENABLE ROW LEVEL SECURITY;

-- Helper function to check org membership
CREATE OR REPLACE FUNCTION public.user_has_org_access(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
  )
$$;

-- Helper function to check org role
CREATE OR REPLACE FUNCTION public.user_has_org_role(_user_id UUID, _org_id UUID, _role org_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = _role
  )
$$;

-- RLS Policies for organizations
CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT
  USING (user_has_org_access(auth.uid(), id));

CREATE POLICY "Org admins can update their organization"
  ON public.organizations FOR UPDATE
  USING (user_has_org_role(auth.uid(), id, 'admin'));

-- RLS Policies for teams
CREATE POLICY "Users can view teams in their org"
  ON public.teams FOR SELECT
  USING (user_has_org_access(auth.uid(), organization_id));

CREATE POLICY "Org admins and coaches can manage teams"
  ON public.teams FOR ALL
  USING (
    user_has_org_role(auth.uid(), organization_id, 'admin') OR
    user_has_org_role(auth.uid(), organization_id, 'coach')
  );

-- RLS Policies for organization_members
CREATE POLICY "Users can view members in their org"
  ON public.organization_members FOR SELECT
  USING (user_has_org_access(auth.uid(), organization_id));

CREATE POLICY "Org admins can manage members"
  ON public.organization_members FOR ALL
  USING (user_has_org_role(auth.uid(), organization_id, 'admin'));

-- Update players RLS to enforce org isolation
DROP POLICY IF EXISTS "Users can view their own players" ON public.players;
DROP POLICY IF EXISTS "Users can create their own players" ON public.players;
DROP POLICY IF EXISTS "Users can update their own players" ON public.players;
DROP POLICY IF EXISTS "Users can delete their own players" ON public.players;

CREATE POLICY "Users can view players in their org"
  ON public.players FOR SELECT
  USING (
    user_has_org_access(auth.uid(), organization_id) OR
    auth.uid() = profile_id OR
    has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Coaches and admins can create players"
  ON public.players FOR INSERT
  WITH CHECK (
    user_has_org_role(auth.uid(), organization_id, 'admin') OR
    user_has_org_role(auth.uid(), organization_id, 'coach') OR
    auth.uid() = profile_id
  );

CREATE POLICY "Coaches and admins can update players"
  ON public.players FOR UPDATE
  USING (
    user_has_org_role(auth.uid(), organization_id, 'admin') OR
    user_has_org_role(auth.uid(), organization_id, 'coach') OR
    auth.uid() = profile_id
  );

CREATE POLICY "Org admins can delete players"
  ON public.players FOR DELETE
  USING (user_has_org_role(auth.uid(), organization_id, 'admin'));

-- RLS for audit_logs (read-only for org admins)
CREATE POLICY "Org admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (user_has_org_role(auth.uid(), organization_id, 'admin'));

-- RLS for signed_urls
CREATE POLICY "Users can view signed URLs in their org"
  ON public.signed_urls FOR SELECT
  USING (user_has_org_access(auth.uid(), organization_id));

-- Indexes for performance
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_players_org ON public.players(organization_id);
CREATE INDEX idx_teams_org ON public.teams(organization_id);
CREATE INDEX idx_audit_logs_org ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_signed_urls_expires ON public.signed_urls(expires_at);

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();