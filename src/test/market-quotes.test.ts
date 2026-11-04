import { describe, expect, it } from "vitest";
import { filterQuotes, marketQuotes } from "../lib/market-quotes";
import { parseLiveQuote, quoteStatus } from "../lib/live-quote-validation";

describe("requested quote instruments", () => {
  it("has no fabricated fallback prices", () => {
    expect(marketQuotes.some(q => "bid" in q || "ask" in q)).toBe(false);
  });
  it("keeps real provider bid, ask and timestamp unchanged", () => {
    const payload = [{ topo: { platform: "SwissquoteCapitalMarkets", server: "Live7" }, ts: 1793613858162, spreadProfilePrices: [{ spreadProfile: "premium", bid: 1.12175, ask: 1.12189 }] }];
    expect(parseLiveQuote(payload)).toEqual({ bid: 1.12175, ask: 1.12189, timestamp: 1793613858162 });
  });
  it("rejects invalid two-sided prices rather than generating a spread", () => {
    expect(() => parseLiveQuote([{ topo: { platform: "SwissquoteCapitalMarkets", server: "Live7" }, ts: 123, spreadProfilePrices: [{ spreadProfile: "premium", bid: 2, ask: 1 }] }])).toThrow();
    expect(() => parseLiveQuote([])).toThrow();
  });
  it("marks old weekday prices delayed and weekend quotes closed", () => {
    const monday = Date.parse("2026-11-02T10:00:00Z");
    expect(quoteStatus(monday - 1000, monday)).toBe("Live");
    expect(quoteStatus(monday - 180000, monday)).toBe("Delayed");
    const sunday = Date.parse("2026-11-01T10:00:00Z");
    expect(quoteStatus(sunday - 1000, sunday)).toBe("Market closed");
  });
  it("includes all seven Forex major pairs", () => {
    expect(marketQuotes.filter(q => q.group === "Forex").map(q => q.symbol)).toEqual([
      "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD",
    ]);
  });
  it("includes XAUUSD gold", () => {
    expect(marketQuotes.find(q => q.symbol === "XAUUSD")?.group).toBe("Metals");
  });
  it("searches symbols without case sensitivity and respects category", () => {
    expect(filterQuotes(" xau ", "All").map(q => q.symbol)).toEqual(["XAUUSD"]);
    expect(filterQuotes("xau", "Forex")).toEqual([]);
  });
});
import { aggregateCandles, periodChange } from "../lib/chart-math";
describe("chart math", () => {
  it("merges hourly candles into 4h candles", () => {
    const c = [0, 1, 2, 3].map(i => ({ time: i * 3600, open: 10 + i, high: 20 + i, low: 5 - i, close: 11 + i, volume: 1 }));
    expect(aggregateCandles(c, 14400)).toEqual([{ time: 0, open: 10, high: 23, low: 2, close: 14, volume: 4 }]);
  });
  it("computes 7-day change from real daily closes", () => {
    const d = [0, 7].map(i => ({ time: i * 86400, open: 0, high: 0, low: 0, close: i === 0 ? 100 : 110, volume: 0 }));
    expect(periodChange(d, 7)).toBeCloseTo(10);
  });
});
