# Q Conversation Viewer - Website Package

React frontend for visualizing GenAI conversation JSON files. Built with TypeScript, React 18, Vite, and Tailwind CSS v4.

## Features

- **File Upload**: Drag and drop or select JSON files containing conversation history
- **Schema Validation**: Validates uploaded files against the expected conversation schema
- **Conversation Flow**: Displays messages in chronological order with clear visual distinction
- **Tool Usage Visualization**: Shows tool calls with expandable arguments
- **Summary Dashboard**: Provides statistics and analytics about the conversation
- **Tools Panel**: Displays available tools and their specifications
- **Clickable Navigation**: Click tools in summary to jump to details in tools tab

## Technology Stack

- **TypeScript**: Type-safe development
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS v4**: Latest utility-first CSS framework
- **JSON Schema Validation**: Ensures data integrity

## Development

From the **monorepo root**:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm --filter @q-convo-viewer/website build

# Type checking
pnpm --filter @q-convo-viewer/website typecheck
```

From the **website package**:

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm typecheck
```

## Usage

1. **Start the application** using `pnpm dev`
2. **Upload a JSON file** by either:
   - Dragging and dropping a `.json` file onto the upload area
   - Clicking "Choose File" and selecting a file
3. **View the conversation** in the main interface with three tabs:
   - **Conversation**: Step-by-step message flow
   - **Summary**: Statistics and analytics (click tools to navigate)
   - **Tools**: Available tools and their specifications

## JSON Schema

The application expects JSON files that match the GenAI conversation schema:

```json
{
  "conversation_id": "uuid-string",
  "history": [
    [/* array of messages per turn */]
  ],
  "transcript": ["string array"],
  "tools": { /* optional tools object */ },
  "model": "model-name"
}
```

## Message Types

- **User Messages** (blue): User input and prompts
- **Tool Results** (gray): Results from tool execution
- **Tool Use Messages** (purple): AI tool invocations with arguments
- **AI Response Messages** (green): AI-generated responses

## File Structure

```
src/
├── components/           # React components
│   ├── ConversationFlow.tsx    # Main conversation display
│   ├── ConversationSummary.tsx # Statistics dashboard
│   ├── ConversationViewer.tsx  # Main viewer with tabs
│   ├── FileUpload.tsx          # File upload interface
│   ├── Header.tsx              # Application header
│   ├── JsonViewer.tsx          # JSON data display
│   ├── MessageCard.tsx         # Individual message display
│   └── ToolsPanel.tsx          # Tools information panel
├── types.ts              # TypeScript type definitions
├── App.tsx               # Main application component
├── main.tsx              # React entry point
└── index.css             # Tailwind CSS and custom styles
```

## Customization

### Styling

The application uses Tailwind CSS v4 with a custom theme defined in `src/index.css`. You can modify colors, fonts, and other design tokens in the `@theme` section.

### Adding Features

The modular component structure makes it easy to add new features:

- Add new message types by extending the `Message` union type in `types.ts`
- Create new visualization components in the `components/` directory
- Add new tabs to the `ConversationViewer` component

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
