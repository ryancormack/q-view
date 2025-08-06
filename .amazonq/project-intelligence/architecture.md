# System Architecture

## Architecture Overview

The Q CLI Conversation Viewer follows a **client-side single-page application (SPA)** architecture with a **privacy-first design**. The system is built as a monorepo with separate packages for the web application and AWS infrastructure.

```mermaid
graph TB
    subgraph "User Environment"
        U[User] --> B[Browser]
        F[Q CLI JSON Files] --> B
    end
    
    subgraph "Client-Side Application"
        B --> R[React SPA]
        R --> FU[File Upload Component]
        R --> CV[Conversation Viewer]
        R --> SV[Summary View]
        R --> TV[Tools View]
        
        FU --> VP[Validation & Parsing]
        VP --> DS[Data Store]
        DS --> CV
        DS --> SV
        DS --> TV
    end
    
    subgraph "AWS Infrastructure"
        CF[CloudFront CDN]
        S3[S3 Static Hosting]
        R53[Route 53 DNS]
        ACM[SSL Certificate]
        
        CF --> S3
        R53 --> CF
        ACM --> CF
    end
    
    B --> CF
```

## Architecture Characteristics

### Privacy & Security
- **Client-Side Processing**: All data processing occurs in the browser
- **No Data Transmission**: Files never leave the user's device
- **HTTPS Enforcement**: All traffic encrypted via CloudFront
- **No Tracking**: Zero analytics, cookies, or telemetry

### Performance
- **Static Site Generation**: Pre-built assets for fast loading
- **CDN Distribution**: Global content delivery via CloudFront
- **Lazy Loading**: Components loaded on demand
- **Efficient Parsing**: Streaming JSON processing for large files

### Scalability
- **Serverless Architecture**: No backend servers to manage
- **Global Distribution**: CloudFront edge locations worldwide
- **Auto-scaling**: S3 and CloudFront scale automatically

### Reliability
- **High Availability**: Multi-region AWS infrastructure
- **Error Boundaries**: React error handling prevents crashes
- **Graceful Degradation**: Fallbacks for unsupported features

## System Components

### Frontend Application (`packages/website`)

#### Component Architecture
```mermaid
graph TD
    App[App.tsx] --> Router[React Router]
    Router --> HP[HomePage]
    Router --> DP[DemoPage]
    
    HP --> Header[Header Component]
    HP --> FU[FileUpload Component]
    HP --> CV[ConversationViewer]
    
    CV --> CF[ConversationFlow]
    CV --> CS[ConversationSummary]
    CV --> TP[ToolsPanel]
    
    FU --> SV[SchemaViewer]
    FU --> JV[JsonViewer]
    
    DP --> DS[DemoSelector]
    DP --> DN[DemoNotice]
```

#### Key Design Patterns

**1. Component Composition Pattern**
- Small, focused components with single responsibilities
- Composition over inheritance for complex UI elements
- Props-based data flow for predictable state management

**2. Container/Presenter Pattern**
- Smart components handle data and business logic
- Dumb components focus on presentation
- Clear separation of concerns

**3. State Management Pattern**
- React hooks for local component state
- Context API for shared application state
- No external state management library (keeping it simple)

**4. Error Boundary Pattern**
- Graceful error handling at component boundaries
- User-friendly error messages
- Fallback UI for broken components

### Data Processing Layer

#### File Processing Pipeline
```mermaid
graph LR
    Upload[File Upload] --> Validate[Schema Validation]
    Validate --> Parse[JSON Parsing]
    Parse --> Transform[Data Transformation]
    Transform --> Store[Local Storage]
    Store --> Render[Component Rendering]
```

#### Data Transformation
- **Message Normalization**: Convert various message types to unified format
- **Tool Extraction**: Parse tool specifications and usage patterns
- **Statistics Generation**: Calculate usage metrics and conversation analytics
- **Timeline Creation**: Build chronological conversation flow

### Infrastructure Layer (`packages/infrastructure`)

#### AWS CDK Stack
```mermaid
graph TB
    CDK[CDK Stack] --> S3B[S3 Bucket]
    CDK --> CF[CloudFront Distribution]
    CDK --> R53[Route 53 Records]
    CDK --> ACM[ACM Certificate]
    
    S3B --> |Origin| CF
    ACM --> |SSL| CF
    R53 --> |DNS| CF
    
    subgraph "S3 Configuration"
        S3B --> BPA[Block Public Access]
        S3B --> ENC[S3 Encryption]
        S3B --> SSL[Enforce SSL]
    end
    
    subgraph "CloudFront Configuration"
        CF --> OAC[Origin Access Control]
        CF --> HTTPS[HTTPS Redirect]
        CF --> GZIP[Compression]
        CF --> CACHE[Caching Rules]
    end
```

## Design Principles

### 1. Privacy by Design
- **Data Minimization**: Only process necessary data
- **Local Processing**: No server-side data handling
- **Transparency**: Open source for verification
- **User Control**: Users maintain complete data ownership

### 2. Progressive Enhancement
- **Core Functionality First**: Basic file viewing works without JavaScript
- **Enhanced Features**: Advanced analytics require JavaScript
- **Graceful Degradation**: Fallbacks for unsupported browsers

### 3. Component Modularity
- **Single Responsibility**: Each component has one clear purpose
- **Loose Coupling**: Components interact through well-defined interfaces
- **High Cohesion**: Related functionality grouped together
- **Reusability**: Components designed for reuse across views

### 4. Performance Optimization
- **Code Splitting**: Load only necessary code
- **Asset Optimization**: Minified and compressed resources
- **Caching Strategy**: Aggressive caching for static assets
- **Lazy Loading**: Defer non-critical resource loading

## Data Flow Architecture

### File Processing Flow
```mermaid
sequenceDiagram
    participant U as User
    participant FU as FileUpload
    participant V as Validator
    participant P as Parser
    participant T as Transformer
    participant S as Store
    participant UI as UI Components
    
    U->>FU: Upload JSON file
    FU->>V: Validate schema
    V->>P: Parse JSON
    P->>T: Transform data
    T->>S: Store processed data
    S->>UI: Trigger re-render
    UI->>U: Display results
```

### Component Communication
```mermaid
graph TD
    PS[Parent State] --> C1[Child Component 1]
    PS --> C2[Child Component 2]
    PS --> C3[Child Component 3]
    
    C1 --> |Events| PS
    C2 --> |Events| PS
    C3 --> |Events| PS
    
    PS --> |Context| GS[Global State]
    GS --> |Props| C1
    GS --> |Props| C2
    GS --> |Props| C3
```

## Security Architecture

### Client-Side Security
- **Input Validation**: Strict JSON schema validation
- **XSS Prevention**: React's built-in XSS protection
- **Content Security Policy**: Restrictive CSP headers
- **Secure Dependencies**: Regular dependency updates

### Infrastructure Security
- **HTTPS Only**: SSL/TLS encryption for all traffic
- **Origin Access Control**: Restrict S3 access to CloudFront
- **Security Headers**: HSTS, X-Frame-Options, etc.
- **Access Logging**: CloudFront access logs for monitoring

## Deployment Architecture

### CI/CD Pipeline
```mermaid
graph LR
    GH[GitHub] --> |Push| GHA[GitHub Actions]
    GHA --> |Build| WB[Website Build]
    GHA --> |Deploy| CDK[CDK Deploy]
    
    WB --> |Assets| S3[S3 Upload]
    CDK --> |Infrastructure| AWS[AWS Resources]
    
    S3 --> |Invalidate| CF[CloudFront Cache]
```

### Environment Strategy
- **Production**: Live website at qview.chat
- **Development**: Local development server
- **No Staging**: Simple two-environment approach

This architecture ensures the application meets its core requirements of privacy, performance, and usability while maintaining a simple, maintainable codebase.
