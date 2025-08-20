export interface EnvContext {
  env_state: {
    operating_system: string;
    current_working_directory: string;
    environment_variables: string[];
  };
}

export interface PromptContent {
  Prompt: {
    prompt: string;
  };
}

export interface ToolUseResult {
  tool_use_id: string;
  content: Array<{
    Json?: any;
    Text?: string;
  }>;
  status: 'Success' | 'Error';
}

export interface ToolUseResultsContent {
  ToolUseResults: {
    tool_use_results: ToolUseResult[];
  };
}

export interface UserSystemMessage {
  additional_context?: string;
  env_context?: EnvContext;
  content: PromptContent | ToolUseResultsContent;
  images?: string[] | null;
}

export interface ToolUse {
  message_id: string;
  content: string;
  tool_uses: Array<{
    id: string;
    name: string;
    orig_name: string;
    args: Record<string, any>;
    orig_args: Record<string, any>;
  }>;
}

export interface ToolUseMessage {
  ToolUse: ToolUse;
}

export interface ResponseMessage {
  Response: {
    message_id: string;
    content: string;
  };
}

export type Message = UserSystemMessage | ToolUseMessage | ResponseMessage;

export interface ToolSpecification {
  name: string;
  description: string;
  input_schema?: {
    json: {
      $schema?: string;
      type: string;
      properties?: Record<string, any>;
      required?: string[];
      [key: string]: any;
    };
  };
}

export interface ToolSpecificationWrapper {
  ToolSpecification: ToolSpecification;
}

export type ToolEntry = ToolSpecification | ToolSpecificationWrapper;

export interface ContextConfig {
  paths?: string[];
  hooks?: Record<string, any>;
}

export interface ContextManager {
  max_context_files_size?: number;
  global_config?: ContextConfig;
  current_profile?: string;
  profile_config?: ContextConfig;
}

export interface ConversationData {
  conversation_id: string;
  next_message?: string | null;
  history: Message[][];
  valid_history_range?: [number, number];
  transcript: string[];
  tools?: Record<string, ToolEntry[]>;
  context_manager?: ContextManager;
  context_message_length?: number;
  latest_summary?: string | null;
  model?: string;
}

// Extended conversation data with versioning metadata
export interface ConversationWithMetadata {
  data: ConversationData;
  metadata: {
    detectedVersion: string;
    originalFormat: string;
    validation: {
      isValid: boolean;
      errors: string[];
      warnings: string[];
    };
    versionSpecificData?: any;
  };
}

// Helper type guards
export function isUserSystemMessage(message: Message): message is UserSystemMessage {
  return 'content' in message && !('ToolUse' in message) && !('Response' in message);
}

export function isToolUseMessage(message: Message): message is ToolUseMessage {
  return 'ToolUse' in message;
}

export function isResponseMessage(message: Message): message is ResponseMessage {
  return 'Response' in message;
}

export function isPromptContent(content: PromptContent | ToolUseResultsContent): content is PromptContent {
  return 'Prompt' in content;
}

export function isToolUseResultsContent(content: PromptContent | ToolUseResultsContent): content is ToolUseResultsContent {
  return 'ToolUseResults' in content;
}
