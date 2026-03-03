# Deployment

Previous: [CI](ci.md)  
Next: [Architecture](architecture.md)

## Target model

Deploy as static assets (no server runtime required), for example:
- S3 + CloudFront
- nginx
- equivalent static hosting

## Release steps

- Build with `pnpm build`
- Serve `dist/`
- Provide runtime `/config.json` per environment when needed

## Runtime config note

Environment-specific API URLs and knobs can be set via deployed `config.json` without rebuilding assets.

Repository convention:

- `public/config.json` is intentionally committed as `{}` (neutral default).
- `public/config.json.example` documents the expected runtime JSON shape.

## Release deploy workflow configuration

The release deployment workflow is:

- `.github/workflows/release-deploy-aws.yml`

It deploys on GitHub Release `published` and expects these GitHub Actions settings.

### Variables

- `AWS_REGION`
- `AWS_S3_BUCKET`
- `AWS_CLOUDFRONT_DISTRIBUTION_ID`
- `VITE_API_BASE_URL`
- `VITE_REQUEST_TIMEOUT_MS`
- `VITE_RETRY_COUNT`
- `VITE_APP_TITLE`
- `VITE_ENABLE_DEBUG_LOGS`

### Secrets

- `AWS_ROLE_TO_ASSUME`
  - IAM role ARN used by GitHub OIDC (`aws-actions/configure-aws-credentials`).

Build-time note:

- Release deploy uses `VITE_*` GitHub environment variables at build time.
- Runtime `/config.json` remains available for post-deploy overrides (for example uploading a non-empty `config.json` to S3).

## AWS operator runbook

For AWS-specific backend/API edge setup (EC2 + ALB + ACM + Route53), see:

- [AWS Infrastructure Runbook](aws-infrastructure-runbook.md)
