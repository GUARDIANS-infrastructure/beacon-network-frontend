# CI

Previous: [Testing](testing.md)  
Next: [Deployment](deployment.md)

## Workflow

GitHub Actions workflow: `.github/workflows/ci.yml`

Triggers:
- Pushes to `main`
- Pull requests

Steps:
- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## Purpose

CI is the release gate for code health and build validity.
