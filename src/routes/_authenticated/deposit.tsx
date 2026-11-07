import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Headset, Info, LayoutDashboard, ChartNoAxesCombined, CandlestickChart, User, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AccountSidebar } from "@/components/account-sidebar";
import { AccountDisclaimer } from "@/components/account-disclaimer";
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
  return <div className="account-layout min-h-screen bg-background pb-24 md:pb-8">
    <AccountSidebar userName={name || String(profile.email)} onLogout={logout} onAccounts={accounts} onSelect={label => { if (label !== "Deposit") setNotice(`${label} services are not connected yet.`); }} />
    <div className="account-content md:ml-[216px] xl:ml-[280px] 2xl:ml-[320px]">
      <header className="px-5 pt-7 md:px-8 xl:px-12">
        <div className="flex items-center gap-3"><h1 className="flex-1 text-4xl font-medium">Funds</h1><Button variant="ghost" size="icon" aria-label="Back to My Accounts" onClick={accounts}><ArrowLeft /></Button></div>
        <nav aria-label="Funds sections" className="mt-5 flex gap-5 border-b border-border">
          {["Deposit", "Withdraw", "Transfer", "History"].map(tab => <Button key={tab} variant="ghost" aria-current={tab === "Deposit" ? "page" : undefined} className={`h-10 rounded-none border-b-2 px-0 text-sm font-normal hover:bg-transparent ${tab === "Deposit" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`} onClick={() => { if (tab !== "Deposit") setNotice(`${tab} services are not connected yet.`); }}>{tab}</Button>)}
        </nav>
      </header>
      <main className="px-5 md:px-8 xl:px-12">
        <div className="max-w-3xl">
          <section className="space-y-5 pt-10 text-base leading-7">
            <div><h2 className="text-xl font-medium">Step 1: Select Account</h2><p>Choose the trading account you want the deposit to be credited to.</p></div>
            <div><h2 className="text-xl font-medium">Step 2: Enter Deposit Amount (USD or USC)</h2><p>Enter the deposit amount in USD. For Cent Accounts, enter the amount in USC.</p></div>
            <div><h2 className="text-xl font-medium">Step 3: Choose Payment Currency</h2><p>Select the currency you want to pay with.</p><p>After selecting the currency, the system will display the corresponding payable amount.</p><p>If the payment amount is adjusted, the equivalent USD or USC amount will also update accordingly.</p></div>
          </section>
          <form className="mt-24 space-y-5 md:mt-16" onSubmit={event => { event.preventDefault(); setNotice("Deposits are not connected yet. No payment has been taken and your balance has not changed."); }}>
            <div className="space-y-2"><label htmlFor="deposit-account" className="text-base text-muted-foreground">Account <span className="text-destructive">*</span></label>
              <Select value="account"><SelectTrigger id="deposit-account" className="h-12 text-base"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="account">My Account / {Number(profile.balance).toFixed(2)} USD</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><label htmlFor="deposit-amount" className="text-base text-muted-foreground">Amount <span className="text-destructive">*</span></label><div className="relative"><Input id="deposit-amount" required type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0.00" value={amount} onChange={event => setAmount(event.target.value)} className="h-12 pr-16 text-xl md:text-xl" /><span className="pointer-events-none absolute right-4 top-3 text-muted-foreground">USD</span></div></div>
            <div className="space-y-2"><label htmlFor="converted-amount" className="text-base text-muted-foreground">Converted Amount</label><div className="flex h-12 items-center gap-2 rounded-md border border-input px-3"><Input id="converted-amount" readOnly value={currency === "USD" && amount ? Number(amount).toFixed(2) : ""} placeholder={currency === "MMK" ? "Unavailable" : "0.00"} className="h-10 min-w-0 flex-1 border-0 px-1 text-xl shadow-none md:text-xl" /><Select value={currency} onValueChange={setCurrency}><SelectTrigger aria-label="Payment currency" className="h-9 w-24 text-base"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MMK">MMK</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent></Select></div><p role="status" className="text-right text-sm text-muted-foreground">{currency === "MMK" ? "MMK exchange rate is not connected yet." : "1 USD = 1 USD"}</p></div>
            <p className="flex items-start gap-2 text-sm leading-5 text-muted-foreground"><Info className="mt-0.5 size-4 shrink-0" />Payment methods and deposit limits are not configured yet.</p>
            <Button type="submit" className="mt-4 h-12 w-full text-base">Next</Button>
          </form>
        </div>
        <AccountDisclaimer />
      </main>
    </div>
    <Button variant="secondary" size="icon" className="fixed bottom-24 right-5 z-20 size-12 rounded-full bg-foreground text-background hover:bg-foreground/90 md:bottom-8" aria-label="Support" onClick={() => setNotice("Support services are not connected yet.")}><Headset className="size-6" /></Button>
    <nav aria-label="Account navigation" className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t border-border bg-background md:hidden">
      {[{ icon: LayoutDashboard, label: "My Accounts", to: "/dashboard" }, { icon: ChartNoAxesCombined, label: "Market", to: "/quotes" }, { icon: CandlestickChart, label: "Trade", to: "/charts" }, { icon: User, label: "My profile", to: "/profile-settings" }].map(({ icon: Icon, label, to }) => <Button key={label} variant="ghost" size="icon" aria-label={label} onClick={() => navigate({ to })}><Icon className="size-5" /></Button>)}
      <Button variant="ghost" size="icon" aria-label="More" onClick={accounts}><Ellipsis className="size-5" /></Button>
    </nav>
    <Dialog open={!!notice} onOpenChange={open => { if (!open) setNotice(""); }}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>VW Markets</DialogTitle><DialogDescription>{notice}</DialogDescription></DialogHeader></DialogContent></Dialog>
  </div>;
}