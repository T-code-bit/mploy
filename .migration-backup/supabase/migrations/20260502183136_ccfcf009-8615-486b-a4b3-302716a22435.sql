-- Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  role TEXT,
  location TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  text TEXT NOT NULL,
  highlight TEXT,
  photo_url TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can view their own reviews"
  ON public.reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reviews"
  ON public.reviews FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can submit a review"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update any review"
  ON public.reviews FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any review"
  ON public.reviews FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Paystack subscribers
CREATE TABLE public.paystack_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  customer_code TEXT,
  subscription_code TEXT,
  email_token TEXT,
  plan_code TEXT,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.paystack_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON public.paystack_subscribers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.paystack_subscribers FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage subscriptions"
  ON public.paystack_subscribers FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_paystack_subscribers_updated_at
  BEFORE UPDATE ON public.paystack_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();