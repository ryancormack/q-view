# Technology Stack

## Build System & Package Management

- **Package Manager**: pnpm (v8+) - required for workspace management
- **Node.js**: v18+ required
- **Monorepo**: pnpm workspaces with packages in `packages/` directory
- **TypeScript**: v5.2+ across all packages with strict mode enabled

## Frontend Stack (Website Package)

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite v5 with React plugin
- **Styling**: Tailwind CSS v4 with Vite plugin
- **Module System**: ESNext modules with bundler resolution
- **Target**: ES2020 with modern browser support

## Infrastructure Stack (Infrastructure Package)

- **IaC**: AWS CDK v2 (2.167.1) with TypeScript
- **Runtime**: Node.js CommonJS modules
- **AWS Services**: S3, CloudFront, Route 53, ACM, CloudFormation
- **Deployment**: Automated via CDK with CI/CD support

## Common Commands

### Development
```bash
# Install all dependencies
pnpm install

# Start development server
pnpm dev

# Build all packages
pnpm build

# Type check all packages
pnpm typecheck

# Clean all packages
pnpm clean
```

### Package-Specific Commands
```bash
# Website development
pnpm --filter website dev
pnpm --filter website build

# Infrastructure deployment
pnpm --filter infrastructure deploy
pnpm --filter infrastructure diff
pnpm --filter infrastructure synth
```

### Deployment Commands
```bash
# Deploy infrastructure only
pnpm deploy:infra

# Build and deploy website
pnpm build:web

# Full deployment (infrastructure + website)
pnpm deploy
```

## Key Dependencies

### Website
- React 18 + React DOM
- Vite + TypeScript
- Tailwind CSS v4 with Vite integration
- ESLint with TypeScript and React plugins

### Infrastructure
- AWS CDK v2 with constructs
- TypeScript with Jest for testing
- Source map support for debugging