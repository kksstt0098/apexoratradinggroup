import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mail, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { checkInviteCode } from "@/lib/signup-validation";
import { BrandLogo } from "@/components/brand-logo";
import bg from "@/assets/login-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign In — VW Markets" },
      { name: "description", content: "Sign in to your VW Markets account and start the adventure." },
      { property: "og:title", content: "Sign In — VW Markets" },
      { property: "og:description", content: "Sign in to your VW Markets account and start the adventure." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});


function Index() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reset, setReset] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setError(""); setNotice("");
    try {
      const email = String(form.get("email") || "").trim();
      if (reset) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setNotice("If an account exists, a password reset link has been sent. Please check your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: String(form.get("password") || "") });
        if (error) throw error;
        await navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to sign in. Please try again."); }
    finally { setBusy(false); }
  }
  const [show, setShow] = useState(false);
  
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [mode]);

  return (
    <div className="relative min-h-screen w-full bg-background">
      <img
        src={bg}
        alt=""
        width={1920}
        height={1088}
        className="fixed inset-0 h-full w-full object-cover"
      />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 lg:justify-end lg:px-0 lg:py-0 lg:pr-[6%]">
        <div
          ref={panelRef}
          className="w-full max-w-[612px] rounded-3xl bg-card px-6 py-8 shadow-2xl sm:px-10 sm:py-12 lg:min-h-screen lg:rounded-b-none"
        >
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-background shadow-sm sm:h-24 sm:w-24">
            <BrandLogo className="h-12 w-14 sm:h-16 sm:w-20" />
          </div>

          {mode === "signin" ? (
            <>
              <h1 className="mt-6 text-center text-2xl font-bold text-foreground sm:text-3xl">
                {reset ? "Reset password" : "Welcome to VW Markets"}
              </h1>
              <p className="mt-2 text-center text-sm text-muted-foreground sm:text-base">
                Please sign-in to your account and start the adventure
              </p>

              <form className="mt-8 space-y-5" onSubmit={submit}>
                <div>
                  <label htmlFor="email" className="mb-3 block text-sm font-semibold text-foreground">Email</label>
                  <div className="flex h-16 items-center rounded-xl border border-border bg-background px-6">
                    <input id="email" name="email" required autoComplete="email" type="email" placeholder="Enter your email" className="min-w-0 flex-1 bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground" />
                    <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>
                </div>
                <div hidden={reset}>
                  <label htmlFor="password" className="mb-3 block text-sm font-semibold text-foreground">Password</label>
                  <div className="flex h-16 items-center rounded-xl border border-border bg-background px-6">
                    <input id="password" name="password" required={!reset} autoComplete="current-password" type={show ? "text" : "password"} placeholder="Enter your password" className="min-w-0 flex-1 bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => setShow(!show)} aria-label="Toggle password" className="shrink-0 text-muted-foreground">
                      {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="link" onClick={() => { setReset(!reset); setError(""); setNotice(""); }}>{reset ? "Back to Sign In" : "Reset password"}</Button>
                </div>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                {notice && <p role="status" className="text-sm text-foreground">{notice}</p>}
                <Button type="submit" disabled={busy} className="h-14 w-full rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-lg transition hover:opacity-90 sm:h-[70px]">
                  {busy ? (reset ? "Sending…" : "Signing in…") : reset ? "Send reset link" : "Sign In"}
                </Button>
                <div className="flex items-center gap-4">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-sm text-muted-foreground sm:text-base">Don't have an account yet?</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 text-center text-sm font-semibold text-foreground sm:text-base">
                  <Button type="button" variant="link" onClick={() => setMode("create")} className="text-foreground hover:underline">Create Live Account</Button>
                  <span className="text-muted-foreground">Try Demo Account</span>
                </div>
              </form>
            </>
          ) : (
            <CreateAccountPanel onBack={() => setMode("signin")} />
          )}
        </div>
      </div>
    </div>
  );
}

function CreateAccountPanel({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function signup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(""); setBusy(true);
    try {
      const password = String(form.get("regPassword") || "");
      if (password !== form.get("confirmPassword")) throw new Error("Passwords do not match.");
      const invite_code = await checkInviteCode(String(form.get("invite") || ""), async (_code) => {
        const { data, error } = await supabase.rpc("invite_code_exists", { _code });
        if (error) throw new Error("Unable to check invite code. Please try again.");
        return data === true;
      });
      const { data, error } = await supabase.auth.signUp({
        email: String(form.get("regEmail") || "").trim(), password,
        options: { emailRedirectTo: window.location.origin, data: {
          first_name: String(form.get("firstName") || "").trim(), middle_name: String(form.get("middleName") || "").trim(),
          last_name: String(form.get("lastName") || "").trim(), phone: String(form.get("phone") || "").trim(), country: form.get("country"), invite_code,
        } },
      });
      if (error) throw error;
      if (data.session) await navigate({ to: "/dashboard", replace: true });
      else setNotice("Check your email to confirm your account before signing in.");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to create account."); }
    finally { setBusy(false); }
  }
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const labelCls = "mb-2 block text-xs font-semibold text-foreground";
  const inputCls =
    "h-12 w-full rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground";

  return (
    <div className="mx-auto w-full max-w-[520px]">
      <h2 className="mt-6 text-center text-2xl font-bold text-foreground">Create account</h2>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Provide your details to begin your trading journey with us.
      </p>

      <div className="mt-8 flex items-end justify-between border-b border-border pb-3">
        <div>
          <span className="text-base font-bold text-foreground">Personal Details</span>
          <div className="mt-2 h-[3px] w-44 rounded-full bg-primary" />
        </div>
        <span className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Check className="h-3.5 w-3.5" />
          Step: 1 / 2
        </span>
      </div>

      <form className="mt-6 space-y-4" onSubmit={signup}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className={labelCls}>First Name</label>
            <input id="firstName" name="firstName" required className={inputCls} placeholder="Enter your first name" />
          </div>
          <div>
            <label htmlFor="middleName" className={labelCls}>Middle Name (Optional)</label>
            <input id="middleName" name="middleName" className={inputCls} placeholder="Enter your middle name" />
          </div>
        </div>
        <div>
          <label htmlFor="lastName" className={labelCls}>Last Name</label>
          <input id="lastName" name="lastName" required className={inputCls} placeholder="Enter your last name" />
        </div>
        <div>
          <label htmlFor="regEmail" className={labelCls}>Email</label>
          <input id="regEmail" name="regEmail" required type="email" autoComplete="email" className={inputCls} placeholder="Enter your email" />
        </div>
        <div>
          <label htmlFor="regPassword" className={labelCls}>Password</label>
          <div className="relative">
            <input
              id="regPassword" name="regPassword" required minLength={8} autoComplete="new-password"
              type={showPw ? "text" : "password"}
              className={`${inputCls} pr-12`}
              placeholder="Enter your password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPw(!showPw)}
              aria-label="Toggle password"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div>
          <label htmlFor="confirmPassword" className={labelCls}>Confirm Password</label>
          <div className="relative">
            <input
              id="confirmPassword" name="confirmPassword" required minLength={8} autoComplete="new-password"
              type={showConfirm ? "text" : "password"}
              className={`${inputCls} pr-12`}
              placeholder="Re-enter your password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label="Toggle confirm password"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>Phone Number</label>
          <input id="phone" name="phone" required type="tel" className={inputCls} placeholder="+15551234567 (Country Code Required)" />
        </div>
        <div>
          <label htmlFor="country" className={labelCls}>Country/Region of Residence</label>
          <select id="country" name="country" required defaultValue="" className={inputCls}>
            <option value="" disabled>Please select your country</option>
            {Array.from({ length: 26 * 26 }, (_, i) => String.fromCharCode(65 + Math.floor(i / 26), 65 + i % 26)).map(code => {
              const region = new Intl.DisplayNames(["en"], { type: "region" }).of(code);
              return region && region !== code ? { code, region } : null;
            }).filter((item): item is { code: string; region: string } => item !== null).sort((a, b) => a.region.localeCompare(b.region)).map(({ code, region }) => <option key={code} value={code}>{region}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="invite" className={labelCls}>Invite Code (Optional)</label>
          <input id="invite" name="invite" inputMode="numeric" maxLength={6} className={inputCls} placeholder="Enter your 6-digit invite code" />
        </div>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {notice && <p role="status" className="text-sm text-foreground">{notice}</p>}
        <Button
          disabled={busy}
          type="submit"
          className="h-12 w-full rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg transition hover:opacity-90"
        >
          {busy ? "Creating account…" : "Continue"}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Already a customer?{" "}
        <Button type="button" variant="link" onClick={onBack} className="font-semibold text-primary underline">
          Sign in to your account
        </Button>
      </p>
    </div>
  );
}
