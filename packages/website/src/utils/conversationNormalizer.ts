import { ConversationData, Message } from '../types';

// New conversation format structure
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
  request_metadata?: any;
}

// Type guard to detect if we're dealing with the new format
function isNewFormat(history: any[]): history is NewConversationTurn[] {
  if (history.length === 0) return false;
  
  const firstItem = history[0];
  // New format has objects with 'user', 'assistant', or 'request_metadata' keys
  // Old format has arrays of messages
  return (
    typeof firstItem === 'object' && 
    !Array.isArray(firstItem) &&
    (firstItem.hasOwnProperty('user') || 
     firstItem.hasOwnProperty('assistant') || 
     firstItem.hasOwnProperty('request_metadata'))
  );
}

// Convert new format turn to old format messages
function convertNewTurnToMessages(turn: NewConversationTurn): Message[] {
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

// Normalize conversation data to ensure backwards compatibility
export function normalizeConversationData(data: any): ConversationData {
  // If history is already in the old format (array of arrays), return as-is
  if (!isNewFormat(data.history)) {
    return data as ConversationData;
  }

  // Convert new format to old format
  const normalizedHistory: Message[][] = data.history.map((turn: NewConversationTurn) => 
    convertNewTurnToMessages(turn)
  );

  return {
    ...data,
    history: normalizedHistory,
  } as ConversationData;
}

// Utility function to detect conversation format
export function getConversationFormat(data: any): 'old' | 'new' {
  return isNewFormat(data.history) ? 'new' : 'old';
}
