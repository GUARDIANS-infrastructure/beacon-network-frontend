# Configuration Model

Previous: [Getting Started](getting-started.md)  
Next: [Development](development.md)

This app uses a two-stage configuration model:

1. Build-time config from Vite environment variables (`VITE_*`)
2. Runtime overrides from `/config.json`

## Sources and precedence

Effective configuration is resolved in this order (highest first):

1. Valid fields from runtime `/config.json`
2. Build-time `VITE_*` values (`.env` or process env during build/dev)
3. Hardcoded defaults in `src/config/env.ts`

If a value is invalid at any stage, the app falls back to the next source.

## Build-time config (`VITE_*`)

Parsed in `parseAppConfig(import.meta.env)` from `src/config/env.ts`.

Supported values:

- `VITE_API_BASE_URL`
- `VITE_REQUEST_TIMEOUT_MS`
- `VITE_RETRY_COUNT`
- `VITE_APP_TITLE`
- `VITE_ENABLE_DEBUG_LOGS`

Notes:

- For production static builds, these values are baked into assets at build time.
- In dev, Vite reads from `.env` and environment variables.

## Runtime config (`/config.json`)

On app startup, `loadRuntimeConfig()` fetches `/config.json` before React renders.

Supported JSON fields:

- `apiBaseUrl` (string, absolute URL or `/api` style relative path)
- `requestTimeoutMs` (number, >= 0)
- `retryCount` (number, >= 0)
- `appTitle` (non-empty string)
- `enableDebugLogs` (boolean)

Only valid fields are applied.

## Missing or invalid `config.json`

If `/config.json` is missing, non-200, or cannot be parsed:

- The app does not crash.
- Runtime overrides are skipped.
- Build-time/default config remains active.

## Dev vs prod behavior

- Dev (`pnpm dev`):
  - Vite provides `VITE_*` values.
  - App still attempts runtime `/config.json` and applies overrides.
- Prod (static hosting):
  - `VITE_*` values are fixed at build time.
  - Operators can change deployed `/config.json` to adjust runtime config without rebuilding.

## Dev proxy variable

`VITE_DEV_PROXY_TARGET` is used only by Vite dev server (`vite.config.ts`) to proxy `/api` requests. It is not part of runtime app config.
