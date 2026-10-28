CREATE TABLE public.kyc_submissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 identity_path text NOT NULL,
 address_path text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id)
);
GRANT SELECT ON public.kyc_submissions TO authenticated;
GRANT INSERT(user_id,identity_path,address_path) ON public.kyc_submissions TO authenticated;
GRANT ALL ON public.kyc_submissions TO service_role;
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own KYC" ON public.kyc_submissions FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY "Submit own KYC" ON public.kyc_submissions FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND status='pending');
CREATE FUNCTION public.validate_kyc_submission() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p text; obj record;
BEGIN
 IF NEW.identity_path=NEW.address_path THEN RAISE EXCEPTION 'Two different documents are required'; END IF;
 FOREACH p IN ARRAY ARRAY[NEW.identity_path,NEW.address_path] LOOP
  IF split_part(p,'/',1)<>NEW.user_id::text THEN RAISE EXCEPTION 'Invalid document owner'; END IF;
  SELECT metadata INTO obj FROM storage.objects WHERE bucket_id='kyc-documents' AND name=p;
  IF NOT FOUND THEN RAISE EXCEPTION 'Document not uploaded'; END IF;
  IF COALESCE((obj.metadata->>'size')::bigint,0)<=0 OR (obj.metadata->>'size')::bigint>10485760 OR COALESCE(obj.metadata->>'mimetype','') NOT IN ('image/jpeg','image/png','application/pdf') THEN RAISE EXCEPTION 'Invalid document format or size'; END IF;
 END LOOP;
 RETURN NEW;
END $$;
CREATE TRIGGER validate_kyc_before_insert BEFORE INSERT ON public.kyc_submissions FOR EACH ROW EXECUTE FUNCTION public.validate_kyc_submission();
CREATE POLICY "Upload own KYC files" ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='kyc-documents' AND (storage.foldername(name))[1]=auth.uid()::text AND lower(storage.extension(name)) IN ('jpg','jpeg','png','pdf') AND NOT EXISTS(SELECT 1 FROM public.kyc_submissions WHERE user_id=auth.uid()));
CREATE POLICY "Read own KYC files" ON storage.objects FOR SELECT TO authenticated USING(bucket_id='kyc-documents' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY "Remove unsubmitted own KYC files" ON storage.objects FOR DELETE TO authenticated USING(bucket_id='kyc-documents' AND (storage.foldername(name))[1]=auth.uid()::text AND NOT EXISTS(SELECT 1 FROM public.kyc_submissions WHERE user_id=auth.uid() AND (identity_path=name OR address_path=name)));
