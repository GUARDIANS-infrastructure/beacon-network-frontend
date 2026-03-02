# Deployment

Previous: [CI](ci.md)  
Next: [Architecture](architecture.md)

## Target model

Deploy as static assets (no server runtime required), for example:
- S3 + CloudFront
- nginx
- equivalent static hosting

## Release shape

- Build with `pnpm build`
- Serve `dist/`
- Provide runtime `/config.json` per environment when needed

## Runtime config note

Environment-specific API URLs and knobs can be set via deployed `config.json` without rebuilding assets.
