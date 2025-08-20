/**
 * Safely renders content that might be a string, object, or other type
 * Prevents React errors when trying to render objects as children
 */
export function safeRenderContent(content: any): string {
  if (content === null || content === undefined) {
    return '';
  }
  
  if (typeof content === 'string') {
    return content;
  }
  
  if (typeof content === 'number' || typeof content === 'boolean') {
    return String(content);
  }
  
  if (typeof content === 'object') {
    try {
      return JSON.stringify(content, null, 2);
    } catch (error) {
      return '[Object - could not serialize]';
    }
  }
  
  return String(content);
}

/**
 * Checks if content is safe to render directly as React children
 */
export function isSafeToRender(content: any): boolean {
  return (
    content === null ||
    content === undefined ||
    typeof content === 'string' ||
    typeof content === 'number' ||
    typeof content === 'boolean'
  );
}

/**
 * Safely extracts text content from various message content formats
 */
export function extractTextContent(content: any): string {
  if (!content) return '';
  
  // Handle direct string content
  if (typeof content === 'string') {
    return content;
  }
  
  // Handle Prompt format
  if (content.Prompt && content.Prompt.prompt) {
    return content.Prompt.prompt;
  }
  
  // Handle Response format
  if (content.Response && content.Response.content) {
    return content.Response.content;
  }
  
  // Handle ToolUse format
  if (content.ToolUse && content.ToolUse.content) {
    return content.ToolUse.content;
  }
  
  // Handle array of content items
  if (Array.isArray(content)) {
    return content
      .map(item => extractTextContent(item))
      .filter(text => text.length > 0)
      .join('\n');
  }
  
  // Handle object with text property
  if (content.text) {
    return content.text;
  }
  
  // Handle object with content property
  if (content.content) {
    return extractTextContent(content.content);
  }
  
  // Fallback to safe rendering
  return safeRenderContent(content);
}

/**
 * Filters out metadata fields from objects to prevent rendering issues
 */
export function filterMetadata(obj: any, metadataFields: string[] = []): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const defaultMetadataFields = [
    'request_id',
    'message_id',
    'request_start_timestamp_ms',
    'stream_end_timestamp_ms',
    'time_to_first_chunk',
    'user_prompt_length',
    'response_size',
    'chat_conversation_type',
    'tool_use_ids_and_names',
    'model_id',
    'message_meta_tags'
  ];
  
  const fieldsToFilter = new Set([...defaultMetadataFields, ...metadataFields]);
  
  if (Array.isArray(obj)) {
    return obj.map(item => filterMetadata(item, metadataFields));
  }
  
  const filtered: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!fieldsToFilter.has(key)) {
      filtered[key] = filterMetadata(value, metadataFields);
    }
  }
  
  return filtered;
}
