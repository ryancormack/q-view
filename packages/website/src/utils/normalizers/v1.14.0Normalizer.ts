import { ConversationData, Message, ToolSpecification } from '../../types';
import { 
  V1_14_ConversationState, 
  HistoryEntry, 
  ContentBlock, 
  ToolUse, 
  ToolResult,
  Tool,
  ImageBlock,
  isToolOriginMcp
} from '../../types/v1.14.0';

export class V1_14_Normalizer {
  /**
   * Converts v1.14.0 conversation format to internal ConversationData format
   */
  static normalize(data: V1_14_ConversationState): ConversationData {
    return {
      conversation_id: data.conversation_id,
      next_message: data.next_message ? V1_14_Normalizer.convertUserMessageToString(data.next_message) : null,
      history: V1_14_Normalizer.convertHistory(data.history),
      valid_history_range: data.valid_history_range,
      transcript: V1_14_Normalizer.convertTranscript(data.transcript),
      tools: V1_14_Normalizer.convertTools(data.tools),
      context_manager: V1_14_Normalizer.convertContextManager(data.context_manager),
      context_message_length: data.context_message_length || undefined,
      latest_summary: V1_14_Normalizer.convertLatestSummary(data.latest_summary),
      model: data.model || undefined
    };
  }

  /**
   * Converts v1.14.0 history entries to v1.10.0 message arrays
   */
  private static convertHistory(history: HistoryEntry[]): Message[][] {
    return history.map(entry => V1_14_Normalizer.convertHistoryEntry(entry));
  }

  /**
   * Converts a single history entry to an array of messages
   */
  private static convertHistoryEntry(entry: HistoryEntry): Message[] {
    const messages: Message[] = [];

    // Convert user message
    const userMessage = V1_14_Normalizer.convertUserMessage(entry.user);
    messages.push(userMessage);

    // Convert assistant message(s)
    const assistantMessages = V1_14_Normalizer.convertAssistantMessage(entry.assistant);
    messages.push(...assistantMessages);

    return messages;
  }

  /**
   * Converts v1.14.0 user message to v1.10.0 format
   */
  private static convertUserMessage(user: any): Message {
    // Check if this is a ToolUseResults message instead of a regular user prompt
    if (user.content?.ToolUseResults) {
      // This is actually tool results, not a user prompt
      return {
        additional_context: user.additional_context || '',
        env_context: {
          env_state: {
            operating_system: user.env_context?.operating_system || user.env_context?.env_state?.operating_system || 'unknown',
            current_working_directory: user.env_context?.current_directory || user.env_context?.env_state?.current_working_directory || '',
            environment_variables: user.env_context?.env_state?.variables 
              ? Object.entries(user.env_context.env_state.variables).map(([k, v]) => `${k}=${v}`)
              : (user.env_context?.env_state?.environment_variables || [])
          }
        },
        content: {
          ToolUseResults: user.content.ToolUseResults
        },
        images: user.images?.map((img: ImageBlock) => `${img.image_type}:${img.data}`) || null
      };
    }

    // Extract the actual prompt content for regular user messages
    let promptContent = '';
    
    if (user.content?.Prompt?.prompt) {
      // Handle v1.10.0 style content nested in v1.14.0 structure
      promptContent = user.content.Prompt.prompt;
    } else if (user.additional_context) {
      // Fallback to additional_context if no prompt content
      promptContent = user.additional_context;
    } else if (typeof user.content === 'string') {
      // Handle direct string content
      promptContent = user.content;
    } else {
      // Last resort - try to stringify the content
      promptContent = JSON.stringify(user.content || '');
    }

    return {
      additional_context: user.additional_context || '',
      env_context: {
        env_state: {
          operating_system: user.env_context?.operating_system || user.env_context?.env_state?.operating_system || 'unknown',
          current_working_directory: user.env_context?.current_directory || user.env_context?.env_state?.current_working_directory || '',
          environment_variables: user.env_context?.env_state?.variables 
            ? Object.entries(user.env_context.env_state.variables).map(([k, v]) => `${k}=${v}`)
            : (user.env_context?.env_state?.environment_variables || [])
        }
      },
      content: {
        Prompt: {
          prompt: promptContent
        }
      },
      images: user.images?.map((img: ImageBlock) => `${img.image_type}:${img.data}`) || null
    };
  }

  /**
   * Converts v1.14.0 assistant message to v1.10.0 format messages
   */
  private static convertAssistantMessage(assistant: any): Message[] {
    const messages: Message[] = [];

    // Handle hybrid format where assistant has Response object (like v1.10.0 nested in v1.14.0)
    if (assistant.Response) {
      messages.push({
        Response: {
          message_id: assistant.Response.message_id,
          content: assistant.Response.content
        }
      });
      return messages;
    }

    // Handle hybrid format where assistant has ToolUse object
    if (assistant.ToolUse) {
      messages.push({
        ToolUse: assistant.ToolUse
      });
      return messages;
    }

    // Handle true v1.14.0 format with ContentBlock array
    if (Array.isArray(assistant.content)) {
      for (const block of assistant.content) {
        const message = V1_14_Normalizer.convertContentBlock(block, assistant.message_id);
        if (message) {
          messages.push(message);
        }
      }
    } else if (typeof assistant.content === 'string') {
      // Handle direct string content
      messages.push({
        Response: {
          message_id: assistant.message_id,
          content: assistant.content
        }
      });
    }

    return messages;
  }

  /**
   * Converts a content block to a message
   */
  private static convertContentBlock(block: ContentBlock, messageId: string): Message | null {
    switch (block.content_type) {
      case 'text':
        if (block.text) {
          return {
            Response: {
              message_id: messageId,
              content: block.text
            }
          };
        }
        break;

      case 'tool_use':
        if (block.tool_use) {
          return {
            ToolUse: {
              message_id: messageId,
              content: '', // v1.14.0 doesn't have separate content for tool use
              tool_uses: [{
                id: block.tool_use.tool_use_id,
                name: block.tool_use.name,
                orig_name: block.tool_use.name,
                args: block.tool_use.input || {},
                orig_args: block.tool_use.input || {}
              }]
            }
          };
        }
        break;

      case 'tool_result':
        if (block.tool_result) {
          // Tool results in v1.14.0 are embedded in assistant messages
          // In v1.10.0, they're typically in user messages as ToolUseResults
          // For now, we'll convert them to a text response format
          return {
            Response: {
              message_id: messageId,
              content: `Tool Result (${block.tool_result.status}): ${block.tool_result.content}`
            }
          };
        }
        break;

      default:
        console.warn(`Unknown content type: ${block.content_type}`);
        return null;
    }

    return null;
  }

  /**
   * Converts v1.14.0 transcript to v1.10.0 format
   */
  private static convertTranscript(transcript: any[]): string[] {
    return transcript.map(entry => {
      if (typeof entry === 'string') {
        return entry;
      }
      
      if (entry.role && entry.content) {
        return `${entry.role}: ${entry.content}`;
      }
      
      return String(entry);
    });
  }

  /**
   * Converts v1.14.0 tools to v1.10.0 format
   */
  private static convertTools(tools: Record<string, any[]>): Record<string, ToolSpecification[]> {
    const converted: Record<string, ToolSpecification[]> = {};

    for (const [namespace, toolArray] of Object.entries(tools)) {
      converted[namespace] = toolArray.map(tool => V1_14_Normalizer.convertTool(tool));
    }

    return converted;
  }

  /**
   * Converts a single v1.14.0 tool to v1.10.0 format
   */
  private static convertTool(tool: any): ToolSpecification {
    // Handle hybrid format where tools still have ToolSpecification wrapper (like schema-fix.json)
    if (tool.ToolSpecification) {
      // This is already in v1.10.0 format, just extract it
      return {
        name: tool.ToolSpecification.name,
        description: tool.ToolSpecification.description,
        input_schema: tool.ToolSpecification.input_schema || {
          json: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      };
    }

    // Handle pure v1.14.0 format (Tool interface)
    return {
      name: tool.name,
      description: tool.description,
      input_schema: {
        json: tool.input_schema || {
          type: 'object',
          properties: {},
          required: []
        }
      }
    };
  }

  /**
   * Converts v1.14.0 context manager to v1.10.0 format
   */
  private static convertContextManager(contextManager: any): any {
    if (!contextManager) return undefined;

    return {
      current_profile: contextManager.current_profile,
      profile_config: {
        paths: contextManager.paths || []
      }
    };
  }

  /**
   * Converts v1.14.0 latest summary to v1.10.0 format
   */
  private static convertLatestSummary(latestSummary: any): string | null {
    if (!latestSummary) return null;
    
    if (Array.isArray(latestSummary) && latestSummary.length >= 1) {
      return latestSummary[0]; // Extract just the summary text, ignore metadata
    }
    
    return String(latestSummary);
  }

  /**
   * Helper to convert user message to string for next_message field
   */
  private static convertUserMessageToString(userMessage: any): string {
    return userMessage.additional_context || '';
  }

  /**
   * Extracts v1.14.0 specific metadata for enhanced features
   */
  static extractMetadata(data: V1_14_ConversationState) {
    return {
      modelInfo: data.model_info,
      fileLineTracker: data.file_line_tracker,
      requestMetadata: V1_14_Normalizer.extractRequestMetadata(data.history),
      toolOrigins: V1_14_Normalizer.extractToolOrigins(data.tools),
      enhancedTranscript: data.transcript
    };
  }

  /**
   * Extracts request metadata from history entries
   */
  private static extractRequestMetadata(history: HistoryEntry[]) {
    return history
      .map(entry => entry.request_metadata)
      .filter(metadata => metadata !== null && metadata !== undefined);
  }

  /**
   * Extracts tool origin information
   */
  private static extractToolOrigins(tools: Record<string, any[]>) {
    const origins: Record<string, { origin: string; server?: string }> = {};

    for (const [namespace, toolArray] of Object.entries(tools)) {
      for (const tool of toolArray) {
        let toolName: string;
        let toolOrigin: any;

        // Handle hybrid format with ToolSpecification wrapper
        if (tool.ToolSpecification) {
          toolName = tool.ToolSpecification.name;
          // In hybrid format, tool_origin might not exist, default to Native
          toolOrigin = tool.ToolSpecification.tool_origin || 'Native';
        } else {
          // Handle pure v1.14.0 format
          toolName = tool.name;
          toolOrigin = tool.tool_origin || 'Native';
        }

        if (typeof toolOrigin === 'object' && toolOrigin.McpServer) {
          origins[toolName] = {
            origin: 'MCP Server',
            server: toolOrigin.McpServer
          };
        } else {
          origins[toolName] = {
            origin: 'Native'
          };
        }
      }
    }

    return origins;
  }
}
