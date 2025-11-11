-- Fix RLS policy to allow app-level admins to insert pro swings without organization
DROP POLICY IF EXISTS "Admins and coaches can insert pro swings" ON pro_swings;

CREATE POLICY "Admins and coaches can insert pro swings"
ON pro_swings FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin') OR
  (organization_id IS NOT NULL AND (
    user_has_org_role(auth.uid(), organization_id, 'admin') OR
    user_has_org_role(auth.uid(), organization_id, 'coach')
  ))
);

-- Also update the delete policy for consistency
DROP POLICY IF EXISTS "Admins and coaches can delete pro swings" ON pro_swings;

CREATE POLICY "Admins and coaches can delete pro swings"
ON pro_swings FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR
  (organization_id IS NOT NULL AND (
    user_has_org_role(auth.uid(), organization_id, 'admin') OR
    user_has_org_role(auth.uid(), organization_id, 'coach')
  ))
);

-- And update policy for consistency
DROP POLICY IF EXISTS "Admins and coaches can update pro swings" ON pro_swings;

CREATE POLICY "Admins and coaches can update pro swings"
ON pro_swings FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR
  (organization_id IS NOT NULL AND (
    user_has_org_role(auth.uid(), organization_id, 'admin') OR
    user_has_org_role(auth.uid(), organization_id, 'coach')
  ))
);