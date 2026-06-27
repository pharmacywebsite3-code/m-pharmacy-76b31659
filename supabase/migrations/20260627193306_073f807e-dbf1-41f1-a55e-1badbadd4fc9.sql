
CREATE POLICY "Users can view own prescription files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own prescription files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own prescription files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);
