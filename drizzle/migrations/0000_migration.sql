CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  first_name text,
  middle_name text,
  last_name text,
  phone text,
  country text,
  invite_code text NOT NULL UNIQUE,
  referred_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.invite_code_exists(_code text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE invite_code = _code)
$$;
GRANT EXECUTE ON FUNCTION public.invite_code_exists(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.count_my_referrals()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM public.profiles WHERE referred_by = auth.uid()
$$;
GRANT EXECUTE ON FUNCTION public.count_my_referrals() TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _code text;
  _ref uuid;
  _given text := nullif(trim(NEW.raw_user_meta_data->>'invite_code'), '');
BEGIN
  IF _given IS NOT NULL THEN
    SELECT id INTO _ref FROM public.profiles WHERE invite_code = _given;
    IF _ref IS NULL THEN
      RAISE EXCEPTION 'Invalid invite code';
    END IF;
  END IF;
  LOOP
    _code := lpad((floor(random() * 1000000))::int::text, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE invite_code = _code);
  END LOOP;
  INSERT INTO public.profiles (id, email, first_name, middle_name, last_name, phone, country, invite_code, referred_by)
  VALUES (NEW.id, NEW.email,
    NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'middle_name',
    NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country', _code, _ref);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();