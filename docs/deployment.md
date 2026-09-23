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

## GUARDIANS test-account hosting

The `bn.test.biocommons.org.au` frontend is hosted in AWS account
`181259112927`. The GitHub environment remains named `production` because the
release workflow uses that environment; it is independent of the AWS account's
Test designation. The backend URL remains
`https://api.bn.test.biocommons.org.au/beacon-network/v2.0.0`.

Infrastructure templates:

- `infra/cloudformation/frontend-edge.json`: CloudFront WAF in `us-east-1`,
  preserving the Amazon IP reputation, common, and known-bad-input rule groups.
- `infra/cloudformation/frontend-site.json`: private encrypted S3 bucket,
  CloudFront origin access control, HTTPS distribution, and GitHub release role
  in the `BeaconNetworkFrontend-test` stack in `ap-southeast-2`.

Request the frontend ACM certificate in `us-east-1` and validate it through DNS.
Deploy the edge stack first, then pass its `WebAclArn` output and the certificate
ARN to the site stack. The site stack expects the GitHub OIDC provider to exist
in the account. Its release role trusts only this repository's `production`
environment and can publish only to this site's bucket and invalidate this
site's distribution.

For an initial deployment while the hostname belongs to another distribution,
use `AttachHostname=false`, upload the current release to the `BucketName`
output, and verify the `DistributionDomainName` endpoint. Transfer the hostname
using the CloudFront domain-migration procedure, then update the stack with
`AttachHostname=true` so CloudFormation owns the final alias configuration.
Point both the A and AAAA Route 53 aliases at the new distribution.

Set the GitHub `production` environment's `AWS_S3_BUCKET` and
`AWS_CLOUDFRONT_DISTRIBUTION_ID` from the stack outputs and
`AWS_ROLE_TO_ASSUME` secret to `ReleaseRoleArn`. Keep `AWS_REGION` as
`ap-southeast-2`. Rerunning an existing release deployment verifies OIDC and
publishes the same release without creating another release.

The assets bucket has a retain policy to prevent accidental deletion of release
files during stack removal. DNS is managed separately in the
`test.biocommons.org.au` hosted zone in account `232870232581`.
