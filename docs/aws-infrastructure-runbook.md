# AWS Infrastructure Runbook

AWS-specific deployment and operations guidance for serving the frontend over HTTPS and exposing an HTTPS API endpoint via ALB, while keeping WildFly on EC2 HTTP-only internally.

## Scope

This runbook covers:

- backend service on EC2 (`HTTP:8080`) with restricted security-group access
- ALB + ACM certificate + Route53 public HTTPS endpoint
- frontend configuration to call API over HTTPS
- CloudFront/S3 cache behavior during frontend deploys
- minimal CloudFormation template for repeatable setup

## API HTTPS requirement

- Browsers block mixed content.
- If frontend is loaded from `https://...`, calls to `http://...` are blocked client-side.
- Therefore the frontend must call the API over HTTPS.

Reference traffic flow:

- Browser -> Frontend static site: `HTTPS`
- Browser -> API endpoint (ALB/Route53): `HTTPS`
- ALB -> WildFly on EC2: `HTTP:8080` (internal VPC hop)

## 1. Backend EC2 (WildFly) and security groups (HTTP internal only)

- Instance can remain in existing VPC (including default VPC).
- WildFly backend service listens on `HTTP:8080` and serves:
  - `/beacon-network/v2.0.0/info`
  - `/beacon-network/v2.0.0/configuration`
  - `/beacon-network/v2.0.0/cohorts`
- Restrict EC2 inbound rule:
  - allow `TCP 8080` from ALB security group only
  - remove `0.0.0.0/0` access to port `8080`

## 2. ALB + ACM cert + Route53

1. Request ACM cert in same region as EC2/ALB (for example `ap-southeast-2`):
   - domain example: `api.example.org`
   - complete DNS validation until status is `Issued`
2. Create internet-facing ALB in same VPC as EC2:
   - enable at least two AZs/subnets
   - ensure AZ containing EC2 target is enabled
3. Create target group:
   - target type: `instance`
   - protocol/port: `HTTP:8080`
   - health check path: `/beacon-network/v2.0.0/info`
   - this is ALB -> EC2 internal HTTP traffic
4. Register EC2 target and verify `Healthy`.
5. Add ALB listeners:
   - `HTTPS :443` -> forward to target group
   - `HTTP :80` -> redirect to `HTTPS :443` (or omit 80 listener)
6. Create Route53 record:
   - `api.example.org` -> Alias to ALB DNS
7. Validate:

```bash
curl -i https://api.example.org/beacon-network/v2.0.0/info
```

## 3. Frontend config to API HTTPS endpoint

Use an HTTPS API base URL in production:

- build-time: `VITE_API_BASE_URL`
- runtime override: `/config.json` `apiBaseUrl`

Example runtime `public/config.json`:

```json
{
  "apiBaseUrl": "https://api.example.org/beacon-network/v2.0.0"
}
```

If frontend and API are different origins, configure backend CORS for:

- origin: frontend URL (for example `https://app.example.org`)
- methods: `GET, OPTIONS`
- required headers (at least `Content-Type`)

## 4. CloudFront + S3 cache correctness for frontend deploys

When deploying a new `dist/`, stale `index.html` can reference old hashed assets.

- upload assets first, then `index.html`
- set long cache on hashed assets (`/assets/*`)
- set no-cache (or very short cache) for `index.html`
- invalidate CloudFront `"/index.html"` on each deploy (or `"/*"` when needed)

S3 sync example:

```bash
aws s3 sync dist/ s3://<bucket>/ --delete
```

## 5. Infrastructure as code option

Minimal CloudFormation template for ALB side:

- `infra/cloudformation/alb-https-api.yml`

Template creates:

- ALB security group
- internet-facing ALB
- target group (`HTTP:8080`)
- `80 -> 443` redirect listener
- `443` listener with ACM cert
- optional Route53 alias record
- optional EC2 security-group rule allowing `8080` from ALB SG

Example deploy command:

```bash
aws cloudformation deploy \
  --stack-name beacon-network-api-alb \
  --template-file infra/cloudformation/alb-https-api.yml \
  --parameter-overrides \
    VpcId=vpc-xxxxxxxx \
    PublicSubnet1Id=subnet-aaaaaaaa \
    PublicSubnet2Id=subnet-bbbbbbbb \
    BackendInstanceId=i-0123456789abcdef0 \
    CertificateArn=arn:aws:acm:ap-southeast-2:123456789012:certificate/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
    ApiDomainName=api.example.org \
    HostedZoneId=Z1234567890ABC \
    BackendSecurityGroupId=sg-0123abcd4567efgh8
```
