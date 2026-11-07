import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Globe, UserRound, Plus, CirclePlus, Headset, LayoutDashboard, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountSidebar } from "@/components/account-sidebar";
import { AccountDisclaimer } from "@/components/account-disclaimer";
import { KycUploadDialog } from "@/components/kyc-upload-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getAccount } from "@/lib/account.functions";
import { getKyc } from "@/lib/kyc.functions";
import { supabase } from "@/integrations/supabase/client";

const accountQuery = queryOptions({ queryKey: ["my-account"], queryFn: () => getAccount() });
const kycQuery = queryOptions({ queryKey: ["my-kyc"], queryFn: () => getKyc() });
export const Route = createFileRoute("/_authenticated/profile-settings")({
  loader: async ({ context }) => { await Promise.all([context.queryClient.ensureQueryData(accountQuery), context.queryClient.ensureQueryData(kycQuery)]); },
  head: () => ({ meta: [{ title: "Profile Settings & Verification — VW Markets" }, { name: "description", content: "Your VW Markets identity verification and document submission status." }, { property: "og:title", content: "Profile Settings & Verification — VW Markets" }, { property: "og:description", content: "Manage your VW Markets identity verification documents." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ProfileSettings,
});

function ProfileSettings() {
  const { data: { profile } } = useSuspenseQuery(accountQuery);
  const { data: submission } = useSuspenseQuery(kycQuery);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [upload, setUpload] = useState(false);
  const [tab, setTab] = useState("KYC");
  const [notice, setNotice] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const name = [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ");
  const accounts = () => { void navigate({ to: "/dashboard" }); };
  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) { setNotice("Unable to sign out. Please try again."); return; }
    await queryClient.cancelQueries(); queryClient.clear(); await navigate({ to: "/", replace: true });
  }
  async function resetPassword() {
    if (!profile.email) return;
    setResetBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, { redirectTo: `${window.location.origin}/reset-password` });
    setNotice(error ? "Unable to send the reset email. Please try again." : "Password reset email sent."); setResetBusy(false);
  }
  return <div className="account-layout min-h-screen bg-account-background pb-24 md:pb-8">
    <AccountSidebar userName={name || String(profile.email)} onLogout={logout} onAccounts={accounts} onSelect={label => { if (label === "Deposit") { void navigate({ to: "/deposit" }); return; } setNotice(`${label} services are not connected yet.`); }} />
    <div className="account-content md:ml-[216px] xl:ml-[280px] 2xl:ml-[320px]">
      <header className="border-b border-border bg-background"><div className="flex h-[74px] items-center justify-between gap-2 px-5 md:h-20 md:px-8 xl:px-12 2xl:px-[72px]"><h1 className="text-lg font-bold md:text-2xl">Profile Settings</h1><div className="flex shrink-0 gap-1"><Button variant="ghost" size="icon" aria-label="Language" onClick={() => setNotice("English")}><Globe /></Button><Button variant="ghost" size="icon" aria-label="My profile" onClick={() => setTab("Personal Details")}><UserRound /></Button><Button size="icon" className="size-9 rounded-full" aria-label="Add account" onClick={() => setNotice("Trading accounts are not connected yet.")}><Plus /></Button></div></div></header>
      <main className="px-5 pt-8 md:px-8 xl:px-12 2xl:px-[72px]">
        <div className="grid gap-7 md:min-h-[410px] md:grid-cols-[minmax(160px,0.8fr)_minmax(0,2.6fr)] xl:gap-12">
          <aside className="min-w-0"><h2 className="break-words text-xl font-bold xl:text-2xl">{name}</h2><p className="mt-1 break-all text-sm text-muted-foreground">{profile.email}</p><div className="mt-6 divide-y divide-dashed divide-border text-sm"><div className="pb-4"><strong className="break-all">{profile.invite_code}</strong><p className="mt-1 text-muted-foreground">Customer</p></div><div className="py-4"><strong>Active</strong><p className="mt-1 text-muted-foreground">Status</p></div><div className="py-4"><strong>Trader</strong><p className="mt-1 text-muted-foreground">Customer Type</p></div></div></aside>
          <div className="min-w-0"><nav aria-label="Profile settings" className="mb-6 flex flex-wrap items-center justify-between gap-2">{["Personal Details", "Contact Information", "KYC", "Security", "Two-Factor Auth", "Address Book"].map(label => <Button key={label} variant={tab === label ? "secondary" : "ghost"} className={`h-9 rounded-full px-3 text-xs font-bold ${tab === label ? "bg-foreground text-background hover:bg-foreground/90" : ""}`} onClick={() => setTab(label)}>{label}</Button>)}</nav>
            <section className="overflow-hidden rounded-[20px] border border-border/40 bg-background"><h2 className="border-b border-border px-5 py-5 text-lg font-bold">{tab === "KYC" ? "Know Your Customer" : tab}</h2><div className="px-5 py-5">
              {tab === "KYC" ? <><h3 className="text-xl font-bold">{!submission ? "Verification Required" : submission.status === "pending" ? "Verification Pending" : submission.status === "approved" ? "Identity Verified" : "Verification Rejected"}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{!submission ? "To complete your account setup, please upload your proof of identity and address." : submission.status === "pending" ? "Your documents have been submitted and are awaiting review." : submission.status === "approved" ? "Your identity verification is complete." : "Your documents were not approved. Please contact support."}</p>{!submission && <Button className="mt-4 h-10 w-full rounded-full font-bold sm:max-w-[305px]" onClick={() => setUpload(true)}><CirclePlus className="size-4" />Upload Documents</Button>}{submission && <p className="mt-4 text-xs text-muted-foreground">Submitted: {new Date(submission.created_at).toLocaleDateString()}</p>}</> : tab === "Personal Details" ? <dl className="space-y-3 text-sm"><div><dt className="text-muted-foreground">Full name</dt><dd>{name || "—"}</dd></div><div><dt className="text-muted-foreground">Country / Region</dt><dd>{profile.country || "—"}</dd></div></dl> : tab === "Contact Information" ? <dl className="space-y-3 text-sm"><div><dt className="text-muted-foreground">Email</dt><dd className="break-all">{profile.email}</dd></div><div><dt className="text-muted-foreground">Phone number</dt><dd>{profile.phone || "—"}</dd></div></dl> : tab === "Security" ? <Button variant="outline" disabled={resetBusy} onClick={resetPassword}>{resetBusy ? "Sending…" : "Reset Password"}</Button> : <p className="text-sm text-muted-foreground">{tab === "Address Book" ? "No saved addresses." : "Two-factor authentication is not configured."}</p>}
            </div></section>
          </div>
        </div>
        <AccountDisclaimer />
      </main>
    </div>
    <Button className="fixed bottom-24 right-5 z-20 size-12 rounded-full shadow-lg md:bottom-8 md:right-6 md:size-14" aria-label="Support" onClick={() => setNotice("Support services are not connected yet.")}><Headset /></Button>
    <nav aria-label="Account navigation" className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t border-border bg-background md:hidden"><Button variant="ghost" size="icon" aria-label="My Accounts" onClick={accounts}><LayoutDashboard /></Button><Button variant="ghost" size="icon" aria-label="Back to accounts" onClick={accounts}><ArrowLeft /></Button><Button variant="ghost" size="icon" aria-label="My profile" className="text-primary" onClick={() => setTab("KYC")}><User /></Button></nav>
    <KycUploadDialog open={upload} onOpenChange={setUpload} onSubmitted={async () => { await queryClient.invalidateQueries({ queryKey: ["my-kyc"] }); }} />
    <Dialog open={!!notice} onOpenChange={value => { if (!value) setNotice(""); }}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>VW Markets</DialogTitle><DialogDescription>{notice}</DialogDescription></DialogHeader></DialogContent></Dialog>
  </div>;
}