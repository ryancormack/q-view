# Demo Page Design Document

## Overview

The demo page feature adds a new route (`/demo`) to the existing GenAI Conversation Viewer application. This page will pre-load the example conversation data from `convo.json` and display it using the existing conversation viewer components, providing users with an immediate demonstration of the application's capabilities.

## Architecture

### Routing Structure
The application will use React Router to handle client-side routing:
- `/` - Main application with file upload interface
- `/demo` - Demo page with pre-loaded conversation data

### Component Hierarchy
```
App (with Router)
├── Routes
│   ├── Route "/" → HomePage
│   └── Route "/demo" → DemoPage
│
HomePage
├── Header
├── FileUpload (when no data)
└── ConversationViewer (when data loaded)

DemoPage  
├── Header (with demo indicator)
├── DemoNotice (banner explaining demo)
└── ConversationViewer (with pre-loaded data)
```

### Data Flow
1. Demo page loads and imports conversation data from static asset
2. Data is validated using existing validation logic
3. ConversationViewer receives pre-loaded data as props
4. All existing functionality works identically to uploaded data

## Components and Interfaces

### New Components

#### DemoPage Component
```typescript
interface DemoPageProps {}

export function DemoPage(): JSX.Element
```
- Loads demo conversation data from static asset
- Handles data validation and error states
- Renders ConversationViewer with demo data
- Displays demo notice banner

#### DemoNotice Component
```typescript
interface DemoNoticeProps {
  onGoToUpload: () => void;
}

export function DemoNotice({ onGoToUpload }: DemoNoticeProps): JSX.Element
```
- Displays informational banner about demo data
- Provides navigation back to main upload page
- Styled to be prominent but not intrusive

### Modified Components

#### App Component
- Add React Router setup
- Handle routing between main page and demo page
- Maintain existing functionality for main page

#### Header Component
- Add optional demo indicator prop
- Show different styling/text when in demo mode
- Maintain existing reset functionality

### Static Assets

#### Demo Data Location
- Move `convo.json` to `packages/website/public/demo-conversation.json`
- This allows the file to be served as a static asset
- Accessible via `/demo-conversation.json` URL

## Data Models

### Demo Data Loading
```typescript
interface DemoDataLoader {
  loadDemoData(): Promise<ConversationData>;
  validateDemoData(data: unknown): ConversationData;
}
```

The demo data will be loaded using the same validation logic as user-uploaded files, ensuring consistency and catching any data format issues.

## Error Handling

### Demo Data Loading Errors
- Network errors when fetching demo data
- Invalid JSON format in demo file
- Schema validation failures
- Display user-friendly error messages with fallback options

### Error Recovery
- Provide "Try Again" button for network errors
- Offer navigation to main upload page as fallback
- Log errors for debugging while showing graceful UI

## Testing Strategy

### Component Testing
- DemoPage component renders correctly
- DemoNotice component displays proper messaging
- Navigation between routes works correctly
- Demo data loads and validates properly

### Integration Testing
- Full demo page workflow from load to interaction
- All ConversationViewer features work with demo data
- Tool navigation from summary to tools tab functions
- Error handling displays appropriate messages

### User Acceptance Testing
- Demo page loads quickly and displays conversation
- All tabs (Conversation, Summary, Tools) show data
- Tool clicking navigation works as expected
- Demo notice is clear and helpful

## Implementation Considerations

### Performance
- Demo data is loaded once and cached
- Static asset serving is efficient
- No impact on main application performance

### Maintainability
- Demo data file can be easily replaced
- Component reuse maximizes code sharing
- Clear separation between demo and main functionality

### Accessibility
- Demo notice is screen reader accessible
- All existing accessibility features maintained
- Keyboard navigation works on demo page

### SEO and Sharing
- Demo page has appropriate meta tags
- Shareable URL works consistently
- Clear page title indicates demo nature

## File Structure Changes

```
packages/website/
├── public/
│   └── demo-conversation.json (moved from root convo.json)
├── src/
│   ├── components/
│   │   ├── DemoNotice.tsx (new)
│   │   └── Header.tsx (modified)
│   ├── pages/
│   │   ├── HomePage.tsx (new - extracted from App.tsx)
│   │   └── DemoPage.tsx (new)
│   ├── utils/
│   │   └── demoDataLoader.ts (new)
│   └── App.tsx (modified for routing)
```

## Dependencies

### New Dependencies
- `react-router-dom` - Client-side routing
- No additional build dependencies required

### Existing Dependencies
- All existing functionality uses current dependencies
- ConversationViewer and related components unchanged
- Validation logic reused from existing implementation