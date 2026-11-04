export type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number };

/** Group candles (time in seconds) into fixed buckets, e.g. 1h -> 4h. */
export function aggregateCandles(candles: Candle[], seconds: number): Candle[] {
  const out: Candle[] = [];
  for (const c of candles) {
    const bucket = Math.floor(c.time / seconds) * seconds;
    const last = out.at(-1);
    if (last && last.time === bucket) {
      last.high = Math.max(last.high, c.high); last.low = Math.min(last.low, c.low);
      last.close = c.close; last.volume += c.volume;
    } else out.push({ ...c, time: bucket });
  }
  return out;
}

export function sma(values: number[], period: number) {
  return values.map((_, i) => i < period - 1 ? null : values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period);
}

export function ema(values: number[], period: number) {
  const k = 2 / (period + 1); let prev: number | null = null;
  return values.map((v, i) => {
    if (i < period - 1) return null;
    prev = prev == null ? values.slice(0, period).reduce((a, b) => a + b, 0) / period : v * k + prev * (1 - k);
    return prev;
  });
}

export function bollinger(values: number[], period = 20, mult = 2) {
  const mid = sma(values, period);
  return mid.map((m, i) => {
    if (m == null) return null;
    const slice = values.slice(i - period + 1, i + 1);
    const sd = Math.sqrt(slice.reduce((a, v) => a + (v - m) ** 2, 0) / period);
    return { upper: m + mult * sd, mid: m, lower: m - mult * sd };
  });
}

export function vwap(candles: Candle[]) {
  let pv = 0, vol = 0;
  return candles.map(c => { pv += ((c.high + c.low + c.close) / 3) * c.volume; vol += c.volume; return vol > 0 ? pv / vol : null; });
}

/** Percent change between the latest close and the close `days` ago from daily candles (time in seconds). */
export function periodChange(daily: Candle[], days: number): number | null {
  const last = daily.at(-1);
  if (!last) return null;
  const target = last.time - days * 86400;
  const base = [...daily].reverse().find(c => c.time <= target);
  return base ? ((last.close - base.close) / base.close) * 100 : null;
}
