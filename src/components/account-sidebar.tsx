import { useState } from "react";
import { CandlestickChart, Wallet, UsersRound, Megaphone, ChartNoAxesCombined, Bell, Download, CircleHelp, ChevronLeft, ChevronRight, Minus, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

function LogoMark({ className }: { className?: string }) {
  return <svg viewBox="0 0 64 64" className={className} aria-hidden="true"><path d="M50 18 C42 8 22 8 14 22 C6 36 16 54 32 54 C42 54 50 48 54 40 M18 34 L50 26" fill="none" stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" /><path d="M12 25 C15 12 32 5 45 12" fill="none" stroke="var(--brand-yellow)" strokeWidth="3" strokeLinecap="round" /></svg>;
}

export function AccountSidebar({ onSelect, userName, onLogout }: { onSelect: (name: string) => void; userName: string; onLogout: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [closed, setClosed] = useState<string[]>(["Fund Management", "Social Trading"]);
  const groups = [
    { name: "Trading", icon: CandlestickChart, items: ["My Accounts", "Trading Performance", "Trading Orders"] },
    { name: "Fund Management", icon: Wallet, items: ["Deposit", "Withdrawal", "Account Transfer"] },
    { name: "Social Trading", icon: UsersRound, items: ["Copy Trading", "PAMM"] },
  ];
  const standalone = [
    { name: "Promotions", icon: Megaphone },
    { name: "News", icon: ChartNoAxesCombined },
    { name: "Notifications", icon: Bell },
    { name: "Tools", icon: Download },
    { name: "Support", icon: CircleHelp },
  ];
  return <aside aria-label="Desktop account navigation" className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border/60 bg-background md:flex ${collapsed ? "w-20" : "w-[216px] xl:w-[280px] 2xl:w-[320px]"}`}>
    <div className={`flex h-[104px] shrink-0 items-center ${collapsed ? "justify-center" : "justify-between px-6"}`}>
      {!collapsed && <div className="flex min-w-0 items-center gap-2" aria-label="ETO Markets">
        <LogoMark className="size-12 shrink-0" />
        <span className="leading-none"><strong className="text-[30px] font-semibold">ETO</strong><span className="block text-base">Markets</span></span>
      </div>}
      <Button variant="ghost" size="icon" className="shrink-0 rounded-full bg-background shadow-sm" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <ChevronRight /> : <ChevronLeft />}</Button>
    </div>
    <nav className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
      {groups.map(({ name, icon: Icon, items }) => <div key={name} className="mb-2">
        <Button variant="ghost" className={`h-11 w-full justify-start gap-3 ${name === "Trading" ? "rounded-full bg-background text-primary shadow-sm" : "text-muted-foreground"} ${collapsed ? "px-0 justify-center" : "px-4"}`} aria-label={name} title={collapsed ? name : undefined} aria-expanded={!closed.includes(name)} onClick={() => setClosed(current => current.includes(name) ? current.filter(item => item !== name) : [...current, name])}>
          <Icon className="size-[18px] shrink-0" />{!collapsed && <><span className="min-w-0 flex-1 text-left text-sm">{name}</span>{closed.includes(name) ? <Plus className="size-3 shrink-0" /> : <Minus className="size-3 shrink-0" />}</>}
        </Button>
        {!collapsed && !closed.includes(name) && <div className="mt-1 space-y-1">{items.map(item => <Button key={item} variant="ghost" className={`h-10 w-full justify-start pl-11 text-sm font-normal ${item === "My Accounts" ? "text-primary" : "text-muted-foreground"}`} aria-current={item === "My Accounts" ? "page" : undefined} onClick={() => item === "My Accounts" ? window.scrollTo({ top: 0, behavior: "smooth" }) : onSelect(item)}>{item}</Button>)}</div>}
      </div>)}
      {standalone.map(({ name, icon: Icon }) => <Button key={name} variant="ghost" className={`mb-2 h-11 w-full gap-3 text-muted-foreground ${collapsed ? "justify-center px-0" : "justify-start px-4"}`} aria-label={name} title={collapsed ? name : undefined} onClick={() => onSelect(name)}><Icon className="size-[18px] shrink-0" />{!collapsed && <span className="text-sm font-normal">{name}</span>}</Button>)}
    </nav>
    <div className={`shrink-0 border-t border-border/60 px-4 py-4 ${collapsed ? "px-2" : "px-4"}`}>
      <div className={`flex items-center gap-2 ${collapsed ? "flex-col gap-3" : ""}`}>
        <LogoMark className="size-9 shrink-0" />
        {!collapsed && <span className="min-w-0 flex-1 truncate text-sm font-bold" title={userName}>{userName}</span>}
        <Button variant="ghost" size="icon" className={`shrink-0 rounded-full text-muted-foreground ${collapsed ? "" : "-mr-1"}`} aria-label="Sign out" title="Sign out" onClick={onLogout}><LogOut className="size-[18px]" /></Button>
      </div>
    </div>
  </aside>;
}
