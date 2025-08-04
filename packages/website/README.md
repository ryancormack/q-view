# Q CLI Conversation Viewer - Website

React frontend for visualizing and analyzing Amazon Q Developer conversation history from Q CLI.

## 🎯 Features

- **📁 File Upload**: Drag & drop interface for Q CLI conversation JSON files
- **🔍 Schema Validation**: Built-in validation against Q CLI conversation format
- **💬 Conversation Flow**: Visual representation of message types and flow
- **📊 Tool Analytics**: Interactive dashboard showing tool usage patterns
- **🔧 Tool Explorer**: Detailed view of available tools and their schemas
- **🎨 Q CLI Branding**: Orange-themed design matching Amazon Q Developer

## 🏗️ Architecture

### Components

- **Header**: Navigation with Q CLI branding and demo mode indicator
- **FileUpload**: Drag & drop interface with format validation
- **ConversationViewer**: Main viewer with tabbed interface
- **SchemaViewer**: Modal for displaying JSON schema
- **DemoNotice**: Banner for demo mode indication

### Pages

- **HomePage**: Main upload interface and feature overview
- **DemoPage**: Demo mode with sample conversation data

### Utils

- **demoDataLoader**: Handles loading and validation of demo data
- **validation**: JSON schema validation utilities

## 🎨 Design System

### Color Scheme

- **Primary Orange**: `#f97316` - Main Q CLI brand color
- **Secondary Blue**: `#3b82f6` - For demo and secondary actions
- **Purple**: `#a855f7` - For technical/schema content
- **Success Green**: `#22c55e` - For AI responses
- **Gray**: Various shades for neutral content

### Message Type Indicators

- **🔵 User Messages**: Blue left border, light blue background
- **🟣 Tool Use**: Purple left border, light purple background
- **⚫ Tool Results**: Gray left border, light gray background
- **🟢 AI Responses**: Green left border, light green background

## 🛠️ Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### File Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Main navigation header
│   ├── FileUpload.tsx  # File upload interface
│   ├── ConversationViewer.tsx  # Main conversation display
│   ├── SchemaViewer.tsx        # JSON schema modal
│   └── ...
├── pages/              # Route components
│   ├── HomePage.tsx    # Main upload page
│   └── DemoPage.tsx    # Demo mode page
├── utils/              # Utility functions
│   ├── demoDataLoader.ts  # Demo data handling
│   └── validation.ts      # Schema validation
├── types.ts            # TypeScript type definitions
├── index.css           # Global styles and theme
└── main.tsx           # Application entry point
```

## 📋 Q CLI Data Format

The application expects JSON files with this structure:

```typescript
interface ConversationData {
  conversation_id: string;
  history: MessageTurn[][];
  transcript: string[];
  tools?: {
    [namespace: string]: ToolSpecification[];
  };
  model?: string;
  // ... other optional fields
}
```

### Message Types

1. **User/System Messages**: User prompts and system context
2. **Tool Use Messages**: Q Developer invoking tools with parameters
3. **Tool Result Messages**: Results returned from tool execution
4. **Response Messages**: Q Developer's text responses

## 🎯 Usage Flow

1. **Upload**: User drags/drops or selects Q CLI conversation JSON
2. **Validation**: File is validated against expected schema
3. **Processing**: Conversation data is parsed and analyzed
4. **Visualization**: Three-tab interface displays:
   - **Conversation**: Chronological message flow
   - **Summary**: Tool usage statistics and patterns
   - **Tools**: Detailed tool specifications

## 🔧 Configuration

### Vite Configuration

- React plugin for JSX support
- Tailwind CSS v4 integration
- TypeScript support
- Development server with HMR

### Tailwind Configuration

- Custom orange color palette for Q CLI branding
- Extended color system for message types
- Custom utility classes for conversation styling
- Responsive design breakpoints

## 🚀 Deployment

The website is built as a static React application and deployed to S3 + CloudFront via the infrastructure package.

Build output includes:
- Optimized JavaScript bundles
- CSS with Tailwind utilities
- Static assets (images, fonts)
- Demo conversation data

## 📊 Analytics & Insights

The viewer provides several analytical views:

- **Tool Usage Frequency**: Which tools are used most often
- **Conversation Patterns**: How conversations typically flow
- **Tool Parameter Analysis**: Common parameter patterns
- **Message Type Distribution**: Balance of different message types

## 🎨 Customization

### Theming

Colors and styling can be customized via:
- CSS custom properties in `index.css`
- Tailwind theme configuration
- Component-level styling overrides

### Message Rendering

Message display can be customized by:
- Modifying message type components
- Adjusting visual indicators
- Customizing content formatting

---

**Built with**: React 18, TypeScript, Vite, Tailwind CSS v4
