# Q Conversation Viewer - Infrastructure Package

This package contains the AWS CDK infrastructure for deploying the Q Conversation Viewer to `qview.chat`.

## Architecture

- **S3** for static file hosting (private bucket)
- **CloudFront** with Origin Access Control (OAC) for global CDN
- **Route 53** for DNS management
- **ACM** for SSL certificate

## Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **Node.js 18+** and **pnpm** installed
3. **CDK CLI** installed globally: `npm install -g aws-cdk`
4. **Domain ownership** of `qview.chat` with Route 53 hosted zone

## Commands

From the **monorepo root**:

```bash
# Install all dependencies
pnpm install

# Deploy infrastructure
pnpm deploy:infra

# Deploy website (builds and uploads)
pnpm deploy:website

# Deploy both (infrastructure + website)
pnpm deploy
```

From the **infrastructure package**:

```bash
# Install dependencies
pnpm install

# Bootstrap CDK (first time only)
pnpm bootstrap

# Deploy infrastructure
pnpm deploy

# Deploy website
pnpm deploy:website

# Other CDK commands
pnpm synth
pnpm diff
pnpm destroy
```

## Initial Setup

1. **Install dependencies from monorepo root:**
   ```bash
   pnpm install
   ```

2. **Bootstrap CDK (first time only):**
   ```bash
   pnpm --filter @q-convo-viewer/infrastructure bootstrap
   ```

3. **Deploy the infrastructure:**
   ```bash
   pnpm deploy:infra
   ```

## Website Deployment

After the infrastructure is deployed:

```bash
# From monorepo root
pnpm deploy:website

# Or from infrastructure package
cd packages/infrastructure
pnpm deploy:website
```

This will:
1. Build the website package (`@q-convo-viewer/website`)
2. Upload files to S3 with appropriate cache headers
3. Invalidate CloudFront cache

## Monorepo Structure

```
packages/
├── website/           # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
└── infrastructure/    # CDK infrastructure
    ├── lib/
    ├── bin/
    ├── scripts/
    └── package.json
```

## Security Features

- ✅ Private S3 bucket (no public access)
- ✅ Origin Access Control (OAC) for secure CloudFront → S3 access
- ✅ HTTPS only with SSL certificate
- ✅ Security headers via CloudFront
- ✅ Encrypted S3 storage

## Outputs

After deployment, the stack provides:

- **BucketName**: S3 bucket for website files
- **DistributionId**: CloudFront distribution ID
- **WebsiteUrl**: https://qview.chat
- **CertificateArn**: SSL certificate ARN
