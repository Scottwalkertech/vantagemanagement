
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'merchandise',
  stock INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published products" ON public.products FOR SELECT USING (is_published = true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_set_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.charity_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  completed_on DATE,
  evidence_images TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.charity_works TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.charity_works TO authenticated;
GRANT ALL ON public.charity_works TO service_role;
ALTER TABLE public.charity_works ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view charity works" ON public.charity_works FOR SELECT USING (true);
CREATE POLICY "Admins manage charity works" ON public.charity_works FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER charity_works_set_updated BEFORE UPDATE ON public.charity_works
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.awards_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  award_body TEXT NOT NULL,
  category TEXT NOT NULL,
  artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.awards_records TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.awards_records TO authenticated;
GRANT ALL ON public.awards_records TO service_role;
ALTER TABLE public.awards_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view awards" ON public.awards_records FOR SELECT USING (true);
CREATE POLICY "Admins manage awards" ON public.awards_records FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER awards_records_set_updated BEFORE UPDATE ON public.awards_records
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
