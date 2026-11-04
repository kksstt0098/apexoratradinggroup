import { useEffect, useRef } from "react";
import { bollinger, ema, sma, vwap, type Candle } from "@/lib/chart-math";

export type Indicator = "MA" | "EMA" | "BOLL" | "VWAP" | "VOL";

function cssColor(name: string, alpha = 1) {
  const c = document.createElement("canvas"); c.width = c.height = 1;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "gray";
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function CandleChart({ candles, digits, indicators }: { candles: Candle[]; digits: number; indicators: Indicator[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const key = indicators.join(",");
  useEffect(() => {
    let disposed = false; let cleanup = () => {};
    import("lightweight-charts").then(lc => {
      if (disposed || !ref.current) return;
      const up = cssColor("--market-up"), down = cssColor("--market-down"), fg = cssColor("--muted-foreground"), grid = cssColor("--border", 0.6);
      const chart = lc.createChart(ref.current, {
        autoSize: true, layout: { background: { color: "transparent" }, textColor: fg, fontSize: 11 },
        grid: { vertLines: { color: grid }, horzLines: { color: grid } },
        rightPriceScale: { borderVisible: false }, timeScale: { borderVisible: false, timeVisible: true },
        localization: { priceFormatter: (p: number) => p.toFixed(digits) },
      });
      const data = candles.map(c => ({ ...c, time: c.time as import("lightweight-charts").UTCTimestamp }));
      const series = chart.addSeries(lc.CandlestickSeries, { upColor: up, downColor: down, borderVisible: false, wickUpColor: up, wickDownColor: down, priceFormat: { type: "price", precision: digits, minMove: 1 / 10 ** digits } });
      series.setData(data);
      const closes = candles.map(c => c.close);
      const line = (values: (number | null)[], color: string) => {
        const s = chart.addSeries(lc.LineSeries, { color, lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
        s.setData(values.flatMap((v, i) => v == null ? [] : [{ time: data[i]!.time, value: v }]));
      };
      if (indicators.includes("MA")) { line(sma(closes, 7), cssColor("--chart-4")); line(sma(closes, 25), cssColor("--chart-3")); }
      if (indicators.includes("EMA")) line(ema(closes, 20), cssColor("--chart-1"));
      if (indicators.includes("BOLL")) { const b = bollinger(closes); const col = cssColor("--chart-2"); line(b.map(x => x?.upper ?? null), col); line(b.map(x => x?.mid ?? null), col); line(b.map(x => x?.lower ?? null), col); }
      if (indicators.includes("VWAP")) line(vwap(candles), cssColor("--chart-5"));
      if (indicators.includes("VOL") && candles.some(c => c.volume > 0)) {
        const v = chart.addSeries(lc.HistogramSeries, { priceScaleId: "vol", priceFormat: { type: "volume" }, lastValueVisible: false, priceLineVisible: false });
        chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
        v.setData(candles.map((c, i) => ({ time: data[i]!.time, value: c.volume, color: c.close >= c.open ? cssColor("--market-up", 0.4) : cssColor("--market-down", 0.4) })));
      }
      chart.timeScale().fitContent();
      cleanup = () => chart.remove();
    });
    return () => { disposed = true; cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles, digits, key]);
  return <div ref={ref} className="h-full w-full" />;
}
