export function LoginDisclaimer() {
  return (
    <footer aria-label="Disclaimer" className="relative bg-login-footer px-5 py-6 text-login-muted sm:px-10 lg:px-[7%]">
      <div className="mx-auto max-w-[1440px] text-[11px] leading-[1.7] sm:text-xs">
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline">
          <h2 className="text-xs font-bold uppercase tracking-normal text-login-foreground">Disclaimer</h2>
          <span className="text-[10px] sm:text-right">© 2026 VW Markets Limited</span>
        </div>
        <p className="mt-3">VW Markets Limited is registered in Seychelles with Company Number 850672-1 and is authorized by the Financial Services Authority (FSA) under License Number SD062. VW Markets is authorized and regulated by the Mauritius Financial Services Commission (FSC) under License Number C119023893.</p>
        <p className="mt-2">The information and advertisements on this website are not intended for use by any person in any country or jurisdiction where such use is contrary to local laws or regulations. Products and services offered on this website are not intended for residents of Afghanistan, Belarus, Canada, Central African Republic, Crimea, Cuba, Democratic Republic of Congo (DRC), Ethiopia, Guinea-Bissau, Iran, Iraq, Israel, Lebanon, Libya, Malaysia, Mali, Nicaragua, North Korea, Somalia, South Sudan, Sudan, Syria, Russia, Ukraine, United States, Venezuela, Yemen, and Zimbabwe.</p>
        <p className="mt-2">The information provided on this website is general in nature and does not constitute personal financial advice. Please note that investing in CFDs and Margin FX Contracts carries significant risks and is not suitable for all investors. You do not own, or have, any interest in the underlying assets. Any information or general financial product advice given is generic in nature and does not take into account your financial situation, needs, or personal objectives. Past performance is not a reliable indicator of future performance. Investing in leveraged products carries significant risks. We recommend that you seek independent advice and ensure that you fully understand the risks involved before trading. It is important that you read and consider our disclosure documents (<strong className="text-login-foreground">Client Agreement</strong>, <strong className="text-login-foreground">Privacy Policy</strong> &amp; <strong className="text-login-foreground">Risk Disclosure</strong>) before acquiring any product.</p>
      </div>
    </footer>
  );
}