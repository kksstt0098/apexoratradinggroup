import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, Star, Ellipsis, LayoutGrid, CircleDollarSign, LineChart as LineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CandleChart, type Indicator } from "@/components/candle-chart";
import { marketQuotes } from "@/lib/market-quotes";
import { getChartData } from "@/lib/chart-data.functions";
import { cn } from "@/lib/utils";
import { OrderSheet, type Side } from "@/components/order-sheet";

type Interval = "15m" | "1h" | "4h" | "1d";
const chartQuery = (symbol: string, interval: Interval) => queryOptions({
  queryKey: ["chart", symbol, interval], queryFn: () => getChartData({ data: { symbol, interval } }), refetchInterval: 10_000, retry: 1,
});

export const Route = createFileRoute("/_authenticated/charts")({
  loader: ({ context }) => context.queryClient.prefetchQuery(chartQuery("XAUUSD", "4h")),
  head: () => ({ meta: [
    { title: "Charts — VW Markets" },
    { name: "description", content: "Live candlestick charts, order book and trades for Forex majors, gold and silver." },
    { property: "og:title", content: "Charts — VW Markets" },
    { property: "og:description", content: "Follow live Forex, gold and silver candlestick charts." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Charts,
});

const tabs = ["Price", "Info", "Data"] as const;
const intervals: Interval[] = ["15m", "1h", "4h", "1d"];
const indicatorList: Indicator[] = ["MA", "EMA", "BOLL", "VWAP", "VOL"];
const perfLabels = ["7 Days", "30 Days", "90 Days", "180 Days", "1 Year"];

function Pct({ v }: { v: number | null | undefined }) {
  if (v == null || !Number.isFinite(v)) return <span className="text-muted-foreground">--</span>;
  return <span className={v >= 0 ? "text-market-up" : "text-market-down"}>{v >= 0 ? "+" : ""}{v.toFixed(2)}%</span>;
}

function Charts() {
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState("XAUUSD");
  const [interval, setInterval] = useState<Interval>("4h");
  const [tab, setTab] = useState<(typeof tabs)[number]>("Price");
  const [bookTab, setBookTab] = useState<"Order Book" | "Trades">("Order Book");
  const [indicators, setIndicators] = useState<Indicator[]>(["VOL"]);
  const [orderSide, setOrderSide] = useState<Side | null>(null);
  const [lastSide, setLastSide] = useState<Side>("long");
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => { try { setFavorites(JSON.parse(localStorage.getItem("vw-favorites") ?? "[]")); } catch { /* ignore */ } }, []);
  const toggleFav = () => setFavorites(f => { const n = f.includes(symbol) ? f.filter(s => s !== symbol) : [...f, symbol]; localStorage.setItem("vw-favorites", JSON.stringify(n)); return n; });

  const { data, isPending, isError } = useQuery(chartQuery(symbol, interval));
  const instrument = marketQuotes.find(q => q.symbol === symbol) ?? marketQuotes[0];
  const d = instrument.digits;
  const fmt = (n: number | null | undefined, digits = d) => n == null || !Number.isFinite(n) ? "--" : n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const compact = (n: number | null | undefined) => n == null ? "--" : Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);
  const s = data?.stats;
  const bidQty = data?.book.bids.reduce((a, b) => a + (b.qty ?? 0), 0) ?? 0;
  const askQty = data?.book.asks.reduce((a, b) => a + (b.qty ?? 0), 0) ?? 0;
  const bidPct = bidQty + askQty > 0 ? (bidQty / (bidQty + askQty)) * 100 : null;

  return <div className="flex min-h-screen flex-col bg-background pb-20 text-foreground">
    <header className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-2">
      <Button variant="ghost" size="icon" aria-label="Back to My Accounts" onClick={() => navigate({ to: "/dashboard" })}><ArrowLeft className="size-5" /></Button>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex min-w-0 items-center gap-1.5 text-lg font-bold">
          <span className="truncate">{data?.displaySymbol ?? symbol}</span>
          {data?.perp && <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-normal">Perp</span>}
          <ChevronDown className="size-4 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">{marketQuotes.map(q => <DropdownMenuItem key={q.symbol} onClick={() => setSymbol(q.symbol)}>{q.symbol}<span className="ml-2 text-xs text-muted-foreground">{q.name}</span></DropdownMenuItem>)}</DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="icon" className="ml-auto" aria-label="Favorite" aria-pressed={favorites.includes(symbol)} onClick={toggleFav}><Star className={cn("size-5", favorites.includes(symbol) && "fill-anniversary text-anniversary")} /></Button>
    </header>
    <nav className="mx-auto flex w-full max-w-5xl gap-6 border-b border-border px-4" aria-label="Chart sections">
      {tabs.map(t => <button key={t} onClick={() => setTab(t)} aria-current={tab === t ? "page" : undefined} className={cn("relative pb-2 text-[15px]", tab === t ? "font-semibold" : "text-muted-foreground")}>{t}{tab === t && <span className="absolute inset-x-1/4 bottom-0 h-[3px] rounded bg-anniversary" />}</button>)}
    </nav>

    <main className="mx-auto w-full max-w-5xl flex-1">
      {isPending ? <p role="status" className="p-8 text-center text-sm text-muted-foreground">Loading live market data…</p> :
       isError && !data ? <p role="alert" className="p-8 text-center text-sm text-destructive">Market data is unavailable right now. Retrying…</p> : data && s && <>
      {data.notice && <p role="status" className="border-b border-border px-4 py-2 text-xs text-muted-foreground">{data.notice} · {new Date(s.updatedAt).toLocaleString()}</p>}
      {tab === "Price" && <>
        <section className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Last Price</p>
            <p className={cn("truncate font-mono text-3xl font-bold tabular-nums", (s.changePct ?? 0) >= 0 ? "text-market-up" : "text-market-down")}>{fmt(s.last)}</p>
            <p className="text-sm tabular-nums">{fmt(s.last)} $ <Pct v={s.changePct} /></p>
            {s.mark != null && <p className="text-xs">Mark Price <span className="tabular-nums">{fmt(s.mark)}</span></p>}
          </div>
          <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-xs">
            <dt className="text-muted-foreground">24h High</dt><dd className="text-right tabular-nums">{fmt(s.high)}</dd>
            <dt className="text-muted-foreground">24h Low</dt><dd className="text-right tabular-nums">{fmt(s.low)}</dd>
            {s.volBase != null && <><dt className="text-muted-foreground">24h Vol({symbol.slice(0, 3)})</dt><dd className="text-right tabular-nums">{fmt(s.volBase, 3)}</dd>
            <dt className="text-muted-foreground">24h Vol(USDT)</dt><dd className="text-right tabular-nums">{compact(s.volQuote)}</dd></>}
          </dl>
        </section>
        <div className="flex gap-1 border-y border-border px-2 py-1.5 text-sm" role="group" aria-label="Interval">
          {intervals.map(i => <button key={i} aria-pressed={interval === i} onClick={() => setInterval(i)} className={cn("rounded px-3 py-1", interval === i ? "bg-muted font-semibold" : "text-muted-foreground")}>{i}</button>)}
        </div>
        <div className="h-[46vh] min-h-[280px] md:h-[480px]"><CandleChart candles={data.candles} digits={d} indicators={indicators} /></div>
        <div className="flex gap-1 overflow-x-auto border-y border-border px-2 py-1.5 text-sm" role="group" aria-label="Indicators">
          {indicatorList.map(i => <button key={i} aria-pressed={indicators.includes(i)} onClick={() => setIndicators(c => c.includes(i) ? c.filter(x => x !== i) : [...c, i])} className={cn("shrink-0 rounded px-3 py-1", indicators.includes(i) ? "font-semibold text-anniversary" : "text-muted-foreground")}>{i}</button>)}
        </div>
        <div className="grid grid-cols-3 gap-y-2 px-4 py-3 text-xs sm:grid-cols-6">
          <div><p className="text-muted-foreground">Today</p><Pct v={s.changePct} /></div>
          {perfLabels.map((l, i) => <div key={l}><p className="text-muted-foreground">{l}</p><Pct v={data.performance[i]} /></div>)}
        </div>
        <div className="flex gap-2 px-4 pt-2">
          {(["Order Book", "Trades"] as const).map(t => <button key={t} onClick={() => setBookTab(t)} className={cn("rounded px-3 py-1.5 text-sm", bookTab === t ? "bg-muted font-semibold" : "text-muted-foreground")}>{t}</button>)}
        </div>
        {bookTab === "Order Book" ? <section className="px-4 py-3 text-xs">
          {bidPct != null && <div className="mb-3 flex items-center gap-2 tabular-nums"><span className="text-market-up">{bidPct.toFixed(2)}%</span><div className="flex h-1.5 flex-1 gap-0.5"><div className="rounded bg-market-up" style={{ width: `${bidPct}%` }} /><div className="flex-1 rounded bg-market-down" /></div><span className="text-market-down">{(100 - bidPct).toFixed(2)}%</span></div>}
          <div className="grid grid-cols-4 pb-1 text-muted-foreground"><span>Qty</span><span className="text-right">Bid</span><span className="pl-2">Ask</span><span className="text-right">Qty</span></div>
          {data.book.bids.length === 0 ? <p className="py-4 text-center text-muted-foreground">No live book available.</p> :
          data.book.bids.slice(0, 12).map((b, i) => { const a = data.book.asks[i]; return <div key={i} className="grid grid-cols-4 py-0.5 font-mono tabular-nums">
            <span>{b.qty == null ? "--" : fmt(b.qty, 3)}</span><span className="text-right text-market-up">{fmt(b.price)}</span><span className="pl-2 text-market-down">{fmt(a?.price)}</span><span className="text-right">{a?.qty == null ? "--" : fmt(a.qty, 3)}</span></div>; })}
          {!data.perp && instrument.group === "Forex" && <p className="pt-2 text-muted-foreground">Forex shows Swissquote best bid/ask only; market depth isn't published.</p>}
        </section> : <section className="px-4 py-3 text-xs">
          {data.trades.length === 0 ? <p className="py-4 text-center text-muted-foreground">Public trade prints aren't available for this instrument.</p> : <>
          <div className="grid grid-cols-3 pb-1 text-muted-foreground"><span>Time</span><span className="text-right">Price</span><span className="text-right">Qty</span></div>
          {data.trades.map(t => <div key={t.id} className="grid grid-cols-3 py-0.5 font-mono tabular-nums"><span>{new Date(t.time).toLocaleTimeString()}</span><span className={cn("text-right", t.side === "buy" ? "text-market-up" : "text-market-down")}>{fmt(t.price)}</span><span className="text-right">{fmt(t.qty, 3)}</span></div>)}</>}
        </section>}
      </>}
      {tab === "Info" && <dl className="grid grid-cols-2 gap-3 p-4 text-sm">
        <dt className="text-muted-foreground">Instrument</dt><dd>{instrument.name}</dd>
        <dt className="text-muted-foreground">Category</dt><dd>{instrument.group}</dd>
        <dt className="text-muted-foreground">Price digits</dt><dd>{d}</dd>
        <dt className="text-muted-foreground">Data source</dt><dd>{data.source}</dd>
      </dl>}
      {tab === "Data" && <dl className="grid grid-cols-2 gap-3 p-4 text-sm tabular-nums">
        <dt className="text-muted-foreground">Last price</dt><dd>{fmt(s.last)}</dd>
        <dt className="text-muted-foreground">24h change</dt><dd><Pct v={s.changePct} /></dd>
        <dt className="text-muted-foreground">24h high / low</dt><dd>{fmt(s.high)} / {fmt(s.low)}</dd>
        {s.mark != null && <><dt className="text-muted-foreground">Mark price</dt><dd>{fmt(s.mark)}</dd></>}
        <dt className="text-muted-foreground">Updated</dt><dd>{new Date(s.updatedAt).toLocaleString()}</dd>
      </dl>}
      </>}
    </main>

    <nav aria-label="Chart actions" className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background">
      <div className="mx-auto flex h-[68px] max-w-5xl items-center gap-2 px-2">
        {[{ icon: Ellipsis, name: "More", to: "/dashboard" as const }, { icon: LayoutGrid, name: "Hub", to: "/quotes" as const }, { icon: CircleDollarSign, name: "Spot", to: "/quotes" as const }].map(({ icon: Icon, name, to }) =>
          <button key={name} onClick={() => navigate({ to })} className="flex w-12 shrink-0 flex-col items-center text-[11px]"><Icon className="size-5" />{name}</button>)}
        <Button className="h-12 flex-1 rounded-lg bg-market-up text-base font-semibold text-primary-foreground hover:bg-market-up/90" aria-label="Long" onClick={() => { setLastSide("long"); setOrderSide("long"); }}>Long</Button>
        <Button className="h-12 flex-1 rounded-lg bg-market-down text-base font-semibold text-primary-foreground hover:bg-market-down/90" aria-label="Short" onClick={() => { setLastSide("short"); setOrderSide("short"); }}>Short</Button>
      </div>
    </nav>
    <OrderSheet open={orderSide != null} onOpenChange={o => !o && setOrderSide(null)} side={orderSide ?? lastSide} onSideChange={x => { setLastSide(x); setOrderSide(x); }} symbol={data?.displaySymbol ?? symbol} price={data?.stats.last} digits={d} />
    <span className="sr-only"><LineIcon /></span>
  </div>;
}
