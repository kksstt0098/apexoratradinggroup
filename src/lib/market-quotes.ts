export const marketQuotes = [
  { symbol: "EURUSD", name: "Euro / US Dollar", group: "Forex", bid: 1.08432, ask: 1.08444, digits: 5 },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", group: "Forex", bid: 1.29215, ask: 1.29231, digits: 5 },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", group: "Forex", bid: 153.042, ask: 153.058, digits: 3 },
  { symbol: "USDCHF", name: "US Dollar / Swiss Franc", group: "Forex", bid: 0.86421, ask: 0.86437, digits: 5 },
  { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", group: "Forex", bid: 0.65742, ask: 0.65756, digits: 5 },
  { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", group: "Forex", bid: 1.38924, ask: 1.38942, digits: 5 },
  { symbol: "NZDUSD", name: "New Zealand Dollar / US Dollar", group: "Forex", bid: 0.59812, ask: 0.59830, digits: 5 },
  { symbol: "XAUUSD", name: "Gold / US Dollar", group: "Metals", bid: 2743.25, ask: 2743.60, digits: 2 },
  { symbol: "XAGUSD", name: "Silver / US Dollar", group: "Metals", bid: 32.640, ask: 32.670, digits: 3 },
] as const;

export function filterQuotes(search: string, group: string) {
  const term = search.trim().toUpperCase();
  return marketQuotes.filter(quote => (group === "All" || quote.group === group) &&
    (quote.symbol.includes(term) || quote.name.toUpperCase().includes(term)));
}