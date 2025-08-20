// Type definitions for Q CLI Conversation Schema v1.14.0

export interface V1_14_ConversationState {
  conversation_id: string;
  next_message?: UserMessage | null;
  history: HistoryEntry[];
  valid_history_range: [number, number];
  transcript: TranscriptEntry[];
  tools: Record<string, Tool[]>;
  context_manager?: ContextManager | null;
  context_message_length?: number | null;
  latest_summary?: [string, RequestMetadata] | null;
  model?: string | null;
  model_info?: ModelInfo | null;
  file_line_tracker: Record<string, FileLineTracker>;
}

export interface UserMessage {
  additional_context: string;
  env_context: UserEnvContext;
  timestamp?: string | null;
  images?: ImageBlock[] | null;
}

export interface UserEnvContext {
  operating_system: string;
  architecture: string;
  current_directory: string;
  env_state?: EnvState | null;
}

export interface EnvState {
  variables: Record<string, string>;
}

export interface ImageBlock {
  image_type: string;
  data: string;
}

export interface HistoryEntry {
  user: UserMessage;
  assistant: AssistantMessage;
  request_metadata?: RequestMetadata | null;
}

export interface AssistantMessage {
  message_id: string;
  content: ContentBlock[];
}

export interface ContentBlock {
  content_type: string;
  text?: string | null;
  tool_use?: ToolUse | null;
  tool_result?: ToolResult | null;
}

export interface ToolUse {
  tool_use_id: string;
  name: string;
  input: any; // Schema defines this as `true` but it's actually the input object
}

export interface ToolResult {
  tool_use_id: string;
  content: string;
  status: ToolResultStatus;
}

export type ToolResultStatus = 'Success' | 'Error';

export interface RequestMetadata {
  request_id?: string | null;
  message_id: string;
  conversation_id: string;
  response_size: number;
  chat_conversation_type?: ChatConversationType | null;
  tool_use_ids_and_names: Array<[string, string]>;
  model_id?: string | null;
  message_meta_tags: MessageMetaTag[];
}

export type ChatConversationType = 'NotToolUse' | 'ToolUse';
export type MessageMetaTag = 'Compact';

export interface TranscriptEntry {
  role: string;
  content: string;
  timestamp: string;
}

export interface Tool {
  name: string;
  description: string;
  input_schema: any; // Schema defines this as `true` but it's actually a JSON schema
  tool_origin: ToolOrigin;
}

export type ToolOrigin = 'Native' | { McpServer: string };

export interface ContextManager {
  current_profile: string;
  paths: string[];
}

export interface ModelInfo {
  model_id: string;
  model_name: string;
}

export interface FileLineTracker {
  last_line_count: number;
  user_lines_added: number;
  agent_lines_added: number;
}

// Type guards for v1.14.0 format
export function isV1_14_ConversationState(data: any): data is V1_14_ConversationState {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.conversation_id === 'string' &&
    Array.isArray(data.history) &&
    Array.isArray(data.valid_history_range) &&
    data.valid_history_range.length === 2 &&
    Array.isArray(data.transcript) &&
    typeof data.tools === 'object' &&
    typeof data.file_line_tracker === 'object'
  );
}

export function isHistoryEntry(entry: any): entry is HistoryEntry {
  return (
    entry &&
    typeof entry === 'object' &&
    entry.user &&
    entry.assistant &&
    typeof entry.user === 'object' &&
    typeof entry.assistant === 'object'
  );
}

export function isContentBlock(block: any): block is ContentBlock {
  return (
    block &&
    typeof block === 'object' &&
    typeof block.content_type === 'string'
  );
}

export function isToolOriginNative(origin: ToolOrigin): origin is 'Native' {
  return origin === 'Native';
}

export function isToolOriginMcp(origin: ToolOrigin): origin is { McpServer: string } {
  return typeof origin === 'object' && 'McpServer' in origin;
}
