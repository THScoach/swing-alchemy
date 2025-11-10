-- Add missing INSERT policies for audit_logs
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Add policies for signed_urls
CREATE POLICY "System can insert signed URLs"
  ON public.signed_urls FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update signed URLs"
  ON public.signed_urls FOR UPDATE
  USING (true);

-- Add INSERT policy for organizations (for admins creating new orgs)
CREATE POLICY "Admins can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));