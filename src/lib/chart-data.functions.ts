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

async function getJson(url: string) {
  const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) { console.error(`Market data [${res.status}] ${url}: ${(await res.text()).slice(0, 300)}`); throw new Error(`Market data unavailable (${res.status})`); }
  return res.json();
}

const binanceCandles = (rows: unknown[][]): Candle[] => rows.map(r => ({ time: Number(r[0]) / 1000, open: +r[1]!, high: +r[2]!, low: +r[3]!, close: +r[4]!, volume: +r[5]! }));

async function yahooCandles(symbol: string, interval: string, range: string): Promise<{ candles: Candle[]; meta: { regularMarketPrice: number; chartPreviousClose?: number; regularMarketDayHigh: number; regularMarketDayLow: number; regularMarketTime: number } }> {
  const data = await getJson(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}=X?interval=${interval}&range=${range}`);
  const r = data.chart.result[0]; const q = r.indicators.quote[0];
  const candles: Candle[] = [];
  (r.timestamp as number[]).forEach((t, i) => {
    if ([q.open[i], q.high[i], q.low[i], q.close[i]].some(v => v == null)) return;
    candles.push({ time: t, open: q.open[i], high: q.high[i], low: q.low[i], close: q.close[i], volume: q.volume[i] ?? 0 });
  });
  return { candles, meta: r.meta };
}

export const getChartData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => input.parse(data))
  .handler(async ({ data }) => {
    const pair = binanceSymbols[data.symbol];
    if (pair) {
      const base = "https://fapi.binance.com/fapi/v1";
      const [k, daily, t, d, trades, mark] = await Promise.all([
        getJson(`${base}/klines?symbol=${pair}&interval=${data.interval}&limit=300`),
        getJson(`${base}/klines?symbol=${pair}&interval=1d&limit=400`),
        getJson(`${base}/ticker/24hr?symbol=${pair}`),
        getJson(`${base}/depth?symbol=${pair}&limit=20`),
        getJson(`${base}/trades?symbol=${pair}&limit=20`),
        getJson(`${base}/premiumIndex?symbol=${pair}`),
      ]);
      const dailyCandles = binanceCandles(daily);
      return {
        source: `Binance Futures · ${pair} Perp`, displaySymbol: pair, perp: true,
        candles: binanceCandles(k),
        stats: { last: +t.lastPrice, changePct: +t.priceChangePercent, high: +t.highPrice, low: +t.lowPrice, volBase: +t.volume, volQuote: +t.quoteVolume, mark: +mark.markPrice, updatedAt: Number(t.closeTime) },
        performance: [7, 30, 90, 180, 365].map(days => periodChange(dailyCandles, days)),
        book: { bids: (d.bids as string[][]).map(([p, q]) => ({ price: +p!, qty: +q! as number | null })), asks: (d.asks as string[][]).map(([p, q]) => ({ price: +p!, qty: +q! as number | null })) },
        trades: (trades as { id: number; price: string; qty: string; time: number; isBuyerMaker: boolean }[]).reverse().map(x => ({ id: x.id, price: +x.price, qty: +x.qty, time: x.time, side: x.isBuyerMaker ? "sell" as const : "buy" as const })),
      };
    }
    const yInterval = data.interval === "4h" ? "1h" : data.interval;
    const range = { "15m": "5d", "1h": "1mo", "4h": "6mo", "1d": "2y" }[data.interval];
    const [chart, daily, sq] = await Promise.all([
      yahooCandles(data.symbol, yInterval, range),
      yahooCandles(data.symbol, "1d", "2y"),
      getJson(`https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/${data.symbol.slice(0, 3)}/${data.symbol.slice(3)}`).then(parseLiveQuote).catch(() => null),
    ]);
    const candles = data.interval === "4h" ? aggregateCandles(chart.candles, 14400) : chart.candles;
    const m = daily.meta;
    const last = m.regularMarketPrice;
    return {
      source: "Yahoo Finance · Swissquote", displaySymbol: data.symbol, perp: false,
      candles: candles.slice(-300),
      stats: { last, changePct: m.chartPreviousClose ? ((last - m.chartPreviousClose) / m.chartPreviousClose) * 100 : null, high: m.regularMarketDayHigh, low: m.regularMarketDayLow, volBase: null, volQuote: null, mark: null, updatedAt: m.regularMarketTime * 1000 },
      performance: [7, 30, 90, 180, 365].map(days => periodChange(daily.candles, days)),
      // Forex has no public depth; only the real Swissquote top of book is shown.
      book: sq ? { bids: [{ price: sq.bid, qty: null as number | null }], asks: [{ price: sq.ask, qty: null as number | null }] } : { bids: [], asks: [] },
      trades: [] as { id: number; price: number; qty: number; time: number; side: "buy" | "sell" }[],
    };
  });
