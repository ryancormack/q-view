import { ConversationData } from '../types';
import { normalizeConversationData, getConversationFormat } from './conversationNormalizer';

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
 * Validates conversation data using flexible validation
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

    // Detect and log the conversation format
    const format = getConversationFormat(data);
    console.log(`Detected conversation format: ${format}`);

    // Normalize the data to handle different formats
    data = normalizeConversationData(data);

    // Validate data structure after normalization
    if (!validateConversationData(data)) {
      throw new DemoDataValidationError(
        'Demo data does not match expected conversation format after normalization. Please ensure the JSON contains valid conversation data.'
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