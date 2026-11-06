import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Globe, UserRound, Plus, Eye, EyeOff, Info, Headset, LayoutDashboard, CandlestickChart, ChartNoAxesCombined, User, Ellipsis, Copy, LogOut, ShieldHalf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getAccount } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import bg from "@/assets/login-bg.jpg";
import devices from "@/assets/copy-trading.jpg";
import { BrandLogo } from "@/components/brand-logo";
import { AccountDisclaimer } from "@/components/account-disclaimer";
import { AccountSidebar } from "@/components/account-sidebar";

const accountQuery = queryOptions({ queryKey: ["my-account"], queryFn: () => getAccount() });
export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) => context.queryClient.ensureQueryData(accountQuery),
  head: () => ({ meta: [{ title: "My Accounts — VW Markets" }, { name: "description", content: "Your VW Markets account balance and invitations." }, { property: "og:title", content: "My Accounts — VW Markets" }, { property: "og:description", content: "Your VW Markets account balance and invitations." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
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
  const show = (name: string) => { if (name === "Funds") { navigate({ to: "/quotes" }); return; } if (name === "Downloads") { navigate({ to: "/charts" }); return; } setError(""); setDialog(name); };
  async function logout() {
    setBusy(true);
    await queryClient.cancelQueries();
    queryClient.clear();
    const { error } = await supabase.auth.signOut();
    if (error) { setError(error.message); setBusy(false); return; }
    await navigate({ to: "/", replace: true });
  }
  return <div className="account-layout min-h-screen bg-account-background pb-24 md:pb-8">
    <AccountSidebar onSelect={show} userName={[profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ") || String(profile.email)} onLogout={logout} />
    <div className="account-content md:ml-[216px] xl:ml-[280px] 2xl:ml-[320px]">
    <header className="border-b border-border bg-background">
      <div className="grid h-[74px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-5 md:h-20 md:px-8 xl:px-12 2xl:px-[72px]">
        <h1 className="min-w-0 truncate text-lg font-bold md:text-2xl">My Accounts</h1>
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <Button variant="ghost" size="icon" aria-label="Language" onClick={() => show("Language")}><Globe /></Button>
          <Button variant="ghost" size="icon" aria-label="My profile" onClick={() => show("My profile")}><UserRound /></Button>
          <Button size="icon" className="h-9 w-9 rounded-full" aria-label="Add account" onClick={() => show("Add account")}><Plus /></Button>
        </div>
      </div>
    </header>
    <main className="px-5 pt-6 md:px-8 xl:px-12 2xl:px-[72px]">
      <section className="relative h-[224px] overflow-hidden rounded-[20px] bg-foreground md:h-[200px] xl:h-[224px] 2xl:h-[240px]">
        <img src={bg} alt="VW Markets racing anniversary city" width={1920} height={1088} className="h-full w-full object-cover object-right" />
        <div className="absolute inset-0 bg-banner-overlay" />
        <div className="absolute left-7 top-16 text-primary-foreground md:left-8 md:top-12 xl:left-12">
          <div className="flex items-center gap-5"><span className="flex items-center gap-2"><BrandLogo className="h-9 w-12 shrink-0" /><span className="text-xl font-bold">VW<br /><span className="text-xs font-normal">Markets</span></span></span><span className="text-3xl font-black italic text-anniversary">13 <span className="block text-xs font-normal">YEARS</span></span></div>
          <h2 className="mt-4 text-xl font-bold text-anniversary md:text-2xl xl:text-3xl">Race Beyond Limits</h2>
        </div>
      </section>
      <div className="mt-4 grid gap-4 md:mt-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2.05fr)_minmax(0,1fr)] xl:gap-6">
        <section className="min-w-0 rounded-[20px] border border-border/40 bg-background px-5 py-6 md:min-h-[260px] xl:px-8 xl:py-8">
          <div className="flex items-center gap-2"><h2 className="text-xl font-bold">Funds</h2><Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label={hidden ? "Show balance" : "Hide balance"} onClick={() => setHidden(!hidden)}>{hidden ? <EyeOff /> : <Eye />}</Button><Button variant="link" className="ml-auto px-0 text-xs" onClick={() => show("Funds")}>Quotes</Button></div>
          <p className="mt-4 flex items-center gap-1 text-sm">Account Balance <Info className="h-3.5 w-3.5 text-muted-foreground" /></p>
          <p className="mt-1"><strong className="text-2xl">{hidden ? "••••" : Number(profile.balance).toFixed(2)}</strong> <span className="text-sm">USD</span></p>
          <div className="mt-4 flex flex-wrap gap-2 md:mt-9 xl:gap-3">{["Deposit", "Withdraw", "Transfer"].map(label => <Button key={label} variant="secondary" className="rounded-full px-5 xl:h-11" onClick={() => show(label)}>{label}</Button>)}</div>
        </section>
        <section className="relative min-h-[265px] min-w-0 overflow-hidden rounded-[20px] border border-border/40 bg-background px-7 py-7 md:px-6 xl:px-8 xl:py-8">
          <img src={devices} loading="lazy" width={1024} height={640} alt="Copy trading on laptop and phone" className="absolute bottom-0 right-0 h-40 w-3/5 object-cover object-right md:h-28 xl:h-36" />
          <h2 className="relative text-xl font-bold">Copy Trading</h2>
          <p className="relative mt-5 max-w-[150px] text-sm leading-[1.55] md:mt-4 md:max-w-full xl:max-w-[180px]">Follow top traders and let their strategies work for you.</p>
          <Button className="relative mt-5 rounded-full px-6" onClick={() => show("Copy Trading")}>Explore</Button>
        </section>
      </div>
      <section className="mx-auto max-w-xl py-9 text-center md:pt-12">
        <ShieldHalf className="mx-auto h-20 w-20 fill-foreground" strokeWidth={1.5} />
        <h2 className="mt-8 text-[28px] font-bold leading-[1.3]">Please complete<br />identity verification first</h2>
        <p className="mt-4 text-base leading-6">To help keep your account secure and meet compliance requirements, some services require KYC identity verification before use. Once verified, you can continue with the related operation.</p>
        <p className="mt-4 text-sm leading-5 text-muted-foreground"><Info className="mr-1 inline h-3.5 w-3.5" />Verification usually only takes a few minutes. Please prepare a valid identity document in advance.</p>
        <Button className="mt-5 h-12 rounded-full px-6 font-bold" onClick={() => navigate({ to: "/profile-settings" })}>Verify Now</Button>
      </section>
      <AccountDisclaimer />
    </main>
    </div>
    <Button className="fixed bottom-24 right-5 z-20 h-12 w-12 rounded-full shadow-lg md:bottom-8 md:right-6 md:h-14 md:w-14 [&_svg]:size-6" aria-label="Support" onClick={() => show("Support")}><Headset /></Button>
    <nav aria-label="Account navigation" className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-lg md:hidden">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-around">{[{ icon: LayoutDashboard, name: "My Accounts" }, { icon: ChartNoAxesCombined, name: "Funds" }, { icon: CandlestickChart, name: "Downloads" }, { icon: User, name: "My profile" }, { icon: Ellipsis, name: "More" }].map(({ icon: Icon, name }) => <Button key={name} variant="ghost" size="icon" aria-label={name} aria-current={name === "My Accounts" ? "page" : undefined} className={name === "My Accounts" ? "text-primary" : "text-foreground"} onClick={() => name === "My Accounts" ? window.scrollTo({ top: 0, behavior: "smooth" }) : show(name)}><Icon className="size-5" /></Button>)}</div>
    </nav>
    <Dialog open={!!dialog} onOpenChange={open => { if (!open) setDialog(""); }}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>{dialog}</DialogTitle><DialogDescription>{dialog === "My profile" || dialog === "More" ? "Your account and invitations" : dialog === "Language" ? "English" : "Identity verification and trading services are not connected yet. No payment or document will be collected."}</DialogDescription></DialogHeader>
      {(dialog === "My profile" || dialog === "More") && <div className="space-y-4 text-sm"><p className="font-semibold">{[profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ")}</p><p className="break-all">{profile.email}</p><div className="border-y border-border py-4"><p className="text-muted-foreground">Your invitation code</p><div className="mt-1 flex items-center justify-between"><strong className="text-2xl" data-testid="invite-code">{profile.invite_code}</strong><Button variant="outline" size="icon" aria-label="Copy invitation code" onClick={async () => { try { await navigator.clipboard.writeText(profile.invite_code); setCopied(true); } catch { setError("Unable to copy. Please copy the code manually."); } }}><Copy /></Button></div>{copied && <p role="status">Copied</p>}<p className="mt-3">Invited users: <strong data-testid="referral-count">{referrals}</strong></p></div><Button variant="outline" className="w-full" disabled={busy} onClick={logout}><LogOut />{busy ? "Signing out…" : "Sign Out"}</Button></div>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </DialogContent></Dialog>
  </div>;
}