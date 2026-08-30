-- Return the CV export payment total without exposing purchase records to the
-- dashboard. Only payments confirmed by Paystack and still eligible for, or
-- already used for, an export are revenue.
CREATE OR REPLACE FUNCTION public.admin_cv_export_revenue()
RETURNS TABLE (
  total_amount bigint,
  purchase_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Admin access required'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(SUM(p.amount), 0)::bigint,
    COUNT(*)::bigint
  FROM public.cv_export_purchases AS p
  WHERE p.status IN ('verified', 'exported')
    AND p.currency = 'KES';
END;
$$;

REVOKE ALL ON FUNCTION public.admin_cv_export_revenue() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_cv_export_revenue() TO authenticated;