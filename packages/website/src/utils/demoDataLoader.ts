import { ConversationData } from '../types';

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

  if (!Array.isArray(data.transcript)) {
    return false;
  }

  return true;
}

/**
 * Fetches and validates demo conversation data from the static asset
 * @returns Promise that resolves to validated ConversationData
 * @throws DemoDataNetworkError for network failures
 * @throws DemoDataValidationError for invalid data format
 */
export async function loadDemoData(): Promise<ConversationData> {
  try {
    // Fetch demo data from static asset
    const response = await fetch('/demo-conversation.json');
    
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