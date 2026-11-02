export const marketQuotes = [
  { symbol: "EURUSD", name: "Euro / US Dollar", group: "Forex", digits: 5 },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", group: "Forex", digits: 5 },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", group: "Forex", digits: 3 },
  { symbol: "USDCHF", name: "US Dollar / Swiss Franc", group: "Forex", digits: 5 },
  { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", group: "Forex", digits: 5 },
  { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", group: "Forex", digits: 5 },
  { symbol: "NZDUSD", name: "New Zealand Dollar / US Dollar", group: "Forex", digits: 5 },
  { symbol: "XAUUSD", name: "Gold / US Dollar", group: "Metals", digits: 3 },
  { symbol: "XAGUSD", name: "Silver / US Dollar", group: "Metals", digits: 4 },
] as const;

export function filterQuotes(search: string, group: string) {
  const term = search.trim().toUpperCase();
  return marketQuotes.filter(quote => (group === "All" || quote.group === group) &&
    (quote.symbol.includes(term) || quote.name.toUpperCase().includes(term)));
}