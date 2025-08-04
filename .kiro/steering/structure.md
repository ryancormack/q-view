# Project Structure

## Monorepo Organization

This is a pnpm workspace monorepo with two main packages:

```
packages/
├── website/           # React frontend (@q-view/website)
└── infrastructure/    # AWS CDK deployment (@q-view/infrastructure)
```

## Website Package Structure

```
packages/website/
├── src/
│   ├── components/    # React components (PascalCase naming)
│   │   ├── ConversationFlow.tsx
│   │   ├── ConversationSummary.tsx
│   │   ├── ConversationViewer.tsx
│   │   ├── FileUpload.tsx
│   │   ├── Header.tsx
│   │   ├── JsonViewer.tsx
│   │   ├── MessageCard.tsx
│   │   └── ToolsPanel.tsx
│   ├── types.ts       # TypeScript type definitions
│   ├── main.tsx       # React app entry point
│   ├── App.tsx        # Main app component
│   └── index.css      # Global styles
├── public/            # Static assets
├── index.html         # HTML template
├── vite.config.ts     # Vite configuration
└── package.json       # Website dependencies
```

## Infrastructure Package Structure

```
packages/infrastructure/
├── lib/
│   └── q-convo-viewer-stack.ts  # Main CDK stack definition
├── bin/               # CDK app entry points
├── cdk.out/          # CDK synthesis output (generated)
├── cdk.json          # CDK configuration
├── cdk.context.json  # CDK context (generated)
└── package.json      # Infrastructure dependencies
```

## Root Level Files

```
├── .kiro/            # Kiro IDE configuration and steering
├── .github/          # GitHub workflows and templates
├── web-dist/         # Website build output (generated)
├── pnpm-workspace.yaml  # pnpm workspace configuration
├── pnpm-lock.yaml    # pnpm lockfile
├── package.json      # Root package with workspace scripts
└── README.md         # Project documentation
```

## Naming Conventions

- **Components**: PascalCase (e.g., `ConversationViewer.tsx`)
- **Files**: camelCase for utilities, PascalCase for components
- **Types**: PascalCase interfaces with descriptive names
- **Packages**: Scoped with `@q-view/` prefix
- **Directories**: kebab-case or camelCase depending on context

## Key Configuration Files

- **TypeScript**: Separate `tsconfig.json` per package with appropriate targets
- **Vite**: Custom config with Tailwind integration and build output to `web-dist`
- **CDK**: Standard CDK configuration with TypeScript compilation
- **pnpm**: Workspace configuration linking all packages

## Build Outputs

- Website builds to `web-dist/` directory (shared between packages)
- Infrastructure synthesizes to `cdk.out/` directory
- TypeScript compiles to appropriate targets per package