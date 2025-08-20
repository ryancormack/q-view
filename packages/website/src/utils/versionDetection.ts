import { V1_14_ConversationState, isHistoryEntry, isContentBlock } from '../types/v1.14.0';

export const SUPPORTED_VERSIONS = ['v1.10.0', 'v1.14.0'] as const;
export type SupportedVersion = typeof SUPPORTED_VERSIONS[number];

/**
 * Detects the schema version of a conversation data object
 */
export function detectSchemaVersion(data: any): SupportedVersion {
  if (hasV1_14_Structure(data)) {
    return 'v1.14.0';
  }
  
  // Default to v1.10.0 for backwards compatibility
  return 'v1.10.0';
}

/**
 * Checks if data has v1.14.0 specific structure
 */
export function hasV1_14_Structure(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check for v1.14.0 specific top-level fields
  if (data.file_line_tracker && typeof data.file_line_tracker === 'object') {
    return true;
  }

  if (data.model_info && typeof data.model_info === 'object') {
    return true;
  }

  // Check for v1.14.0 history structure
  if (Array.isArray(data.history) && data.history.length > 0) {
    const firstEntry = data.history[0];
    
    // v1.14.0 has HistoryEntry objects with user/assistant structure
    if (isHistoryEntry(firstEntry)) {
      // Check for request_metadata presence (strong indicator of v1.14.0)
      if (firstEntry.request_metadata) {
        return true;
      }
      
      // Check for v1.14.0 specific user context structure
      if (firstEntry.user?.env_context?.architecture) {
        return true;
      }
      
      // Check for v1.14.0 assistant content structure (ContentBlock array)
      if (Array.isArray(firstEntry.assistant?.content)) {
        const hasContentBlocks = firstEntry.assistant.content.some(isContentBlock);
        if (hasContentBlocks) {
          return true;
        }
      }
      
      // Check for hybrid format: v1.14.0 structure with v1.10.0 nested content
      // This is indicated by user/assistant structure but with Response/ToolUse objects
      if ((firstEntry.assistant as any)?.Response || (firstEntry.assistant as any)?.ToolUse) {
        return true;
      }
      
      // Check if user has nested content structure (hybrid format)
      if ((firstEntry.user as any)?.content?.Prompt) {
        return true;
      }
    }
  }

  // Check for v1.14.0 transcript structure
  if (Array.isArray(data.transcript) && data.transcript.length > 0) {
    const firstTranscript = data.transcript[0];
    if (firstTranscript?.timestamp && firstTranscript?.role && firstTranscript?.content) {
      return true;
    }
  }

  // Check for v1.14.0 tools structure with tool_origin
  if (data.tools && typeof data.tools === 'object') {
    for (const toolArray of Object.values(data.tools)) {
      if (Array.isArray(toolArray) && toolArray.length > 0) {
        const firstTool = toolArray[0];
        if (firstTool?.tool_origin) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Checks if data has v1.10.0 specific structure
 */
export function hasV1_10_Structure(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check for v1.10.0 history structure (array of arrays)
  if (Array.isArray(data.history) && data.history.length > 0) {
    const firstEntry = data.history[0];
    
    // v1.10.0 can have array of arrays format
    if (Array.isArray(firstEntry)) {
      return true;
    }
    
    // v1.10.0 can have style-chat format with user/assistant but no request_metadata
    if (firstEntry?.user && firstEntry?.assistant && !firstEntry?.request_metadata) {
      return true;
    }
  }

  return false;
}

/**
 * Gets version-specific features available for a schema version
 */
export function getVersionFeatures(version: SupportedVersion): string[] {
  const featureMap: Record<SupportedVersion, string[]> = {
    'v1.10.0': [
      'basic_conversation_flow',
      'tool_usage_tracking',
      'conversation_summary'
    ],
    'v1.14.0': [
      'basic_conversation_flow',
      'tool_usage_tracking', 
      'conversation_summary',
      'enhanced_metadata',
      'file_line_tracking',
      'tool_origin_tracking',
      'structured_transcript',
      'detailed_model_info',
      'request_timing_data'
    ]
  };

  return featureMap[version] || featureMap['v1.10.0'];
}

/**
 * Checks if a specific feature is supported by a schema version
 */
export function supportsFeature(version: SupportedVersion, feature: string): boolean {
  return getVersionFeatures(version).includes(feature);
}

/**
 * Gets a human-readable description of the schema version
 */
export function getVersionDescription(version: SupportedVersion): string {
  const descriptions: Record<SupportedVersion, string> = {
    'v1.10.0': 'Legacy Q CLI conversation format with basic tool tracking',
    'v1.14.0': 'Enhanced Q CLI format with metadata, file tracking, and tool origins'
  };

  return descriptions[version] || 'Unknown schema version';
}
