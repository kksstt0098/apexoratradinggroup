<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Account architecture
- Keep deposit presentation under the authenticated account layout and reuse account reads; never credit balances or present reference exchange rates as live payment quotes without a configured payment service.
- Metal charts use real Binance USDT perpetual candles when available and explicitly labeled Yahoo COMEX futures when the primary feed is blocked; optional ticker/depth/trade failures must not discard valid candles, and spot quotes must never be merged with a futures order book.
- Keep all existing and future application source, configuration, migrations, and app asset references in the project so Lovable Git sync includes them; uploaded/downloaded media use tracked `.asset.json` CDN pointers, while generated app images may be tracked directly. Never include private credentials, user-uploaded KYC documents, dependencies, or generated build output, because repository sync must remain portable and safe.
- Keep instrument metadata browser-safe and fetch actual Swissquote premium broker bid/ask through an authenticated server function with at most six concurrent requests; never synthesize prices, retain provider timestamps, and mark stale or closed quotes honestly. Public feed accessibility does not establish commercial redistribution rights.
- Store KYC documents in a private user-scoped storage bucket with immutable submitted files; read submission status through authenticated server functions and never equate submission with approval.
- Share the account disclaimer across account pages so legal text and clearance for navigation stay consistent.
- Use the shared BrandLogo component for all brand marks so asset changes stay consistent without affecting surrounding layouts.
- Keep public login translations in a browser-safe dictionary and its disclaimer in a dedicated component, so language selection cannot change authentication behavior or account-page presentation.
- Keep sign-in and signup in the same public index panel; private account pages live under the client-only `_authenticated` layout to avoid SSR session redirects.
- Read private account data through authenticated server functions and TanStack Query loaders; keep browser auth operations on the generated client.
- Profile updates may change personal fields only, never balances, referral ownership or invite codes, to prevent user-controlled account data.
- Keep invitation validation in a shared browser-safe module with rule tests; the signup database trigger remains the authoritative validator.
- Keep desktop account navigation in a dedicated sidebar and switch it with mobile bottom navigation at the same breakpoint; the account data and actions stay shared to avoid divergent behavior.
