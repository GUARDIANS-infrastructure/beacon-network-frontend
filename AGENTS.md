# AGENTS.md — Beacon Network Front-end

This repo is a lightweight front-end for a GA4GH Beacon Network aggregator (Elixir `beacon-network-backend`).

## Goals
- Provide a simple, fast UI for **public** Beacon Network content (initially: `/info`, `/configuration`, `/cohorts`).
- Keep the app **lightweight**: minimal dependencies, minimal state, easy deployment as static assets.
- Be robust to partial failures (some constituent beacons may be down or slow).
- Be explicit about the Beacon v2 response shapes we rely on (and validate them).

## Non-goals (for now)
- Authentication / authorization.
- Querying variants / individuals / sensitive endpoints.
- Admin UI.
- Complex theming or design system investment.

## Target users
- Researchers and data stewards browsing public cohort/dataset summaries.
- Operators validating network health and configuration at a glance.

## Environment & tooling assumptions
- Node.js LTS.
- Package manager: pick one (prefer `pnpm`, otherwise `npm`). Keep commands consistent in docs and scripts.
- TypeScript is required.

## How to run (expected scripts)
Agents should ensure the repo provides these scripts in `package.json`:
- `dev`: run local dev server
- `build`: production build
- `preview`: serve the built app locally
- `lint`: lint (and fail on CI)
- `typecheck`: `tsc --noEmit`
- `test`: unit tests (even if minimal initially)

If the repo doesn’t yet have these, create them.

## External APIs
### Aggregator (primary)
Base URL:
- `http://ec2-15-135-165-56.ap-southeast-2.compute.amazonaws.com:8080/beacon-network/v2.0.0`

Endpoints used initially:
- `/info`
- `/configuration`
- `/cohorts`

### Constituent beacon example (for comparison / debugging)
Base URL:
- `https://beacon.dsp.garvan.org.au/api`

Endpoints:
- `/info`
- `/configuration`
- `/cohorts`

### API rules
- Prefer calling the **aggregator** endpoints for UI views.
- Treat all network calls as unreliable: implement timeouts, retries (conservative), and clear error states.
- Don’t assume CORS will always be permissive. If needed, add a small dev proxy and document it.
- Never hardcode secrets. There should be none.

## Data handling expectations
- Parse JSON responses defensively.
- Validate the minimum fields we display using a runtime schema (e.g., `zod`) or equivalent lightweight validation.
- When fields are missing/unexpected, render “Unknown” and log a debug message (don’t crash).

## UI scope (initial pages)
Keep navigation minimal:
1. **Overview**: show aggregator `/info` and high-level network status.
2. **Configuration**: render key parts of `/configuration` (collapsible JSON view is acceptable).
3. **Cohorts**: list cohorts from `/cohorts` with basic filtering/search and a details drawer/page.

## UX guidelines
- Prioritise clarity over polish.
- Always show: loading state, empty state, error state.
- Make it easy to copy JSON (copy-to-clipboard button) for operators.
- Provide a “last fetched at” timestamp for each API call.

## Code structure (preferred)
Aim for a simple, legible structure:
- `src/api/` — fetch clients, types, schemas
- `src/pages/` — route-level views
- `src/components/` — reusable UI pieces
- `src/utils/` — small helpers (formatting, timeouts, etc.)

Keep components small and focused; avoid deep prop drilling (use simple context only when it helps).

## Conventions
- TypeScript `strict: true`.
- Use `fetch` by default; introduce heavier libraries only if there is clear value.
- Prefer functional React components.
- Prefer explicit return types for exported functions in `src/api/`.
- Keep formatting automated (Prettier) and linting enforced (ESLint).

## Agent instructions (how to work in this repo)
When acting as an agent:
1. **Start by reading**: `README.md`, this `AGENTS.md`, and any `src/api/*` contract notes.
2. **Plan small, deliverable steps** (each should leave the repo buildable).
3. **Run checks locally** after changes: `lint`, `typecheck`, `test`, `build` (or the closest available).
4. **Do not** introduce new dependencies without stating:
   - why it’s needed,
   - alternatives considered,
   - ongoing maintenance cost.

### PR / change discipline
- Prefer multiple small commits with clear messages.
- Update docs when behavior changes (especially config/env).

## Configuration & environment variables
Agents should implement configuration via environment variables (document in README):
- `VITE_API_BASE_URL` (or framework equivalent): defaults to the aggregator base URL above for local dev.
- Optional: `VITE_REQUEST_TIMEOUT_MS`, `VITE_RETRY_COUNT` (sane defaults).

## Security & privacy
- This app is for public metadata only (currently).
- Do not log potentially sensitive payloads by default; keep verbose logging behind a dev flag.
- Avoid embedding any identifiers beyond what the public endpoints expose.

## Deployment expectations
- App should be deployable as static assets (e.g., S3+CloudFront or nginx).
- Keep build output deterministic and small.
- Avoid server requirements unless we explicitly decide to move to SSR later.

## Definition of done (for a feature)
- UI renders correctly for the aggregator endpoints listed above.
- Error/loading/empty states handled.
- Types and runtime validation cover the displayed fields.
- `build` succeeds; `typecheck` succeeds.
- Minimal tests exist for API parsing/validation and at least one key component/page.
