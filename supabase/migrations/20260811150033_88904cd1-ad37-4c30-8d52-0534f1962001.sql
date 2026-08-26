CREATE POLICY "Admins can delete subscription records" ON public.paystack_subscribers FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update subscription records" ON public.paystack_subscribers FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paystack_subscribers TO authenticated;
GRANT ALL ON public.paystack_subscribers TO service_role;