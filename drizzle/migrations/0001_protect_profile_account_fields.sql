REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (first_name, middle_name, last_name, phone, country) ON public.profiles TO authenticated;
REVOKE EXECUTE ON FUNCTION public.count_my_referrals() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.count_my_referrals() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;