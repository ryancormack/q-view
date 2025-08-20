import { ConversationData, Message, ConversationWithMetadata } from '../types';
import { detectSchemaVersion } from './versionDetection';
import { normalizeWithVersion, NormalizationResult } from './schemaVersioning';

// Legacy normalization functions for backwards compatibility
// These are now used by the v1.10.0 normalizer in the versioning system

// New conversation format structure with request metadata
interface NewConversationTurn {
  user?: {
    additional_context?: string;
    env_context?: any;
    content: any;
    images?: string[] | null;
  };
  assistant?: {
    ToolUse?: {
      message_id: string;
      content: string;
      tool_uses: Array<{
        id: string;
        name: string;
        orig_name: string;
        args: Record<string, any>;
        orig_args: Record<string, any>;
      }>;
    };
    Response?: {
      message_id: string;
      content: string;
    };
  };
  request_metadata?: {
    request_id?: string;
    message_id?: string;
    request_start_timestamp_ms?: number;
    stream_end_timestamp_ms?: number;
    time_to_first_chunk?: number;
    user_prompt_length?: number;
    response_size?: number;
    chat_conversation_type?: string;
    tool_use_ids_and_names?: Array<{id: string; name: string}>;
    model_id?: string;
    message_meta_tags?: string[];
    [key: string]: any; // Allow for additional metadata fields
  };
}

// Alternative format where history items are objects with metadata mixed in
interface AlternativeConversationItem {
  // Message content fields
  additional_context?: string;
  env_context?: any;
  content?: any;
  images?: string[] | null;
  ToolUse?: any;
  Response?: any;
  
  // Metadata fields that should be filtered out
  request_id?: string;
  message_id?: string;
  request_start_timestamp_ms?: number;
  stream_end_timestamp_ms?: number;
  time_to_first_chunk?: number;
  user_prompt_length?: number;
  response_size?: number;
  chat_conversation_type?: string;
  tool_use_ids_and_names?: Array<{id: string; name: string}>;
  model_id?: string;
  message_meta_tags?: string[];
  [key: string]: any;
}

// Type guard to detect if we're dealing with the new structured format
function isNewStructuredFormat(history: any[]): history is NewConversationTurn[] {
  if (history.length === 0) return false;
  
  const firstItem = history[0];
  // New structured format has objects with 'user', 'assistant', or 'request_metadata' keys
  return (
    typeof firstItem === 'object' && 
    !Array.isArray(firstItem) &&
    (firstItem.hasOwnProperty('user') || 
     firstItem.hasOwnProperty('assistant') || 
     firstItem.hasOwnProperty('request_metadata'))
  );
}

// Type guard to detect if we're dealing with the alternative format (metadata mixed with message data)
function isAlternativeFormat(history: any[]): history is AlternativeConversationItem[] {
  if (history.length === 0) return false;
  
  const firstItem = history[0];
  // Alternative format has objects with metadata fields mixed in
  return (
    typeof firstItem === 'object' && 
    !Array.isArray(firstItem) &&
    !firstItem.hasOwnProperty('user') &&
    !firstItem.hasOwnProperty('assistant') &&
    (firstItem.hasOwnProperty('request_id') || 
     firstItem.hasOwnProperty('message_id') ||
     firstItem.hasOwnProperty('content') ||
     firstItem.hasOwnProperty('ToolUse') ||
     firstItem.hasOwnProperty('Response'))
  );
}

// Metadata fields that should be filtered out when converting messages
const METADATA_FIELDS = new Set([
  'request_id',
  'message_id', // Note: this conflicts with message_id in ToolUse/Response, handle carefully
  'request_start_timestamp_ms',
  'stream_end_timestamp_ms',
  'time_to_first_chunk',
  'user_prompt_length',
  'response_size',
  'chat_conversation_type',
  'tool_use_ids_and_names',
  'model_id',
  'message_meta_tags'
]);

// Convert new structured format turn to old format messages
function convertNewStructuredTurnToMessages(turn: NewConversationTurn): Message[] {
  const messages: Message[] = [];

  // Add user message if present
  if (turn.user) {
    const userMessage: Message = {
      additional_context: turn.user.additional_context,
      env_context: turn.user.env_context,
      content: turn.user.content,
      images: turn.user.images,
    };
    messages.push(userMessage);
  }

  // Add assistant message if present
  if (turn.assistant) {
    if (turn.assistant.ToolUse) {
      const toolUseMessage: Message = {
        ToolUse: turn.assistant.ToolUse,
      };
      messages.push(toolUseMessage);
    }
    
    if (turn.assistant.Response) {
      const responseMessage: Message = {
        Response: turn.assistant.Response,
      };
      messages.push(responseMessage);
    }
  }

  return messages;
}

// Convert alternative format item to old format message, filtering out metadata
function convertAlternativeItemToMessage(item: AlternativeConversationItem): Message | null {
  // Create a clean copy without metadata fields
  const cleanItem: any = {};
  
  for (const [key, value] of Object.entries(item)) {
    // Skip metadata fields, but preserve message_id if it's part of ToolUse or Response
    if (METADATA_FIELDS.has(key)) {
      // Special handling for message_id - only skip if it's top-level metadata
      if (key === 'message_id' && !item.ToolUse && !item.Response) {
        continue;
      }
      if (key !== 'message_id') {
        continue;
      }
    }
    cleanItem[key] = value;
  }

  // If the item has ToolUse or Response, it's a structured message
  if (cleanItem.ToolUse) {
    return { ToolUse: cleanItem.ToolUse };
  }
  
  if (cleanItem.Response) {
    return { Response: cleanItem.Response };
  }
  
  // If it has content, it's likely a user message
  if (cleanItem.content) {
    return {
      additional_context: cleanItem.additional_context,
      env_context: cleanItem.env_context,
      content: cleanItem.content,
      images: cleanItem.images,
    };
  }
  
  // If we can't identify the message type, return null to skip it
  console.warn('Could not identify message type for item:', cleanItem);
  return null;
}

// Group alternative format items into turns
function groupAlternativeItemsIntoTurns(items: AlternativeConversationItem[]): Message[][] {
  const turns: Message[][] = [];
  let currentTurn: Message[] = [];
  
  for (const item of items) {
    const message = convertAlternativeItemToMessage(item);
    if (!message) continue;
    
    // Start a new turn when we encounter a user message (has content field)
    if ('content' in message && message.content) {
      // If we have messages in the current turn, save it
      if (currentTurn.length > 0) {
        turns.push(currentTurn);
      }
      // Start a new turn with this user message
      currentTurn = [message];
    } else {
      // Add assistant messages (ToolUse/Response) to current turn
      currentTurn.push(message);
    }
  }
  
  // Don't forget the last turn
  if (currentTurn.length > 0) {
    turns.push(currentTurn);
  }
  
  return turns;
}

// Normalize conversation data to ensure backwards compatibility
export function normalizeConversationData(data: any): ConversationData {
  // If history is already in the old format (array of arrays), return as-is
  if (Array.isArray(data.history) && data.history.length > 0 && Array.isArray(data.history[0])) {
    return data as ConversationData;
  }

  let normalizedHistory: Message[][];

  // Handle new structured format
  if (isNewStructuredFormat(data.history)) {
    console.log('Detected new structured format, converting...');
    normalizedHistory = data.history.map((turn: NewConversationTurn) => 
      convertNewStructuredTurnToMessages(turn)
    );
  }
  // Handle alternative format (metadata mixed with message data)
  else if (isAlternativeFormat(data.history)) {
    console.log('Detected alternative format with mixed metadata, converting...');
    normalizedHistory = groupAlternativeItemsIntoTurns(data.history);
  }
  // Handle legacy style-chat format (for backwards compatibility)
  else if (data.history.length > 0 && 
           typeof data.history[0] === 'object' && 
           ('user' in data.history[0] || 'assistant' in data.history[0])) {
    console.log('Detected legacy style-chat format, converting...');
    normalizedHistory = data.history.map((turn: any) => {
      const messages: Message[] = [];
      if (turn.user) messages.push(turn.user);
      if (turn.assistant) messages.push(turn.assistant);
      return messages;
    });
  }
  // Unknown format - try to handle gracefully
  else {
    console.warn('Unknown conversation format, attempting basic conversion...');
    normalizedHistory = data.history.map((item: any) => {
      if (Array.isArray(item)) {
        return item; // Already in correct format
      }
      return [item]; // Wrap single items in arrays
    });
  }

  return {
    ...data,
    history: normalizedHistory,
  } as ConversationData;
}

// Utility function to detect conversation format
export function getConversationFormat(data: any): 'old' | 'new-structured' | 'alternative' | 'legacy-style-chat' | 'unknown' {
  if (!data.history || !Array.isArray(data.history) || data.history.length === 0) {
    return 'unknown';
  }

  // Check if already in old format
  if (Array.isArray(data.history[0])) {
    return 'old';
  }

  // Check for new structured format
  if (isNewStructuredFormat(data.history)) {
    return 'new-structured';
  }

  // Check for alternative format
  if (isAlternativeFormat(data.history)) {
    return 'alternative';
  }

  // Check for legacy style-chat format
  const firstItem = data.history[0];
  if (typeof firstItem === 'object' && 
      ('user' in firstItem || 'assistant' in firstItem)) {
    return 'legacy-style-chat';
  }

  return 'unknown';
}

// Utility function to extract metadata from conversation data
export function extractConversationMetadata(data: any): any {
  const metadata: any = {};
  
  if (isNewStructuredFormat(data.history)) {
    // Extract metadata from new structured format
    for (const turn of data.history) {
      if (turn.request_metadata) {
        Object.assign(metadata, turn.request_metadata);
      }
    }
  } else if (isAlternativeFormat(data.history)) {
    // Extract metadata from alternative format
    for (const item of data.history) {
      for (const field of METADATA_FIELDS) {
        if (item[field] !== undefined) {
          metadata[field] = item[field];
        }
      }
    }
  }
  
  return metadata;
}

/**
 * New version-aware normalization function
 * This is the main entry point for conversation normalization
 */
export async function normalizeConversationWithVersion(data: any): Promise<ConversationWithMetadata> {
  // Detect the schema version
  const detectedVersion = detectSchemaVersion(data);
  
  // Use the version-specific normalizer
  const result: NormalizationResult = await normalizeWithVersion(data, detectedVersion);
  
  return {
    data: result.normalized,
    metadata: {
      detectedVersion: result.detectedVersion,
      originalFormat: result.originalFormat,
      validation: result.validation,
      versionSpecificData: result.metadata
    }
  };
}
