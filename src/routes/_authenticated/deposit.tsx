import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Headset, Info, LayoutDashboard, ChartNoAxesCombined, CandlestickChart, User, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AccountSidebar } from "@/components/account-sidebar";
import { getAccount } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";

const accountQuery = queryOptions({ queryKey: ["my-account"], queryFn: () => getAccount() });

export const Route = createFileRoute("/_authenticated/deposit")({
  loader: ({ context }) => context.queryClient.ensureQueryData(accountQuery),
  head: () => ({ meta: [
    { title: "Deposit Funds — VW Markets" },
    { name: "description", content: "Prepare your VW Markets deposit amount and payment currency." },
    { property: "og:title", content: "Deposit Funds — VW Markets" },
    { property: "og:description", content: "Select your VW Markets account and prepare a deposit." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Deposit,
});

function Deposit() {
  const { data: { profile } } = useSuspenseQuery(accountQuery);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("MMK");
  const [notice, setNotice] = useState("");
  const name = [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ");
  const accounts = () => { void navigate({ to: "/dashboard" }); };
  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) { setNotice("Unable to sign out. Please try again."); return; }
    await queryClient.cancelQueries();
    queryClient.clear();
    await navigate({ to: "/", replace: true });
  }
  return <div className="account-layout min-h-screen bg-background pb-20 md:pb-8">
    <AccountSidebar userName={name || String(profile.email)} onLogout={logout} onAccounts={accounts} onSelect={label => { if (label !== "Deposit") setNotice(`${label} services are not connected yet.`); }} />
    <div className="account-content md:ml-[216px] xl:ml-[280px] 2xl:ml-[320px]">
      <header className="px-5 pt-4 md:px-8 md:pt-7 xl:px-12">
        <div className="flex h-10 items-center gap-2"><Button variant="ghost" size="icon" className="-ml-2 size-9 text-muted-foreground" aria-label="Back to My Accounts" onClick={accounts}><ArrowLeft className="size-4" /></Button><h1 className="flex-1 text-xl font-semibold md:text-2xl">Funds</h1><Button variant="ghost" size="icon" className="size-9 text-muted-foreground" aria-label="Support" onClick={() => setNotice("Support services are not connected yet.")}><Headset className="size-5" /></Button></div>
        <nav aria-label="Funds sections" className="mt-2 grid grid-cols-4 border-b border-border md:mt-4 md:flex md:gap-8">
          {["Deposit", "Withdraw", "Transfer", "History"].map(tab => <Button key={tab} variant="ghost" aria-current={tab === "Deposit" ? "page" : undefined} className={`h-10 rounded-none border-b-2 px-0 text-sm font-normal hover:bg-transparent ${tab === "Deposit" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`} onClick={() => { if (tab !== "Deposit") setNotice(`${tab} services are not connected yet.`); }}>{tab}</Button>)}
        </nav>
      </header>
      <main className="px-5 md:px-8 xl:px-12">
        <div className="grid max-w-5xl gap-6 pt-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] md:gap-8 md:pt-10 xl:gap-12">
          <section className="space-y-3 md:space-y-6 md:pt-1" aria-label="Deposit steps">
            {[
              { title: "Select account", description: "Choose the account to receive your deposit." },
              { title: "Enter deposit amount", description: "Use USD, or USC for a Cent Account." },
              { title: "Choose payment currency", description: "Your payable amount depends on the exchange rate." },
            ].map((step, index) => <div key={step.title} className="flex items-start gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">{index + 1}</span><div className="min-w-0"><h2 className="text-sm font-semibold leading-6">{step.title}</h2><p className="text-xs leading-5 text-muted-foreground md:text-sm">{step.description}</p></div></div>)}
          </section>
          <form className="space-y-4 border-t border-border pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0 xl:pl-12" onSubmit={event => { event.preventDefault(); setNotice("Deposits are not connected yet. No payment has been taken and your balance has not changed."); }}>
            <div className="space-y-1.5"><label htmlFor="deposit-account" className="text-xs font-medium text-muted-foreground">Account <span className="text-destructive">*</span></label>
              <Select value="account"><SelectTrigger id="deposit-account" className="h-11 text-sm shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="account">My Account / {Number(profile.balance).toFixed(2)} USD</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-1.5"><label htmlFor="deposit-amount" className="text-xs font-medium text-muted-foreground">Amount <span className="text-destructive">*</span></label><div className="relative"><Input id="deposit-amount" required type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" value={amount} onChange={event => setAmount(event.target.value)} className="h-11 pr-16 text-base tabular-nums shadow-none md:text-base" /><span className="pointer-events-none absolute right-3 top-3 text-xs text-muted-foreground">USD</span></div></div>
            <div className="space-y-1.5"><label htmlFor="converted-amount" className="text-xs font-medium text-muted-foreground">Converted Amount</label><div className="flex h-11 items-center gap-2 rounded-md border border-input px-3 focus-within:ring-1 focus-within:ring-ring"><Input id="converted-amount" readOnly value={currency === "USD" && amount ? Number(amount).toFixed(2) : ""} placeholder={currency === "MMK" ? "Unavailable" : "0.00"} className="h-9 min-w-0 flex-1 border-0 px-0 text-base tabular-nums shadow-none focus-visible:ring-0 md:text-base" /><Select value={currency} onValueChange={setCurrency}><SelectTrigger aria-label="Payment currency" className="h-8 w-20 border-0 border-l border-border pl-3 pr-0 text-xs shadow-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MMK">MMK</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent></Select></div><p role="status" className="text-right text-[11px] leading-4 text-muted-foreground">{currency === "MMK" ? "MMK exchange rate is not connected yet." : "1 USD = 1 USD"}</p></div>
            <p className="flex items-start gap-2 text-xs leading-4 text-muted-foreground"><Info className="size-4 shrink-0" />Payment methods and deposit limits are not configured yet.</p>
            <Button type="submit" className="h-11 w-full text-sm font-semibold">Next</Button>
          </form>
        </div>
      </main>
    </div>
    <nav aria-label="Account navigation" className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t border-border bg-background md:hidden">
      {[{ icon: LayoutDashboard, label: "My Accounts", to: "/dashboard" }, { icon: ChartNoAxesCombined, label: "Market", to: "/quotes" }, { icon: CandlestickChart, label: "Trade", to: "/charts" }, { icon: User, label: "My profile", to: "/profile-settings" }].map(({ icon: Icon, label, to }) => <Button key={label} variant="ghost" size="icon" aria-label={label} onClick={() => navigate({ to })}><Icon className="size-5" /></Button>)}
      <Button variant="ghost" size="icon" aria-label="More" onClick={accounts}><Ellipsis className="size-5" /></Button>
    </nav>
    <Dialog open={!!notice} onOpenChange={open => { if (!open) setNotice(""); }}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>VW Markets</DialogTitle><DialogDescription>{notice}</DialogDescription></DialogHeader></DialogContent></Dialog>
  </div>;
}