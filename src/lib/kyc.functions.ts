import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { kycPathsSchema } from "@/lib/kyc-validation";

export const getKyc = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("kyc_submissions").select("id,status,created_at,identity_path,address_path").eq("user_id", context.userId).maybeSingle();
  if (error) throw new Error("Unable to load verification status. Please try again.");
  return data;
});

export const submitKyc = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => kycPathsSchema.parse(input))
  .handler(async ({ data, context }) => {
    for (const path of [data.identityPath, data.addressPath]) {
      if (!path.startsWith(`${context.userId}/`) || path.includes("..")) throw new Error("Invalid document owner.");
    }
    const { error } = await context.supabase.from("kyc_submissions").insert({ user_id: context.userId, identity_path: data.identityPath, address_path: data.addressPath });
    if (error) throw new Error("Unable to submit. Check both documents or refresh to check an existing submission.");
    return { success: true };
  });