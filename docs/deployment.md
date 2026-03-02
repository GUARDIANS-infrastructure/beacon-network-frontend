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

## AWS operator runbook

For AWS-specific backend/API edge setup (EC2 + ALB + ACM + Route53), see:

- [AWS Infrastructure Runbook](aws-infrastructure-runbook.md)
