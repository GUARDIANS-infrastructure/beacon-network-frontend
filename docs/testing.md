# Testing

Previous: [Development](development.md)  
Next: [CI](ci.md)

## Commands

```bash
pnpm test
pnpm typecheck
pnpm lint
```

## Current baseline

- Unit tests for config parsing/loading behavior.
- App render smoke test.

## Expected pre-PR checks

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```
