import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, LayoutDashboard, CircleDollarSign, Download, User, Ellipsis } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { marketQuotes } from "@/lib/market-quotes";
import { getLiveQuotes } from "@/lib/market-quotes.functions";

const liveQuotesQuery = queryOptions({ queryKey: ["live-market-quotes"], queryFn: () => getLiveQuotes(), staleTime: 10_000, refetchInterval: 10_000, retry: 1 });

export const Route = createFileRoute("/_authenticated/charts")({
  loader: ({ context }) => context.queryClient.ensureQueryData(liveQuotesQuery),
  head: () => ({ meta: [
    { title: "Charts — VW Markets" },
    { name: "description", content: "Live price charts for Forex majors, gold and silver." },
    { property: "og:title", content: "Charts — VW Markets" },
    { property: "og:description", content: "Follow live Forex, gold and silver price movement." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Charts,
});

type Point = { time: number; bid: number };

function Charts() {
  const { data } = useSuspenseQuery(liveQuotesQuery);
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState<string>("XAUUSD");
  const [history, setHistory] = useState<Record<string, Point[]>>({});
  useEffect(() => {
    setHistory(current => {
      const next = { ...current };
      for (const q of data.quotes) {
        if (q.bid == null || q.timestamp == null) continue;
        const list = next[q.symbol] ?? [];
        if (list.at(-1)?.time === q.timestamp) continue;
        next[q.symbol] = [...list, { time: q.timestamp, bid: q.bid }].slice(-200);
      }
      return next;
    });
  }, [data]);
  const instrument = marketQuotes.find(item => item.symbol === symbol)!;
  const quote = data.quotes.find(item => item.symbol === symbol);
  const points = history[symbol] ?? [];
  const fmt = (n: number | null | undefined) => n == null ? "—" : n.toFixed(instrument.digits);
  return <div className="flex min-h-screen flex-col bg-background pb-20 text-foreground">
    <header className="border-b border-border">
      <div className="mx-auto flex h-[64px] max-w-5xl items-center gap-3 px-4">
        <Button variant="ghost" size="icon" aria-label="Back to My Accounts" onClick={() => navigate({ to: "/dashboard" })}><ArrowLeft /></Button>
        <h1 className="text-xl font-bold">Charts</h1>
        <span className="ml-auto text-xs text-muted-foreground">{data.source}</span>
      </div>
    </header>
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
      <div className="flex gap-2 overflow-x-auto px-4 py-3" role="group" aria-label="Symbol">{marketQuotes.map(item => <Button key={item.symbol} size="sm" variant={symbol === item.symbol ? "default" : "outline"} aria-pressed={symbol === item.symbol} className="shrink-0" onClick={() => setSymbol(item.symbol)}>{item.symbol}</Button>)}</div>
      <div className="px-4"><p className="text-sm text-muted-foreground">{instrument.name}</p><p className="font-mono text-2xl font-bold tabular-nums">{fmt(quote?.bid)}</p></div>
      <div className="mt-2 h-[52vh] min-h-[260px] px-1">
        {points.length < 2 ? <p role="status" className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">Collecting live prices… The chart builds from real quotes received every 10 seconds while this page is open.</p> :
        <ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
          <XAxis dataKey="time" type="number" domain={["dataMin", "dataMax"]} tickFormatter={t => new Date(t).toISOString().slice(11, 19)} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis domain={["auto", "auto"]} orientation="right" width={64} tickFormatter={v => Number(v).toFixed(instrument.digits)} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip labelFormatter={t => new Date(Number(t)).toISOString().replace("T", " ").slice(0, 19) + " UTC"} formatter={v => [Number(v).toFixed(instrument.digits), "Bid"]} />
          <Line type="monotone" dataKey="bid" stroke="var(--primary)" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart></ResponsiveContainer>}
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 py-4">
        <Button variant="destructive" className="h-14 flex-col gap-0 rounded-lg text-base font-bold" aria-label="Sell"><span>Sell</span><span className="font-mono text-xs font-normal tabular-nums">{fmt(quote?.bid)}</span></Button>
        <Button className="h-14 flex-col gap-0 rounded-lg text-base font-bold" aria-label="Buy"><span>Buy</span><span className="font-mono text-xs font-normal tabular-nums">{fmt(quote?.ask)}</span></Button>
      </div>
    </main>
    <nav aria-label="Account navigation" className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background md:hidden"><div className="mx-auto flex h-16 max-w-5xl items-center justify-around">{[{ icon: LayoutDashboard, name: "My Accounts" }, { icon: CircleDollarSign, name: "Funds" }, { icon: Download, name: "Downloads" }, { icon: User, name: "My profile" }, { icon: Ellipsis, name: "More" }].map(({ icon: Icon, name }) => <Button key={name} variant="ghost" size="icon" aria-label={name} aria-current={name === "Downloads" ? "page" : undefined} className={name === "Downloads" ? "text-primary" : "text-foreground"} onClick={() => { if (name === "Downloads") return; navigate({ to: name === "Funds" ? "/quotes" : name === "My profile" ? "/profile-settings" : "/dashboard" }); }}><Icon className="size-5" /></Button>)}</div></nav>
  </div>;
}
