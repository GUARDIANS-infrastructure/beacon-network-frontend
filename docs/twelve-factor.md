# Twelve-factor Alignment

Previous: [Architecture](architecture.md)  
Next: End

## Applied factors for this SPA

- I. Codebase: single repo, many deploys
- II. Dependencies: explicit dependency declarations and lockfile
- III. Config: env vars + runtime `config.json`
- V. Build/release/run: static build artifacts and deploy-time config
- VI. Processes: stateless browser runtime
- X. Dev/prod parity: same checks and build flow in CI/local
- XI. Logs: browser/dev-server logs as event streams
- XII. Admin processes: one-off validation via scripts

## Not directly applicable

Port binding, process disposability, and process concurrency are primarily backend-runtime concerns and are not first-class in a static browser app.
