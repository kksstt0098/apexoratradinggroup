import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { marketQuotes } from "./market-quotes";
import { aggregateCandles, periodChange, type Candle } from "./chart-math";
import { parseLiveQuote } from "./live-quote-validation";

const input = z.object({
  symbol: z.enum(marketQuotes.map(q => q.symbol) as [string, ...string[]]),
  interval: z.enum(["15m", "1h", "4h", "1d"]),
});

const binanceSymbols: Record<string, string> = { XAUUSD: "XAUUSDT", XAGUSD: "XAGUSDT" };
const metalFutures: Record<string, string> = { XAUUSD: "GC=F", XAGUSD: "SI=F" };

async function getJson(url: string) {
  const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) { console.error(`Market data [${res.status}] ${url}: ${(await res.text()).slice(0, 300)}`); throw new Error(`Market data unavailable (${res.status})`); }
  return res.json();
}

const binanceCandles = (rows: unknown[][]): Candle[] => rows.map(r => ({ time: Number(r[0]) / 1000, open: Number(r[1]), high: Number(r[2]), low: Number(r[3]), close: Number(r[4]), volume: Number(r[5]) }));

async function yahooCandles(symbol: string, interval: string, range: string): Promise<{ candles: Candle[]; meta: { regularMarketPrice: number; chartPreviousClose?: number; regularMarketDayHigh: number; regularMarketDayLow: number; regularMarketTime: number } }> {
  let data;
  try {
    data = await getJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`);
  } catch {
    data = await getJson(`https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`);
  }
  const r = data?.chart?.result?.[0]; const q = r?.indicators?.quote?.[0];
  if (!r?.timestamp || !q) throw new Error("Historical chart unavailable");
  const candles: Candle[] = [];
  (r.timestamp as number[]).forEach((t, i) => {
    if ([q.open[i], q.high[i], q.low[i], q.close[i]].some(v => v == null || !Number.isFinite(v))) return;
    candles.push({ time: t, open: q.open[i], high: q.high[i], low: q.low[i], close: q.close[i], volume: q.volume[i] ?? 0 });
  });
  if (!candles.length) throw new Error("Historical chart unavailable");
  return { candles, meta: r.meta };
}

export const getChartData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => input.parse(data))
  .handler(async ({ data }) => {
    const pair = binanceSymbols[data.symbol];
    if (pair) {
      try {
      const base = "https://fapi.binance.com/fapi/v1";
      const [k, daily, t, d, trades, mark] = await Promise.all([
        getJson(`${base}/klines?symbol=${pair}&interval=${data.interval}&limit=300`),
        getJson(`${base}/klines?symbol=${pair}&interval=1d&limit=400`).catch(() => []),
        getJson(`${base}/ticker/24hr?symbol=${pair}`).catch(() => null),
        getJson(`${base}/depth?symbol=${pair}&limit=20`).catch(() => ({ bids: [], asks: [] })),
        getJson(`${base}/trades?symbol=${pair}&limit=20`).catch(() => []),
        getJson(`${base}/premiumIndex?symbol=${pair}`).catch(() => null),
      ]);
      const candles = binanceCandles(k);
      const latest = candles.at(-1);
      if (!latest) throw new Error("Historical chart unavailable");
      const dailyCandles = binanceCandles(daily);
      return {
        source: `Binance Futures · ${pair} Perp`, displaySymbol: pair, perp: true,
        candles, notice: t ? null : "Ticker unavailable · last candle close",
        stats: { last: t ? Number(t.lastPrice) : latest.close, changePct: t ? Number(t.priceChangePercent) : null, high: t ? Number(t.highPrice) : null, low: t ? Number(t.lowPrice) : null, volBase: t ? Number(t.volume) : null, volQuote: t ? Number(t.quoteVolume) : null, mark: mark ? Number(mark.markPrice) : null, updatedAt: t ? Number(t.closeTime) : Math.min(Date.now(), Number(k.at(-1)?.[6]) || latest.time * 1000) },
        performance: [7, 30, 90, 180, 365].map(days => periodChange(dailyCandles, days)),
        book: { bids: (d.bids as string[][]).map(([p, q]) => ({ price: Number(p), qty: Number(q) as number | null })), asks: (d.asks as string[][]).map(([p, q]) => ({ price: Number(p), qty: Number(q) as number | null })) },
        trades: (trades as { id: number; price: string; qty: string; time: number; isBuyerMaker: boolean }[]).reverse().map(x => ({ id: x.id, price: +x.price, qty: +x.qty, time: x.time, side: x.isBuyerMaker ? "sell" as const : "buy" as const })),
      };
      } catch (error) {
        console.warn(`Metal chart primary source unavailable for ${data.symbol}; using COMEX futures`, error);
      }
    }
    const yInterval = data.interval === "4h" ? "1h" : data.interval;
    const range = { "15m": "5d", "1h": "1mo", "4h": "6mo", "1d": "2y" }[data.interval];
    const yahooSymbol = metalFutures[data.symbol] ?? `${data.symbol}=X`;
    const isMetal = Boolean(metalFutures[data.symbol]);
    const [chart, daily, sq] = await Promise.all([
      yahooCandles(yahooSymbol, yInterval, range),
      yahooCandles(yahooSymbol, "1d", "2y").catch(() => null),
      // Never mix spot broker bid/ask into a futures chart's order book.
      isMetal ? Promise.resolve(null) : getJson(`https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/${data.symbol.slice(0, 3)}/${data.symbol.slice(3)}`).then(parseLiveQuote).catch(() => null),
    ]);
    const candles = data.interval === "4h" ? aggregateCandles(chart.candles, 14400) : chart.candles;
    const m = chart.meta;
    const last = m.regularMarketPrice;
    return {
      source: isMetal ? "Yahoo Finance · COMEX futures" : "Yahoo Finance · Swissquote", displaySymbol: isMetal ? yahooSymbol : data.symbol, perp: false,
      notice: isMetal ? `${data.symbol} · delayed COMEX ${data.symbol === "XAUUSD" ? "gold" : "silver"} futures in USD; not spot or USDT perpetual prices` : null,
      candles: candles.slice(-300),
      stats: { last, changePct: m.chartPreviousClose ? ((last - m.chartPreviousClose) / m.chartPreviousClose) * 100 : null, high: m.regularMarketDayHigh, low: m.regularMarketDayLow, volBase: null, volQuote: null, mark: null, updatedAt: m.regularMarketTime * 1000 },
      performance: [7, 30, 90, 180, 365].map(days => daily ? periodChange(daily.candles, days) : null),
      // Forex has no public depth; only the real Swissquote top of book is shown.
      book: sq ? { bids: [{ price: sq.bid, qty: null as number | null }], asks: [{ price: sq.ask, qty: null as number | null }] } : { bids: [], asks: [] },
      trades: [] as { id: number; price: number; qty: number; time: number; side: "buy" | "sell" }[],
    };
  });
