import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({ createServerFn: () => {
  const builder = { middleware: () => builder, inputValidator: () => builder, handler: (fn: (arg: unknown) => unknown) => (arg: unknown) => fn(arg) };
  return builder;
} }));
vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
import { getChartData } from "../lib/chart-data.functions";

afterEach(() => vi.unstubAllGlobals());
describe("metal chart provider outages", () => {
  for (const [symbol, yahooSymbol, close] of [["XAUUSD", "GC=F", 4100], ["XAGUSD", "SI=F", 53]] as const) {
    it(`${symbol} retains real futures candles when Binance returns 403`, async () => {
      const requested: string[] = [];
      vi.stubGlobal("fetch", vi.fn(async (url: string) => {
        requested.push(url);
        if (url.includes("binance.com")) return new Response("Blocked", { status: 403 });
        if (url.includes("swissquote")) return new Response("Unavailable", { status: 503 });
        if (!decodeURIComponent(url).includes(yahooSymbol)) return new Response("Wrong instrument", { status: 404 });
        return Response.json({ chart: { result: [{ timestamp: [1793613600, 1793617200], meta: { regularMarketPrice: close, regularMarketDayHigh: close + 2, regularMarketDayLow: close - 2, regularMarketTime: 1793617200 }, indicators: { quote: [{ open: [close - 1, close], high: [close + 1, close + 2], low: [close - 2, close - 1], close: [close, close + 1], volume: [10, 20] }] } }] } });
      }));
      const result = await getChartData({ data: { symbol, interval: "1h" } });
      expect(result.candles.map(c => c.close)).toEqual([close, close + 1]);
      expect(result.displaySymbol).toBe(yahooSymbol);
      expect(result.source).toContain("COMEX futures");
      expect(result.stats.updatedAt).toBe(1793617200000);
      expect(result.book).toEqual({ bids: [], asks: [] });
      expect(requested.some(url => decodeURIComponent(url).includes(yahooSymbol))).toBe(true);
    });
  }
});