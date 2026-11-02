import { z } from "zod";

export const quotePayload = z.array(z.object({
  topo: z.object({ platform: z.string(), server: z.string() }),
  ts: z.number().finite().positive(),
  spreadProfilePrices: z.array(z.object({
    spreadProfile: z.string(), bid: z.number().finite().positive(), ask: z.number().finite().positive(),
  })),
}));

export function parseLiveQuote(payload: unknown) {
  const rows = quotePayload.parse(payload);
  // Never combine bids and asks from different broker platforms/profiles.
  const row = rows.find(item => item.topo.platform === "SwissquoteCapitalMarkets");
  const price = row?.spreadProfilePrices.find(item => item.spreadProfile === "premium");
  if (!row || !price || price.ask < price.bid) throw new Error("No valid Swissquote premium quote available");
  return { bid: price.bid, ask: price.ask, timestamp: row.ts };
}

export function quoteStatus(timestamp: number, now: number) {
  const day = new Date(now).getUTCDay();
  const hour = new Date(now).getUTCHours();
  if ((day === 5 && hour >= 22) || day === 6 || (day === 0 && hour < 22)) return "Market closed";
  return now - timestamp > 120_000 || timestamp > now + 60_000 ? "Delayed" : "Live";
}