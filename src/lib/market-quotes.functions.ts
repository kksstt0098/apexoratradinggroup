import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { marketQuotes } from "./market-quotes";
import { parseLiveQuote } from "./live-quote-validation";

export const getLiveQuotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const results: { symbol: string; bid: number | null; ask: number | null; timestamp: number | null; error: string | null }[] = [];
    // Worker outbound connections are limited to six at a time.
    for (let i = 0; i < marketQuotes.length; i += 6) {
      const batch = await Promise.all(marketQuotes.slice(i, i + 6).map(async ({ symbol }) => {
        try {
          const response = await fetch(`https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/${symbol.slice(0, 3)}/${symbol.slice(3)}`, {
            headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000),
          });
          if (!response.ok) {
            const body = await response.text();
            console.error(`Swissquote feed [${response.status}]: ${body.slice(0, 500)}`);
            throw new Error(`Price feed unavailable (${response.status})`);
          }
          return { symbol, ...parseLiveQuote(await response.json()), error: null };
        } catch (error) {
          console.error(`Quote unavailable for ${symbol}`, error);
          return { symbol, bid: null, ask: null, timestamp: null, error: "Quote unavailable" };
        }
      }));
      results.push(...batch);
    }
    return { quotes: results, checkedAt: Date.now(), source: "Swissquote · Premium" };
  });