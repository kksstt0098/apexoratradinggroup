import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error } = await context.supabase.from("profiles").select("first_name, middle_name, last_name, email, phone, country, balance, invite_code").eq("id", context.userId).single();
    if (error) throw new Error("Unable to load your account. Please try again.");
    const { data: referrals, error: referralError } = await context.supabase.rpc("count_my_referrals");
    if (referralError) throw new Error("Unable to load your invitations. Please try again.");
    return { profile, referrals };
  });