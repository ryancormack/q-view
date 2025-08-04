import { ConversationData } from '../types';

/**
 * Demo conversation metadata
 */
export interface DemoConversation {
  id: string;
  title: string;
  description: string;
  filename: string;
  tags: string[];
}

/**
 * Available demo conversations
 */
export const DEMO_CONVERSATIONS: DemoConversation[] = [
  {
    id: 'original-demo',
    title: 'Building the Q CLI Viewer',
    description: 'The original conversation that created this Q CLI conversation viewer tool, showing the complete development process.',
    filename: 'demo-conversation.json',
    tags: ['Development', 'TypeScript', 'React', 'Tool Creation']
  },
  {
    id: 'style-chat',
    title: 'Rebranding & UI Enhancement',
    description: 'A conversation focused on improving the visual design and branding of the Q CLI viewer application.',
    filename: 'style-chat.json',
    tags: ['Design', 'Branding', 'UI/UX', 'Styling']
  }
];

/**
 * Error types for demo data loading
 */
export class DemoDataError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DemoDataError';
  }
}

export class DemoDataNetworkError extends DemoDataError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'DemoDataNetworkError';
  }
}

export class DemoDataValidationError extends DemoDataError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'DemoDataValidationError';
  }
}

/**
 * Transforms style-chat format to standard conversation format
 */
function transformStyleChatFormat(data: any): ConversationData {
  const transformedHistory: any[][] = [];
  const transcript: string[] = [];

  // Transform each history item from {user, assistant} format to array format
  for (const item of data.history) {
    const turn: any[] = [];
    
    if (item.user) {
      turn.push(item.user);
      // Add to transcript
      if (item.user.content?.Prompt?.prompt) {
        transcript.push(`User: ${item.user.content.Prompt.prompt}`);
      }
    }
    
    if (item.assistant) {
      turn.push(item.assistant);
      // Add to transcript
      if (item.assistant.ToolUse?.content) {
        transcript.push(`Assistant: ${item.assistant.ToolUse.content}`);
      } else if (item.assistant.Response?.content) {
        transcript.push(`Assistant: ${item.assistant.Response.content}`);
      }
    }
    
    if (turn.length > 0) {
      transformedHistory.push(turn);
    }
  }

  return {
    ...data,
    history: transformedHistory,
    transcript: transcript.length > 0 ? transcript : data.transcript || []
  };
}

/**
 * Validates conversation data using the same logic as FileUpload component
 * This ensures consistency between uploaded files and demo data
 */
export function validateConversationData(data: any): data is ConversationData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check required fields
  if (!data.conversation_id || typeof data.conversation_id !== 'string') {
    return false;
  }

  if (!Array.isArray(data.history)) {
    return false;
  }

  // Allow transcript to be missing or empty for some formats
  if (data.transcript && !Array.isArray(data.transcript)) {
    return false;
  }

  return true;
}

/**
 * Fetches and validates demo conversation data from a specific file
 * @param filename - The filename of the demo conversation to load
 * @returns Promise that resolves to validated ConversationData
 * @throws DemoDataNetworkError for network failures
 * @throws DemoDataValidationError for invalid data format
 */
export async function loadDemoData(filename?: string): Promise<ConversationData> {
  const targetFile = filename || 'demo-conversation.json';
  
  try {
    // Fetch demo data from static asset
    const response = await fetch(`/${targetFile}`);
    
    if (!response.ok) {
      throw new DemoDataNetworkError(
        `Failed to fetch demo data: ${response.status} ${response.statusText}`
      );
    }

    // Parse JSON
    let data: any;
    try {
      data = await response.json();
    } catch (parseError) {
      throw new DemoDataValidationError(
        'Invalid JSON format in demo data file',
        parseError instanceof Error ? parseError : new Error(String(parseError))
      );
    }

    // Check if this is style-chat format and transform if needed
    if (data.history && data.history.length > 0 && 
        typeof data.history[0] === 'object' && 
        ('user' in data.history[0] || 'assistant' in data.history[0])) {
      console.log('Detected style-chat format, transforming...');
      data = transformStyleChatFormat(data);
    }

    // Validate data structure
    if (!validateConversationData(data)) {
      throw new DemoDataValidationError(
        'Demo data does not match expected conversation format. Please ensure the JSON matches the expected schema.'
      );
    }

    return data;
  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof DemoDataError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new DemoDataNetworkError(
        'Network error while loading demo data. Please check your connection and try again.',
        error
      );
    }

    // Handle other unexpected errors
    throw new DemoDataError(
      'Unexpected error while loading demo data',
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Load a specific demo conversation by ID
 */
export async function loadDemoConversation(demoId: string): Promise<ConversationData> {
  const demo = DEMO_CONVERSATIONS.find(d => d.id === demoId);
  if (!demo) {
    throw new DemoDataError(`Demo conversation with ID "${demoId}" not found`);
  }
  
  return loadDemoData(demo.filename);
}

/**
 * Utility function to check if an error is a network-related error
 * Useful for UI components to determine if they should show a "retry" option
 */
export function isNetworkError(error: Error): boolean {
  return error instanceof DemoDataNetworkError;
}

/**
 * Utility function to check if an error is a validation-related error
 * Useful for UI components to determine appropriate error messaging
 */
export function isValidationError(error: Error): boolean {
  return error instanceof DemoDataValidationError;
}

/**
 * Gets a user-friendly error message for display in the UI
 */
export function getErrorMessage(error: Error): string {
  if (error instanceof DemoDataError) {
    return error.message;
  }
  
  return 'An unexpected error occurred while loading demo data';
}