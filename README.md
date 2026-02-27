# README.md — Beacon Network Front-end

A lightweight web UI for a GA4GH Beacon Network aggregator (Elixir `beacon-network-backend`).

This app is intentionally small: it reads public metadata from a Beacon Network and renders a clear, operator-friendly interface for:
- `/info`
- `/configuration`
- `/cohorts`

See `AGENTS.md` for agent/workflow guidance.

---

## Status

- Backend: deployed and operational (Beacon Network aggregator).
- Front-end: bootstrapped with Vite + React + TypeScript.

---

## What this UI does

### Pages (initial scope)
1. **Overview**
   - Fetch and display aggregator `/info`
   - Show last-fetched time and basic health indicators (best-effort)

2. **Configuration**
   - Fetch `/configuration`
   - Display key fields and/or a readable JSON view, with copy-to-clipboard

3. **Cohorts**
   - Fetch `/cohorts`
   - List cohorts with basic search/filter
   - Cohort detail view/drawer showing important fields + raw JSON

---


## Tech choices
- React + TypeScript
- SPA build (static assets)
- Minimal dependency surface
- Runtime validation for API payloads (e.g. `zod`) for displayed fields only

## Getting started

### Prerequisites
- Node.js LTS
- Package manager: `pnpm` (preferred) or `npm`

### Install
Using `pnpm`:
```bash
pnpm install
```

Using `npm`:

```bash
npm install
```

### Configure

Copy `.env.example` to `.env` and adjust values:

```bash
cp .env.example .env
```

Supported variables:

```bash
VITE_API_BASE_URL=http://ec2-15-135-165-56.ap-southeast-2.compute.amazonaws.com:8080/beacon-network/v2.0.0
VITE_REQUEST_TIMEOUT_MS=10000
VITE_RETRY_COUNT=1
VITE_APP_TITLE=Beacon Network Front-end
VITE_ENABLE_DEBUG_LOGS=false
```

Configuration behavior:
- Invalid timeout/retry values fall back to defaults.
- Invalid API URL values fall back to default aggregator URL.
- `VITE_ENABLE_DEBUG_LOGS=true` enables development-time diagnostics.

### Run (dev)

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview (serve the build output locally)

```bash
npm run preview
```

---

## Scripts (expected)

This repo provides:

* `dev` — start dev server
* `build` — production build
* `preview` — preview build output
* `lint` — lint (CI should fail on lint errors)
* `typecheck` — `tsc --noEmit`
* `test` — unit tests

---

## CORS / local dev proxy

If the aggregator does not permit browser CORS from your local origin, the dev server may need a proxy.

Supported approach:

* Use your dev tool’s proxy feature (e.g. Vite `server.proxy`) to map `/api` → the aggregator base URL.
* Keep the UI calling a relative base like `/api` in dev, and the real URL in prod.

In this repo:
1. Set `VITE_DEV_PROXY_TARGET` to the upstream API base URL.
2. Set `VITE_API_BASE_URL=/api`.
3. Start dev server (`npm run dev`).

---

## Code structure

* `src/api/` — API client, types, schemas, contracts
* `src/config/` — environment parsing and app config
* `src/pages/` — route-level views
* `src/components/` — reusable UI components
* `src/utils/` — small helpers

API assumptions and “what we rely on” are documented in:

* `src/api/contracts.md`

---

## Testing

Current baseline:
* Unit tests for env/config parsing.
* Smoke test for root app rendering.

---

## Deployment

This is intended to deploy as static assets:

* S3 + CloudFront
* nginx
* any static hosting

No server-side rendering is assumed.
