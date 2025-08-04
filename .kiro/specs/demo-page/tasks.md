# Implementation Plan

- [x] 1. Set up project dependencies and routing infrastructure

  - Install react-router-dom package for client-side routing
  - Configure Vite to handle client-side routing with fallback to index.html
  - _Requirements: 1.1, 2.3_

- [x] 2. Move and prepare demo conversation data

  - Move convo.json from root to packages/website/public/demo-conversation.json
  - Verify the demo data is accessible as a static asset
  - _Requirements: 4.1, 4.2_

- [x] 3. Create demo data loading utility

  - Implement demoDataLoader.ts with functions to fetch and validate demo data
  - Add error handling for network failures and invalid data
  - Reuse existing validation logic from FileUpload component
  - _Requirements: 1.2, 4.3, 4.4_

- [x] 4. Extract HomePage component from existing App

  - Create new HomePage.tsx component containing current App logic
  - Move file upload and conversation viewing logic to HomePage
  - Maintain all existing functionality and state management
  - _Requirements: 1.4, 2.2_

- [x] 5. Create DemoNotice component

  - Implement banner component explaining demo nature
  - Add navigation button to return to main upload page
  - Style with appropriate colors and prominence
  - Ensure accessibility with proper ARIA labels
  - _Requirements: 2.1, 2.2_

- [x] 6. Create DemoPage component

  - Implement main demo page component that loads demo data
  - Handle loading states and error conditions gracefully
  - Render ConversationViewer with pre-loaded demo data
  - Include DemoNotice banner at the top
  - _Requirements: 1.1, 1.2, 1.3, 2.1_

- [x] 7. Modify Header component for demo mode

  - Add optional isDemoMode prop to Header component
  - Display demo indicator when in demo mode
  - Maintain existing reset functionality for main page
  - Update styling to distinguish demo from main page
  - _Requirements: 2.1_

- [x] 8. Update App component with routing

  - Replace existing App logic with React Router setup
  - Configure routes for "/" (HomePage) and "/demo" (DemoPage)
  - Ensure proper navigation between routes
  - Maintain existing global styles and layout
  - _Requirements: 1.1, 2.2, 2.3_

- [x] 9. Update Vite configuration for routing

  - Configure Vite dev server to handle client-side routing
  - Set up fallback to index.html for unknown routes
  - Ensure demo page works in both development and production
  - _Requirements: 2.3, 2.4_

- [x] 10. Test demo page functionality

  - Verify demo page loads with conversation data
  - Test all three tabs (Conversation, Summary, Tools) display correctly
  - Confirm tool navigation from summary to tools works
  - Validate error handling for demo data loading failures
  - _Requirements: 1.3, 3.1, 3.2, 3.3, 3.4_

- [x] 11. Update package.json and build configuration

  - Add react-router-dom to dependencies
  - Ensure build process includes demo conversation file
  - Verify production build works with routing
  - _Requirements: 4.1_

- [x] 12. Add navigation between main and demo pages
  - Add link to demo page from main page
  - Ensure demo notice provides clear path back to main page
  - Test navigation flow works smoothly
  - _Requirements: 2.2_
