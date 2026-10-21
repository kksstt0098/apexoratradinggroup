import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Globe, UserRound, Plus, Eye, EyeOff, Info, Headset, LayoutDashboard, CircleDollarSign, Download, User, Ellipsis, Copy, LogOut, ShieldHalf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getAccount } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import bg from "@/assets/login-bg.jpg";
import devices from "@/assets/copy-trading.jpg";

const accountQuery = queryOptions({ queryKey: ["my-account"], queryFn: () => getAccount() });
export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) => context.queryClient.ensureQueryData(accountQuery),
  head: () => ({ meta: [{ title: "My Accounts — ETO Markets" }, { name: "description", content: "Your ETO Markets account balance and invitations." }, { property: "og:title", content: "My Accounts — ETO Markets" }, { property: "og:description", content: "Your ETO Markets account balance and invitations." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: { profile, referrals } } = useSuspenseQuery(accountQuery);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const [dialog, setDialog] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const show = (name: string) => { setError(""); setDialog(name); };
  async function logout() {
    setBusy(true);
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) { setError(error.message); setBusy(false); return; }
    await navigate({ to: "/", replace: true });
  }
  return <div className="min-h-screen bg-account-background pb-24">
    <header className="sticky top-0 z-20 border-b border-border bg-background">
      <div className="mx-auto flex h-[74px] max-w-5xl items-center justify-between px-5">
        <h1 className="text-lg font-bold">My Accounts</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Language" onClick={() => show("Language")}><Globe /></Button>
          <Button variant="ghost" size="icon" aria-label="My profile" onClick={() => show("My profile")}><UserRound /></Button>
          <Button size="icon" className="h-9 w-9 rounded-full" aria-label="Add account" onClick={() => show("Add account")}><Plus /></Button>
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-5xl px-5 pt-6">
      <section className="relative h-[224px] overflow-hidden rounded-[20px] bg-foreground sm:h-[270px]">
        <img src={bg} alt="ETO Markets racing anniversary city" width={1920} height={1088} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-banner-overlay" />
        <div className="absolute left-7 top-16 text-primary-foreground sm:left-12">
          <div className="flex items-center gap-5"><span className="text-xl font-bold">ETO<br /><span className="text-xs font-normal">Markets</span></span><span className="text-3xl font-black italic text-anniversary">13 <span className="block text-xs font-normal">YEARS</span></span></div>
          <h2 className="mt-4 text-xl font-bold text-anniversary">Race Beyond Limits</h2>
        </div>
      </section>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="rounded-[20px] border border-border/40 bg-background px-5 py-6">
          <div className="flex items-center gap-2"><h2 className="text-xl font-bold">Funds</h2><Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label={hidden ? "Show balance" : "Hide balance"} onClick={() => setHidden(!hidden)}>{hidden ? <EyeOff /> : <Eye />}</Button></div>
          <p className="mt-4 flex items-center gap-1 text-sm">Account Balance <Info className="h-3.5 w-3.5 text-muted-foreground" /></p>
          <p className="mt-1"><strong className="text-2xl">{hidden ? "••••" : Number(profile.balance).toFixed(2)}</strong> <span className="text-sm">USD</span></p>
          <div className="mt-4 flex max-w-[250px] flex-wrap gap-2">{["Deposit", "Withdraw", "Transfer"].map(label => <Button key={label} variant="secondary" className="rounded-full px-5" onClick={() => show(label)}>{label}</Button>)}</div>
        </section>
        <section className="relative min-h-[265px] overflow-hidden rounded-[20px] border border-border/40 bg-background px-7 py-7">
          <img src={devices} loading="lazy" width={1024} height={640} alt="Copy trading on laptop and phone" className="absolute bottom-0 right-0 h-40 w-3/5 object-cover object-right" />
          <h2 className="relative text-xl font-bold">Copy Trading</h2>
          <p className="relative mt-5 max-w-[150px] text-sm leading-[1.55]">Follow top traders and let their strategies work for you.</p>
          <Button className="relative mt-5 rounded-full px-6" onClick={() => show("Copy Trading")}>Explore</Button>
        </section>
      </div>
      <section className="mx-auto max-w-xl py-9 text-center">
        <ShieldHalf className="mx-auto h-20 w-20 fill-foreground" strokeWidth={1.5} />
        <h2 className="mt-8 text-[28px] font-bold leading-[1.3]">Please complete<br />identity verification first</h2>
        <p className="mt-4 text-base leading-6">To help keep your account secure and meet compliance requirements, some services require KYC identity verification before use. Once verified, you can continue with the related operation.</p>
        <p className="mt-4 text-sm leading-5 text-muted-foreground"><Info className="mr-1 inline h-3.5 w-3.5" />Verification usually only takes a few minutes. Please prepare a valid identity document in advance.</p>
        <Button className="mt-5 h-12 rounded-full px-6 font-bold" onClick={() => show("Identity verification")}>Verify Now</Button>
      </section>
    </main>
    <Button className="fixed bottom-24 right-5 z-20 h-12 w-12 rounded-full shadow-lg [&_svg]:size-6" aria-label="Support" onClick={() => show("Support")}><Headset /></Button>
    <nav aria-label="Account navigation" className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-around">{[{ icon: LayoutDashboard, name: "My Accounts" }, { icon: CircleDollarSign, name: "Funds" }, { icon: Download, name: "Downloads" }, { icon: User, name: "My profile" }, { icon: Ellipsis, name: "More" }].map(({ icon: Icon, name }) => <Button key={name} variant="ghost" size="icon" aria-label={name} aria-current={name === "My Accounts" ? "page" : undefined} className={name === "My Accounts" ? "text-primary" : "text-foreground"} onClick={() => name === "My Accounts" ? window.scrollTo({ top: 0, behavior: "smooth" }) : show(name)}><Icon className="size-5" /></Button>)}</div>
    </nav>
    <Dialog open={!!dialog} onOpenChange={open => { if (!open) setDialog(""); }}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>{dialog}</DialogTitle><DialogDescription>{dialog === "My profile" || dialog === "More" ? "Your account and invitations" : dialog === "Language" ? "English" : "Identity verification and trading services are not connected yet. No payment or document will be collected."}</DialogDescription></DialogHeader>
      {(dialog === "My profile" || dialog === "More") && <div className="space-y-4 text-sm"><p className="font-semibold">{[profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ")}</p><p className="break-all">{profile.email}</p><div className="border-y border-border py-4"><p className="text-muted-foreground">Your invitation code</p><div className="mt-1 flex items-center justify-between"><strong className="text-2xl" data-testid="invite-code">{profile.invite_code}</strong><Button variant="outline" size="icon" aria-label="Copy invitation code" onClick={async () => { try { await navigator.clipboard.writeText(profile.invite_code); setCopied(true); } catch { setError("Unable to copy. Please copy the code manually."); } }}><Copy /></Button></div>{copied && <p role="status">Copied</p>}<p className="mt-3">Invited users: <strong data-testid="referral-count">{referrals}</strong></p></div><Button variant="outline" className="w-full" disabled={busy} onClick={logout}><LogOut />{busy ? "Signing out…" : "Sign Out"}</Button></div>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </DialogContent></Dialog>
  </div>;
}