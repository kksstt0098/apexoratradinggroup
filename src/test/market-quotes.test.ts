import { describe, expect, it } from "vitest";
import { filterQuotes, marketQuotes } from "../lib/market-quotes";

describe("requested quote instruments", () => {
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