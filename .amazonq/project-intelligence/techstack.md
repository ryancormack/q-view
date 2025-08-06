# Technology Stack

## Frontend Technologies

### Core Framework
- **React 18.2.0** - Modern React with hooks and concurrent features
  - Functional components with hooks for state management
  - React Router DOM 7.7.1 for client-side routing
  - TypeScript for type safety and developer experience

### Build Tools & Development
- **Vite 5.2.0** - Fast build tool and development server
  - Hot Module Replacement (HMR) for rapid development
  - Optimized production builds with code splitting
  - Native ES modules support

- **TypeScript 5.2.2** - Static type checking
  - Strict type checking enabled
  - Enhanced IDE support and refactoring
  - Better code documentation through types

### Styling & UI
- **Tailwind CSS 4.1.0** - Utility-first CSS framework
  - Responsive design utilities
  - Custom design system with consistent spacing
  - Optimized CSS output with purging

- **@tailwindcss/vite 4.1.0** - Vite integration for Tailwind
  - Fast CSS compilation
  - Development-time CSS optimization

### Code Quality & Linting
- **ESLint 8.57.0** - JavaScript/TypeScript linting
  - TypeScript ESLint parser and plugin
  - React-specific linting rules
  - React Hooks linting for proper hook usage

## Infrastructure Technologies

### Cloud Platform
- **Amazon Web Services (AWS)** - Cloud infrastructure provider
  - Global availability and reliability
  - Comprehensive security features
  - Cost-effective static site hosting

### Infrastructure as Code
- **AWS CDK 2.167.1** - Cloud Development Kit
  - TypeScript-based infrastructure definitions
  - Type-safe cloud resource management
  - Automated deployment and updates

### AWS Services
- **Amazon S3** - Static website hosting
  - Bucket encryption and security policies
  - Versioning disabled for cost optimization
  - Block public access with Origin Access Control

- **Amazon CloudFront** - Content Delivery Network
  - Global edge locations for fast content delivery
  - HTTPS enforcement and SSL termination
  - Compression and caching optimization
  - Origin Access Control for S3 security

- **AWS Certificate Manager (ACM)** - SSL/TLS certificates
  - Automatic certificate provisioning and renewal
  - DNS validation for domain ownership
  - Integration with CloudFront

- **Amazon Route 53** - DNS management
  - Domain name resolution
  - Health checks and failover
  - Integration with CloudFront distributions

## Development Tools

### Package Management
- **pnpm 10.0.0+** - Fast, disk space efficient package manager
  - Workspace support for monorepo structure
  - Strict dependency resolution
  - Shared dependency storage

### Monorepo Structure
```
q-viewer/
├── packages/
│   ├── website/          # React frontend application
│   └── infrastructure/   # AWS CDK deployment code
├── package.json          # Root workspace configuration
└── pnpm-workspace.yaml   # pnpm workspace definition
```

### Development Environment
- **Node.js 20.0.0+** - JavaScript runtime
  - Modern ES modules support
  - Enhanced performance and security
  - Long-term support (LTS) version

### Version Control & CI/CD
- **Git** - Version control system
- **GitHub** - Code repository and collaboration
- **GitHub Actions** - Continuous integration and deployment
  - Automated builds on push
  - Infrastructure deployment
  - Asset optimization and deployment

## Data Processing Technologies

### File Handling
- **Native File API** - Browser-based file processing
  - Drag and drop file upload
  - Client-side file reading
  - No server-side file storage

### JSON Processing
- **Native JSON API** - Built-in JSON parsing
  - Streaming JSON processing for large files
  - Error handling for malformed JSON
  - Schema validation using JSON Schema

### Type Definitions
- **Custom TypeScript Interfaces** - Strongly typed data models
  - Q CLI conversation format types
  - Message type discriminated unions
  - Tool specification interfaces

## Development Configuration

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Vite Configuration
```typescript
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
})
```

### ESLint Configuration
- **@typescript-eslint/eslint-plugin** - TypeScript-specific linting
- **eslint-plugin-react-hooks** - React Hooks linting
- **eslint-plugin-react-refresh** - React Fast Refresh compatibility

## Build & Deployment Pipeline

### Local Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Type checking
pnpm typecheck

# Build for production
pnpm build
```

### Production Deployment
```bash
# Build website
pnpm build:web

# Deploy infrastructure
pnpm deploy:infra:ci

# Assets are automatically deployed to S3 via CDK
```

## Performance Optimizations

### Build Optimizations
- **Code Splitting** - Automatic chunk splitting by Vite
- **Tree Shaking** - Dead code elimination
- **Asset Optimization** - Image and CSS optimization
- **Compression** - Gzip compression via CloudFront

### Runtime Optimizations
- **React.memo** - Component memoization for expensive renders
- **useMemo/useCallback** - Hook-based memoization
- **Lazy Loading** - Dynamic imports for route-based code splitting

## Security Considerations

### Frontend Security
- **Content Security Policy** - Restrictive CSP headers
- **XSS Protection** - React's built-in XSS prevention
- **Dependency Scanning** - Regular security updates
- **Input Validation** - Strict JSON schema validation

### Infrastructure Security
- **HTTPS Only** - SSL/TLS encryption for all traffic
- **Origin Access Control** - Secure S3 access via CloudFront
- **Security Headers** - HSTS, X-Frame-Options, etc.
- **Access Logging** - CloudFront request logging

## Known Constraints

### Technical Constraints
- **Browser Compatibility** - Modern browsers only (ES2020+ support)
- **File Size Limits** - Browser memory constraints for large JSON files
- **Client-Side Processing** - Limited by browser performance
- **No Backend** - All processing must happen client-side

### Deployment Constraints
- **AWS Region** - Infrastructure deployed to single region
- **Domain Requirements** - Custom domain requires DNS configuration
- **CDK Version** - Locked to specific CDK version for stability

### Development Constraints
- **Node.js Version** - Requires Node.js 20.0.0 or higher
- **pnpm Requirement** - Must use pnpm for workspace management
- **TypeScript Strict Mode** - All code must pass strict type checking

## Future Technology Considerations

### Potential Additions
- **Web Workers** - For heavy JSON processing
- **IndexedDB** - For client-side data persistence
- **Service Workers** - For offline functionality
- **WebAssembly** - For performance-critical operations

### Monitoring & Analytics
- **Error Tracking** - Client-side error monitoring (privacy-compliant)
- **Performance Monitoring** - Core Web Vitals tracking
- **Usage Analytics** - Privacy-preserving usage insights

This technology stack provides a solid foundation for a privacy-first, performant web application while maintaining simplicity and developer productivity.
