-- ONE/OFF Supabase Schema
-- Run this in your Supabase SQL editor

-- ─── Users (extends Supabase auth.users) ──────────────────────
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- ─── Drops ────────────────────────────────────────────────────
CREATE TABLE public.drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_number SERIAL NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  story TEXT NOT NULL,
  design_image_url TEXT NOT NULL,
  mockup_image_url TEXT NOT NULL,
  price INTEGER NOT NULL, -- in paise (INR lowest unit)
  currency TEXT NOT NULL DEFAULT 'INR',
  material TEXT NOT NULL DEFAULT '100% Organic Cotton',
  sizes TEXT[] NOT NULL DEFAULT '{XS,S,M,L,XL,XXL}',
  status TEXT NOT NULL DEFAULT 'upcoming' 
    CHECK (status IN ('upcoming', 'live', 'sold', 'retired')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read drops" ON public.drops FOR SELECT USING (true);
CREATE POLICY "Admins can insert drops" ON public.drops FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update drops" ON public.drops FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ─── Orders ───────────────────────────────────────────────────
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id UUID NOT NULL REFERENCES public.drops(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  size TEXT NOT NULL,
  amount INTEGER NOT NULL, -- paise
  currency TEXT NOT NULL DEFAULT 'INR',
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed')),
  serial_number TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read all orders" ON public.orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ─── Owners ───────────────────────────────────────────────────
CREATE TABLE public.owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id UUID NOT NULL UNIQUE REFERENCES public.drops(id), -- ONE owner per drop
  user_id UUID NOT NULL REFERENCES public.users(id),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id),
  serial_number TEXT NOT NULL UNIQUE,
  size TEXT NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read owners" ON public.owners FOR SELECT USING (true);
CREATE POLICY "System can insert owners" ON public.owners FOR INSERT WITH CHECK (true);

-- ─── Storage buckets ──────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('drops', 'drops', true);
CREATE POLICY "Public can read drop images" ON storage.objects FOR SELECT
  USING (bucket_id = 'drops');
CREATE POLICY "Admins can upload drop images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'drops' AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ─── Functions ────────────────────────────────────────────────

-- Auto-update drop status to 'live' when scheduled_at passes
CREATE OR REPLACE FUNCTION auto_activate_drops()
RETURNS void LANGUAGE sql AS $$
  UPDATE public.drops
  SET status = 'live'
  WHERE status = 'upcoming'
    AND scheduled_at <= NOW()
    AND expires_at > NOW();
$$;

-- Auto-retire drops when expires_at passes  
CREATE OR REPLACE FUNCTION auto_retire_drops()
RETURNS void LANGUAGE sql AS $$
  UPDATE public.drops
  SET status = 'retired'
  WHERE status = 'live'
    AND expires_at <= NOW();
$$;

-- Trigger: when an owner is created, mark drop as sold
CREATE OR REPLACE FUNCTION mark_drop_sold()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.drops SET status = 'sold' WHERE id = NEW.drop_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_owner_created
  AFTER INSERT ON public.owners
  FOR EACH ROW EXECUTE FUNCTION mark_drop_sold();

-- Trigger: auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_drops_status ON public.drops(status);
CREATE INDEX idx_drops_drop_number ON public.drops(drop_number DESC);
CREATE INDEX idx_drops_scheduled ON public.drops(scheduled_at);
CREATE INDEX idx_drops_expires ON public.drops(expires_at);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_drop ON public.orders(drop_id);
CREATE INDEX idx_owners_drop ON public.owners(drop_id);
CREATE INDEX idx_owners_user ON public.owners(user_id);

-- ─── Seed data (example drop) ─────────────────────────────────
INSERT INTO public.drops (
  name, slug, story, design_image_url, mockup_image_url,
  price, material, sizes, status, scheduled_at, expires_at
) VALUES (
  'MERIDIAN ZERO',
  'meridian-zero-001',
  'Born from the intersection of cartographic obsession and void theory. The design maps coordinates that lead nowhere — a monument to the unreachable.',
  'https://your-supabase-url.supabase.co/storage/v1/object/public/drops/001-design.png',
  'https://your-supabase-url.supabase.co/storage/v1/object/public/drops/001-mockup.png',
  399900, -- ₹3,999 in paise
  '100% Organic Cotton',
  '{XS,S,M,L,XL,XXL}',
  'live',
  NOW() - INTERVAL '1 hour',
  NOW() + INTERVAL '23 hours'
);
