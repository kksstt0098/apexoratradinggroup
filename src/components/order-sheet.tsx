import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export type Side = "long" | "short";

export function OrderSheet({ side, onSideChange, open, onOpenChange, symbol, price, digits }: {
  side: Side; onSideChange: (s: Side) => void; open: boolean; onOpenChange: (o: boolean) => void;
  symbol: string; price: number | null | undefined; digits: number;
}) {
  const [type, setType] = useState<"Limit" | "Market">("Market");
  const [limit, setLimit] = useState("");
  const [amount, setAmount] = useState("");
  const [leverage, setLeverage] = useState(20);
  const [pct, setPct] = useState(0);
  const isLong = side === "long";
  const shown = price == null ? "--" : price.toFixed(digits);

  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="bottom" className="mx-auto max-h-[90vh] max-w-lg overflow-y-auto rounded-t-2xl">
      <SheetHeader className="text-left">
        <SheetTitle>{symbol} <span className="text-sm font-normal text-muted-foreground">Perp</span></SheetTitle>
        <SheetDescription>Last price {shown}</SheetDescription>
      </SheetHeader>
      <div className="space-y-4 px-4 pb-6">
        <div className="grid grid-cols-2 rounded-lg bg-muted p-1 text-sm font-semibold">
          {(["long", "short"] as const).map(s => <button key={s} onClick={() => onSideChange(s)} aria-pressed={side === s}
            className={cn("rounded-md py-2", side === s ? (s === "long" ? "bg-market-up text-primary-foreground" : "bg-market-down text-primary-foreground") : "text-muted-foreground")}>{s === "long" ? "Long" : "Short"}</button>)}
        </div>
        <div className="flex gap-2 text-sm">
          {(["Market", "Limit"] as const).map(t => <button key={t} onClick={() => setType(t)} className={cn("rounded px-3 py-1", type === t ? "bg-muted font-semibold" : "text-muted-foreground")}>{t}</button>)}
          <span className="ml-auto rounded border border-border px-2 py-1 text-xs">Cross · {leverage}x</span>
        </div>
        <label className="block text-xs text-muted-foreground">Price
          <Input className="mt-1" inputMode="decimal" disabled={type === "Market"} value={type === "Market" ? "Market price" : limit} placeholder={shown} onChange={e => setLimit(e.target.value)} />
        </label>
        <label className="block text-xs text-muted-foreground">Amount (lots)
          <Input className="mt-1" inputMode="decimal" value={amount} placeholder="0.00" onChange={e => setAmount(e.target.value)} />
        </label>
        <div className="grid grid-cols-5 gap-1">
          {[0, 25, 50, 75, 100].map(p => <button key={p} onClick={() => setPct(p)} className={cn("rounded border py-1 text-xs", pct === p ? "border-anniversary text-anniversary" : "border-border text-muted-foreground")}>{p}%</button>)}
        </div>
        <div>
          <div className="mb-2 flex justify-between text-xs"><span className="text-muted-foreground">Leverage</span><span className="font-semibold">{leverage}x</span></div>
          <Slider min={1} max={100} step={1} value={[leverage]} onValueChange={v => setLeverage(v[0] ?? 1)} aria-label="Leverage" />
        </div>
        <dl className="grid grid-cols-2 gap-y-1 text-xs">
          <dt className="text-muted-foreground">Available</dt><dd className="text-right">0.00 USDT</dd>
          <dt className="text-muted-foreground">Margin</dt><dd className="text-right">--</dd>
        </dl>
        <Button className={cn("h-12 w-full text-base font-semibold text-primary-foreground", isLong ? "bg-market-up hover:bg-market-up/90" : "bg-market-down hover:bg-market-down/90")}>
          {isLong ? "Open Long" : "Open Short"}
        </Button>
      </div>
    </SheetContent>
  </Sheet>;
}
