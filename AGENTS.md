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
- Keep sign-in and signup in the same public index panel; private account pages live under the client-only `_authenticated` layout to avoid SSR session redirects.
- Read private account data through authenticated server functions and TanStack Query loaders; keep browser auth operations on the generated client.
- Profile updates may change personal fields only, never balances, referral ownership or invite codes, to prevent user-controlled account data.
- Keep invitation validation in a shared browser-safe module with rule tests; the signup database trigger remains the authoritative validator.
