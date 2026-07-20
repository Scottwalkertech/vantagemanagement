
CREATE POLICY "Public read artists bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'artists');
CREATE POLICY "Admins upload to artists bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'artists' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update artists bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'artists' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete from artists bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'artists' AND public.has_role(auth.uid(), 'admin'));
