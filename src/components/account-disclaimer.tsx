import { Info } from "lucide-react";

export function AccountDisclaimer() {
  return <footer className="border-t border-border/60 pt-5 pb-40 text-xs leading-5 text-muted-foreground md:pb-24 md:pr-24 md:text-[13px] md:leading-[1.65] xl:pr-28">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="text-base font-bold text-foreground">Disclaimer</h2>
          <span className="text-xs">© 2026 VW Markets Limited</span>
        </div>
        <p className="mt-3">VW Markets Limited is registered in Seychelles with Company Number 850672-1 and is authorized by the Financial Services Authority (FSA) under License Number SD062. VW Markets is authorized and regulated by the Mauritius Financial Services Commission (FSC) under License Number C119023893.</p>
        <p className="mt-3">The information and advertisements on this website are not intended for use by any person in any country or jurisdiction where such use is contrary to local laws or regulations. Products and services offered on this website are not intended for residents of Afghanistan, Belarus, Canada, Central African Republic, Crimea, Cuba, Democratic Republic of Congo (DRC), Ethiopia, Guinea-Bissau, Iran, Iraq, Israel, Lebanon, Libya, Malaysia, Mali, Nicaragua, North Korea, Somalia, South Sudan, Sudan, Syria, Russia, Ukraine, United States, Venezuela, Yemen, and Zimbabwe.</p>
        <p className="mt-3">The information provided on this website is general in nature and does not constitute personal financial advice. Please note that investing in CFDs and Margin FX Contracts carries significant risks and is not suitable for all investors. You do not own, or have, any interest in the underlying assets. Any information or general financial product advice given is generic in nature and does not take into account your financial situation, needs, or personal objectives. Past performance is not a reliable indicator of future performance. Investing in leveraged products carries significant risks. We recommend that you seek independent advice and ensure that you fully understand the risks involved before trading. It is important that you read and consider our disclosure documents (<strong className="text-foreground">Client Agreement</strong>, <strong className="text-foreground">Privacy Policy</strong> &amp; <strong className="text-foreground">Risk Disclosure</strong>) before acquiring any product.</p>
      </footer>;
}
