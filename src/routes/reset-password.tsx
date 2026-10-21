import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — ETO Markets" }, { name: "description", content: "Choose a new password for your ETO Markets account." }, { property: "og:title", content: "Reset Password — ETO Markets" }, { property: "og:description", content: "Choose a new password for your ETO Markets account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ResetPassword,
});
function ResetPassword() {
  const navigate = useNavigate();
  const [recovery, setRecovery] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.get("type") !== "recovery") { setError("Open the password reset link from your email."); return; }
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) setError("This reset link has expired. Please request a new one.");
      else setRecovery(true);
    });
  }, []);
  return <main className="flex min-h-screen items-center justify-center bg-card px-5"><section className="w-full max-w-sm"><h1 className="text-2xl font-bold">Reset password</h1>
    {done ? <><p className="my-5" role="status">Your password has been updated.</p><Button onClick={() => navigate({ to: "/dashboard", replace: true })}>My Accounts</Button></> : <form className="mt-6 space-y-4" onSubmit={async event => { event.preventDefault(); setBusy(true); setError(""); const form = new FormData(event.currentTarget); const password = String(form.get("password")); if (password !== form.get("confirm")) { setError("Passwords do not match."); setBusy(false); return; } const { error } = await supabase.auth.updateUser({ password }); if (error) setError(error.message); else setDone(true); setBusy(false); }}>
      <label className="block text-sm">New password<input aria-label="New password" name="password" type="password" required minLength={8} autoComplete="new-password" className="mt-2 h-12 w-full rounded-lg border border-border bg-background px-4" /></label>
      <label className="block text-sm">Confirm password<input aria-label="Confirm new password" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="mt-2 h-12 w-full rounded-lg border border-border bg-background px-4" /></label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={!recovery || busy}>{busy ? "Updating…" : "Update password"}</Button>
      <Button type="button" variant="link" onClick={() => navigate({ to: "/" })}>Back to Sign In</Button>
    </form>}
  </section></main>;
}