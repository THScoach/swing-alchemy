-- Drop existing SELECT policy for pro_swings
DROP POLICY IF EXISTS "Org members can view pro swings in their org" ON pro_swings;

-- Create new SELECT policies that handle both org-specific and global pro swings
CREATE POLICY "Admins can view all pro swings"
ON pro_swings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Org members can view their org and global pro swings"
ON pro_swings
FOR SELECT
USING (
  organization_id IS NULL 
  OR user_has_org_access(auth.uid(), organization_id)
);