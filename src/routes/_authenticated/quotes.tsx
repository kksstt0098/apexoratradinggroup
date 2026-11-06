import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, ChevronDown, ChevronUp, LayoutDashboard, CandlestickChart, ChartNoAxesCombined, User, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { filterQuotes } from "@/lib/market-quotes";
import { getLiveQuotes } from "@/lib/market-quotes.functions";
import { quoteStatus } from "@/lib/live-quote-validation";

const liveQuotesQuery = queryOptions({ queryKey: ["live-market-quotes"], queryFn: () => getLiveQuotes(), staleTime: 10_000, refetchInterval: 10_000, retry: 1 });

export const Route = createFileRoute("/_authenticated/quotes")({
  loader: ({ context }) => context.queryClient.ensureQueryData(liveQuotesQuery),
  head: () => ({ meta: [
    { title: "Market Quotes — VW Markets" },
    { name: "description", content: "Forex major pairs, gold and silver with current Swissquote broker prices." },
    { property: "og:title", content: "Market Quotes — VW Markets" },
    { property: "og:description", content: "Browse current Forex major pairs, XAUUSD gold and XAGUSD silver broker quotes." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Quotes,
});

function Quotes() {
  const { data, error: feedError } = useSuspenseQuery(liveQuotesQuery);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("All");
  const [expanded, setExpanded] = useState("");
  const quotes = filterQuotes(search, group).map(instrument => ({ ...instrument, ...data.quotes.find(item => item.symbol === instrument.symbol) }));
  const available = data.quotes.filter(item => item.timestamp !== null);
  const status = available.length === 0 ? "Unavailable" : available.every(item => item.timestamp !== null && quoteStatus(item.timestamp, data.checkedAt) === "Live") ? "Live" : available.some(item => item.timestamp !== null && quoteStatus(item.timestamp, data.checkedAt) === "Market closed") ? "Market closed" : "Delayed";
  return <div className="min-h-screen bg-background pb-24 text-foreground">
    <header className="border-b border-border">
      <div className="mx-auto flex h-[74px] max-w-5xl items-center gap-3 px-4 md:px-8">
        <Button variant="ghost" size="icon" aria-label="Back to My Accounts" title="Back to My Accounts" onClick={() => navigate({ to: "/dashboard" })}><ArrowLeft /></Button>
        <h1 className="text-xl font-bold">Quotes</h1>
        <span className="ml-auto text-xs font-medium text-muted-foreground">VW Markets</span>
      </div>
    </header>
    <main className="mx-auto max-w-5xl md:px-8">
      <div className="space-y-4 px-4 py-5 md:px-0">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><span>{data.source}</span><span role="status" className="rounded border border-border px-2 py-1">{feedError ? "Connection lost" : status} · 10s refresh</span></div>
        {feedError && <p role="alert" className="text-xs text-destructive">Price connection lost. Displayed quotes are the last received values.</p>}
        <label className="flex h-11 items-center gap-3 rounded-md border border-input bg-background px-3"><Search className="size-4 shrink-0 text-muted-foreground" /><input aria-label="Search symbols" placeholder="Search symbols" value={search} onChange={event => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
        <div className="flex gap-2" role="group" aria-label="Instrument category">{["All", "Forex", "Metals"].map(category => <Button key={category} variant={group === category ? "default" : "ghost"} size="sm" aria-pressed={group === category} onClick={() => setGroup(category)}>{category}</Button>)}</div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_16px] gap-2 border-y border-border bg-muted px-4 py-2 text-xs text-muted-foreground md:px-5"><span>Symbol</span><span className="text-right">Bid</span><span className="text-right">Ask</span><span /></div>
      <div>{quotes.map(quote => <div key={quote.symbol} className="border-b border-border">
        <Button variant="ghost" aria-label={`${quote.symbol} details`} aria-expanded={expanded === quote.symbol} className="grid h-auto min-h-[88px] w-full grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_16px] gap-2 rounded-none px-4 py-4 text-left md:px-5" onClick={() => setExpanded(current => current === quote.symbol ? "" : quote.symbol)}>
          <span className="min-w-0"><strong className="block text-base">{quote.symbol}</strong><span className="mt-1 block whitespace-normal text-[10px] font-normal leading-4 text-muted-foreground md:text-xs">{quote.name}</span></span>
          <span className="text-right font-mono text-base font-semibold tabular-nums text-quote-bid md:text-xl">{quote.bid?.toFixed(quote.digits) ?? "—"}</span>
          <span className="text-right font-mono text-base font-semibold tabular-nums text-quote-ask md:text-xl">{quote.ask?.toFixed(quote.digits) ?? "—"}</span>
          {expanded === quote.symbol ? <ChevronUp /> : <ChevronDown />}
        </Button>
        {expanded === quote.symbol && <dl className="grid grid-cols-2 gap-3 bg-muted px-4 py-4 text-xs md:grid-cols-4 md:px-5"><div><dt className="text-muted-foreground">Spread (points)</dt><dd className="mt-1 font-semibold">{quote.ask != null && quote.bid != null ? Math.round((quote.ask - quote.bid) * 10 ** quote.digits) : "—"}</dd></div><div><dt className="text-muted-foreground">Quote time (UTC)</dt><dd className="mt-1 font-semibold">{quote.timestamp ? new Date(quote.timestamp).toISOString().replace("T", " ").slice(0, 19) : "—"}</dd></div><div><dt className="text-muted-foreground">Status</dt><dd className="mt-1 font-semibold">{quote.timestamp ? quoteStatus(quote.timestamp, data.checkedAt) : "Unavailable"}</dd></div><div><dt className="text-muted-foreground">Category</dt><dd className="mt-1 font-semibold">{quote.group}</dd></div></dl>}
      </div>)}</div>
      {quotes.length === 0 && <p role="status" className="px-4 py-12 text-center text-sm text-muted-foreground">No symbols found</p>}
    </main>
    <nav aria-label="Account navigation" className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background md:hidden"><div className="mx-auto flex h-16 max-w-5xl items-center justify-around">{[{ icon: LayoutDashboard, name: "My Accounts" }, { icon: ChartNoAxesCombined, name: "Funds" }, { icon: CandlestickChart, name: "Downloads" }, { icon: User, name: "My profile" }, { icon: Ellipsis, name: "More" }].map(({ icon: Icon, name }) => <Button key={name} variant="ghost" size="icon" aria-label={name} aria-current={name === "Funds" ? "page" : undefined} className={name === "Funds" ? "text-primary" : "text-foreground"} onClick={() => { if (name === "Funds") return; navigate({ to: name === "Downloads" ? "/charts" : name === "My profile" ? "/profile-settings" : "/dashboard" }); }}><Icon className="size-5" /></Button>)}</div></nav>
  </div>;
}