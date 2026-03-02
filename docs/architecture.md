# Architecture

Previous: [Deployment](deployment.md)  
Next: [Twelve-factor Alignment](twelve-factor.md)

## Stack

- Vite
- React
- TypeScript (`strict: true`)
- Fetch-based API client

## Structure

- `src/api/`: API client, parsing schemas, contracts
- `src/config/`: app configuration loading/parsing
- `src/pages/`: page-level views
- `src/components/`: reusable UI parts
- `src/utils/`: small helpers

## Design choices

- Lightweight dependency surface
- Defensive response parsing
- Clear loading/error/empty states
- Static deployment first
