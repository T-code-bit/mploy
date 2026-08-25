-- Admin policies for jobs
CREATE POLICY "Admins can view all jobs" ON public.jobs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any job" ON public.jobs
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any job" ON public.jobs
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for applications
CREATE POLICY "Admins can view all applications" ON public.applications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any application" ON public.applications
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any application" ON public.applications
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for profiles
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any profile" ON public.profiles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for contact_messages
CREATE POLICY "Admins can view contact messages" ON public.contact_messages
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for newsletter_subscribers
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete subscribers" ON public.newsletter_subscribers
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policy for user_roles (so admins can manage roles)
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
