# GenAI Conversation Viewer

A TypeScript-based tool for visualizing JSON conversation history from GenAI tools like Q CLI. Built with React, Vite, and Tailwind CSS v4.

## Features

- **File Upload**: Drag and drop or select JSON files containing conversation history
- **Schema Validation**: Validates uploaded files against the expected conversation schema
- **Conversation Flow**: Displays messages in chronological order with clear visual distinction between:
  - User messages (blue)
  - Tool use messages (purple) 
  - AI responses (green)
- **Tool Usage Visualization**: Shows tool calls with expandable arguments
- **Summary Dashboard**: Provides statistics and analytics about the conversation
- **Tools Panel**: Displays available tools and their specifications
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **TypeScript**: Type-safe development
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS v4**: Latest utility-first CSS framework
- **JSON Schema Validation**: Ensures data integrity

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Type Checking

Run TypeScript type checking:
```bash
npm run typecheck
```

## Usage

1. **Start the application** using `npm run dev`
2. **Upload a JSON file** by either:
   - Dragging and dropping a `.json` file onto the upload area
   - Clicking "Choose File" and selecting a file
3. **View the conversation** in the main interface with three tabs:
   - **Conversation**: Step-by-step message flow
   - **Summary**: Statistics and analytics
   - **Tools**: Available tools and their specifications

## JSON Schema

The application expects JSON files that match the GenAI conversation schema with the following required fields:

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

### Message Types

The application supports three types of messages:

1. **User/System Messages**: User input and system context
2. **Tool Use Messages**: AI tool invocations with arguments
3. **Response Messages**: AI-generated responses

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

## License

This project is provided as-is for educational and development purposes.
