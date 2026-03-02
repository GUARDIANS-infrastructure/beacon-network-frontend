# Development

Previous: [Configuration Model](configuration-model.md)  
Next: [Testing](testing.md)

## Daily workflow

- Start dev server: `pnpm dev`
- Keep changes small and buildable.
- Run checks before pushing:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`

## CORS and local proxy

If browser CORS blocks direct API calls in local dev:

1. Set `VITE_DEV_PROXY_TARGET` to the upstream API base URL.
2. Set `VITE_API_BASE_URL=/api`.
3. Run `pnpm dev`.

Vite proxy config is in `vite.config.ts`.

## App scripts

- `dev`: start local dev server
- `build`: typecheck build + production bundle
- `preview`: preview built assets
- `lint`: ESLint checks
- `typecheck`: `tsc --noEmit`
- `test`: unit tests with Vitest
