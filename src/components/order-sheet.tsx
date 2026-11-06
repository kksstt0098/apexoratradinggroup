import { useState } from "react";
import { Minus, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

export type Side = "long" | "short";

const times = [{ s: 60, ror: 15 }, { s: 120, ror: 20 }, { s: 180, ror: 25 }, { s: 300, ror: 30 }];

export function OrderSheet({ side, open, onOpenChange, symbol, name, price, changePct, digits }: {
  side: Side; open: boolean; onOpenChange: (o: boolean) => void;
  symbol: string; name: string; price: number | null | undefined; changePct: number | null | undefined; digits: number;
}) {
  const [time, setTime] = useState(60);
  const [amount, setAmount] = useState(1);
  const up = (changePct ?? 0) >= 0;
  const isLong = side === "long";

  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="bottom" className="mx-auto max-h-[90vh] max-w-lg overflow-y-auto rounded-t-2xl px-5 pb-6 pt-3">
      <div className="mx-auto mb-4 h-1 w-28 rounded-full bg-border" />
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <BrandLogo className="size-11 shrink-0" />
        <div className="min-w-0 flex-1">
          <SheetTitle className="truncate text-base font-semibold">{name}</SheetTitle>
          <SheetDescription className="text-xs">{symbol} · {isLong ? "Long" : "Short"}</SheetDescription>
        </div>
        <div className="text-right">
          <p className="font-mono text-base font-semibold tabular-nums">{price == null ? "--" : `$${price.toFixed(digits)}`}</p>
          <p className={cn("flex items-center justify-end gap-1 text-xs tabular-nums", up ? "text-market-up" : "text-market-down")}>
            {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {changePct == null ? "--" : `${up ? "+" : ""}${changePct.toFixed(2)}%`}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold">Time</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {times.map(t => <button key={t.s} onClick={() => setTime(t.s)} aria-pressed={time === t.s}
          className={cn("rounded-lg border py-3 text-center", time === t.s ? "border-anniversary bg-anniversary/10" : "border-transparent bg-muted")}>
          <span className="block text-sm font-semibold">{t.s} s</span>
          <span className="block text-[10px] text-muted-foreground">Ror:{t.ror}%</span>
        </button>)}
      </div>

      <div className="mt-6 flex justify-between text-sm"><span className="text-muted-foreground">Transaction Fees:</span><span className="text-anniversary">$ 0.00</span></div>

      <div className="mt-4 flex items-center rounded-lg bg-muted px-3 py-3">
        <Button variant="secondary" size="icon" className="size-7" aria-label="Decrease amount" onClick={() => setAmount(a => Math.max(1, a - 1))}><Minus className="size-4" /></Button>
        <input aria-label="Amount" inputMode="numeric" value={amount} onChange={e => { const n = parseInt(e.target.value.replace(/\D/g, "") || "1", 10); setAmount(Math.max(1, n)); }}
          className="min-w-0 flex-1 bg-transparent text-center text-base outline-none" />
        <Button variant="secondary" size="icon" className="size-7" aria-label="Increase amount" onClick={() => setAmount(a => a + 1)}><Plus className="size-4" /></Button>
      </div>

      <div className="mt-4 flex justify-between text-sm"><span className="text-muted-foreground">Available Balance:</span><span className="text-anniversary">0.00 USDT</span></div>

      <Button className={cn("mt-5 h-12 w-full rounded-lg text-base font-semibold text-primary-foreground", isLong ? "bg-market-up hover:bg-market-up/90" : "bg-market-down hover:bg-market-down/90")}>Continue</Button>
    </SheetContent>
  </Sheet>;
}
