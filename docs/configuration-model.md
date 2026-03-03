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

Repository convention:

- `public/config.json` is committed as `{}` (neutral runtime default).
- `public/config.json.example` documents a full example runtime payload.

## Runtime partner logos (`/partners.json`)

Partner logos are configured independently via optional runtime JSON at `/partners.json`.

Default behavior:

- No logos are shown unless valid entries are provided in `/partners.json`.
- The footer logo section is hidden when there are no logos.

Expected shape:

```json
[
  {
    "src": "/logos/logo-example.png",
    "alt": "Example Organization",
    "href": "https://example.org/"
  }
]
```

Rules:

- `src` and `alt` are required non-empty strings.
- `href` is optional.
- Invalid entries are ignored.
- If file is missing/invalid/empty, no logos are rendered.

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
  - The release workflow builds with GitHub environment `VITE_*` variables.

## Dev proxy variable

`VITE_DEV_PROXY_TARGET` is used only by Vite dev server (`vite.config.ts`) to proxy `/api` requests. It is not part of runtime app config.
