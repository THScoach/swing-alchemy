-- Fix video_analyses INSERT policy to allow coaches/admins to upload for their org players
DROP POLICY IF EXISTS "Users can create analyses for their players" ON video_analyses;

CREATE POLICY "Users can create analyses for their players" 
ON video_analyses 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM players
    WHERE players.id = video_analyses.player_id
    AND (
      -- Owner of the player
      players.profile_id = auth.uid()
      OR
      -- Coach/Admin in the same organization
      (
        players.organization_id IS NOT NULL
        AND (
          user_has_org_role(auth.uid(), players.organization_id, 'admin'::org_role)
          OR user_has_org_role(auth.uid(), players.organization_id, 'coach'::org_role)
        )
      )
      OR
      -- Global admin
      has_role(auth.uid(), 'admin'::app_role)
    )
  )
);