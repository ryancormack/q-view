import { ConversationData } from '../types';

const MAX_URL_LENGTH = 200000; // 200KB limit - increased to accommodate v1.14.0 format while staying well within browser limits

export type ProgressCallback = (stage: string, progress: number) => void;

/**
 * Optimizes conversation data for better compression by removing verbose content
 * while preserving ALL fields needed for version detection and functionality.
 * More aggressive optimization for v1.14.0 format due to its verbosity.
 */
function optimizeConversationData(data: ConversationData): ConversationData {
  // Create a deep copy to avoid modifying the original
  const optimized = JSON.parse(JSON.stringify(data));
  
  // Detect if this is v1.14.0 format for more aggressive optimization
  const isV1_14_Format = !!(optimized as any).file_line_tracker || !!(optimized as any).model_info;
  
  // PRESERVE ALL TOP-LEVEL FIELDS - they're needed for version detection
  // But for v1.14.0, we can be more aggressive with verbose metadata
  
  if (isV1_14_Format) {
    // More aggressive optimization for v1.14.0 format
    
    // Minimize file_line_tracker but keep it present for version detection
    if ((optimized as any).file_line_tracker) {
      (optimized as any).file_line_tracker = {};
    }
    
    // Minimize model_info but keep it present for version detection
    if ((optimized as any).model_info) {
      (optimized as any).model_info = {
        model_id: (optimized as any).model_info.model_id || 'preserved'
      };
    }
  }
  
  // Compress verbose content in history while preserving structure
  if (optimized.history && Array.isArray(optimized.history)) {
    optimized.history = optimized.history.map((entry: any) => {
      // Handle both v1.10.0 (array) and v1.14.0 (object) formats
      if (Array.isArray(entry)) {
        // v1.10.0 format - compress individual messages
        return entry.map((message: any) => {
          const compressed = { ...message };
          
          // Compress very long prompts
          if (compressed.content?.Prompt?.prompt && compressed.content.Prompt.prompt.length > 5000) {
            compressed.content.Prompt.prompt = compressed.content.Prompt.prompt.substring(0, 5000) + '...[truncated for sharing]';
          }
          
          // Compress very long additional_context
          if (compressed.additional_context && compressed.additional_context.length > 2000) {
            compressed.additional_context = compressed.additional_context.substring(0, 2000) + '...[truncated for sharing]';
          }
          
          return compressed;
        });
      } else if (entry && typeof entry === 'object') {
        // v1.14.0 format - preserve structure but be more aggressive with content
        const compressed = { ...entry };
        
        // Compress user prompt if long (more aggressive for v1.14.0)
        if (compressed.user?.content?.Prompt?.prompt && compressed.user.content.Prompt.prompt.length > 3000) {
          compressed.user = {
            ...compressed.user,
            content: {
              ...compressed.user.content,
              Prompt: {
                ...compressed.user.content.Prompt,
                prompt: compressed.user.content.Prompt.prompt.substring(0, 3000) + '...[truncated for sharing]'
              }
            },
            // Remove verbose timing fields
            timestamp: undefined
          };
        } else if (compressed.user) {
          // Even if we don't compress the prompt, remove timing data
          compressed.user = {
            ...compressed.user,
            timestamp: undefined
          };
        }
        
        // AGGRESSIVE: Remove or minimize images (can be massive - 1.6MB+ in some cases!)
        if (compressed.user?.images) {
          // For sharing, we'll replace images with a placeholder to save massive space
          compressed.user.images = ['[Images removed for sharing - original conversation had ' + (Array.isArray(compressed.user.images) ? compressed.user.images.length : 1) + ' image(s)]'];
        }
        
        // Compress assistant response if long (more aggressive for v1.14.0)
        if (compressed.assistant?.Response?.content && compressed.assistant.Response.content.length > 5000) {
          compressed.assistant = {
            ...compressed.assistant,
            Response: {
              ...compressed.assistant.Response,
              content: compressed.assistant.Response.content.substring(0, 5000) + '...[truncated for sharing]'
            }
          };
        }
        
        // AGGRESSIVE: Compress tool_use_results stdout/stderr (these can be massive!)
        if (compressed.assistant?.ToolUseResult?.tool_use_results) {
          compressed.assistant.ToolUseResult.tool_use_results = compressed.assistant.ToolUseResult.tool_use_results.map((result: any) => {
            const compressedResult = { ...result };
            
            if (compressedResult.content?.Json) {
              const json = compressedResult.content.Json;
              
              // Aggressively truncate stdout (often contains massive output)
              if (json.stdout && typeof json.stdout === 'string' && json.stdout.length > 500) {
                json.stdout = json.stdout.substring(0, 500) + '...[truncated for sharing - ' + (json.stdout.length - 500) + ' more chars]';
              }
              
              // Aggressively truncate stderr
              if (json.stderr && typeof json.stderr === 'string' && json.stderr.length > 500) {
                json.stderr = json.stderr.substring(0, 500) + '...[truncated for sharing - ' + (json.stderr.length - 500) + ' more chars]';
              }
              
              // Truncate other large content fields
              if (json.content && typeof json.content === 'string' && json.content.length > 1000) {
                json.content = json.content.substring(0, 1000) + '...[truncated for sharing]';
              }
              
              compressedResult.content.Json = json;
            }
            
            return compressedResult;
          });
        }
        
        // Minimize request_metadata but keep essential fields for v1.14.0 detection
        if (compressed.request_metadata) {
          compressed.request_metadata = {
            message_id: compressed.request_metadata.message_id,
            conversation_id: compressed.request_metadata.conversation_id,
            model_id: compressed.request_metadata.model_id,
            // Remove all verbose timing and performance fields:
            // - request_start_timestamp_ms, stream_end_timestamp_ms
            // - time_to_first_chunk, time_between_chunks
            // - user_prompt_length, response_size
            // - chat_conversation_type, message_meta_tags
            // Keep only essential identification fields
          };
        }
        
        // Minimize user env_context but preserve structure
        if (compressed.user?.env_context) {
          compressed.user.env_context = {
            env_state: {
              operating_system: compressed.user.env_context.env_state?.operating_system || 'unknown',
              current_working_directory: compressed.user.env_context.env_state?.current_working_directory || '/',
              environment_variables: [] // Remove verbose environment variables
            }
          };
        }
        
        return compressed;
      }
      
      return entry;
    });
  }
  
  // Compress tool descriptions more aggressively
  if (optimized.tools) {
    Object.keys(optimized.tools).forEach(namespace => {
      optimized.tools[namespace] = optimized.tools[namespace].map((tool: any) => {
        // Preserve ToolSpecification wrapper completely if it exists
        if (tool.ToolSpecification) {
          return {
            ToolSpecification: {
              ...tool.ToolSpecification,
              // More aggressive description compression
              description: tool.ToolSpecification.description && tool.ToolSpecification.description.length > 200
                ? tool.ToolSpecification.description.substring(0, 200) + '...'
                : tool.ToolSpecification.description,
              // Simplify input_schema for sharing (keep structure but remove verbose descriptions)
              input_schema: tool.ToolSpecification.input_schema ? {
                json: {
                  type: tool.ToolSpecification.input_schema.json?.type || 'object',
                  properties: tool.ToolSpecification.input_schema.json?.properties || {},
                  required: tool.ToolSpecification.input_schema.json?.required || []
                  // Remove verbose field descriptions
                }
              } : undefined
            }
          };
        } else {
          return {
            ...tool,
            // More aggressive description compression
            description: tool.description && tool.description.length > 200
              ? tool.description.substring(0, 200) + '...'
              : tool.description,
            // Simplify input_schema for sharing
            input_schema: tool.input_schema ? {
              type: tool.input_schema.type || 'object',
              properties: tool.input_schema.properties || {},
              required: tool.input_schema.required || []
            } : undefined
          };
        }
      });
    });
  }
  
  // For v1.14.0, also compress transcript if it's very verbose
  if (isV1_14_Format && optimized.transcript && Array.isArray(optimized.transcript)) {
    optimized.transcript = optimized.transcript.map((entry: any) => {
      if (typeof entry === 'string') {
        return entry.length > 1000 ? entry.substring(0, 1000) + '...[truncated]' : entry;
      } else if (entry && typeof entry === 'object' && entry.content) {
        return {
          role: entry.role, // Keep role for structure
          content: entry.content.length > 1000 ? entry.content.substring(0, 1000) + '...[truncated]' : entry.content
          // Remove timestamp, request_id, and other verbose metadata
        };
      }
      return entry;
    });
  }
  
  return optimized;
}

/**
 * Compresses data using streaming compression
 */
async function compressData(
  data: string, 
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  if (!('CompressionStream' in globalThis)) {
    throw new Error('CompressionStream not supported in this browser');
  }

  onProgress?.('Compressing conversation data...', 20);

  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();
  
  const chunks: Uint8Array[] = [];
  
  // Start reading compressed data
  const readPromise = (async () => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
  })();
  
  // Write data
  const encoder = new TextEncoder();
  await writer.write(encoder.encode(data));
  await writer.close();
  
  await readPromise;
  
  // Combine chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  onProgress?.('Compression complete', 60);
  return result;
}

/**
 * Decompresses data using streaming decompression
 */
async function decompressData(
  compressedData: Uint8Array, 
  onProgress?: ProgressCallback
): Promise<string> {
  if (!('DecompressionStream' in globalThis)) {
    throw new Error('DecompressionStream not supported in this browser');
  }

  onProgress?.('Decompressing conversation data...', 30);

  const stream = new DecompressionStream('gzip');
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();
  
  const chunks: Uint8Array[] = [];
  const readPromise = (async () => {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
  })();
  
  // Write compressed data
  await writer.write(compressedData as BufferSource);
  await writer.close();
  
  await readPromise;
  
  // Combine chunks and decode
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  onProgress?.('Decompression complete', 70);
  return new TextDecoder().decode(result);
}

/**
 * Creates a shareable URL from conversation data
 */
export async function createShareUrl(
  conversationData: ConversationData,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
  compressionStats?: {
    originalSize: number;
    compressedSize: number;
    ratio: string;
  };
}> {
  try {
    if (signal?.aborted) {
      throw new Error('Share operation cancelled');
    }
    
    onProgress?.('Preparing conversation data...', 5);
    
    // Optimize the data first
    const optimizedData = optimizeConversationData(conversationData);
    const jsonString = JSON.stringify(optimizedData);
    const originalSize = new TextEncoder().encode(jsonString).length;
    
    if (signal?.aborted) {
      throw new Error('Share operation cancelled');
    }
    
    onProgress?.('Starting compression...', 10);
    
    // Compress the data
    const compressed = await compressData(jsonString, onProgress);
    
    if (signal?.aborted) {
      throw new Error('Share operation cancelled');
    }
    
    onProgress?.('Encoding for URL...', 80);
    
    // Convert to base64 for URL encoding
    const base64 = btoa(String.fromCharCode(...compressed));
    const shareUrl = `${window.location.origin}${window.location.pathname}#${base64}`;
    
    // Check URL length
    if (shareUrl.length > MAX_URL_LENGTH) {
      const compressionRatio = ((1 - compressed.length / originalSize) * 100).toFixed(1);
      return {
        success: false,
        error: `Conversation is too large to share via URL (${shareUrl.length.toLocaleString()} characters). Even with optimization and ${compressionRatio}% compression, it exceeds browser limits. Try sharing a smaller section of the conversation or use the JSON export feature instead.`
      };
    }
    
    const compressionRatio = ((1 - compressed.length / originalSize) * 100).toFixed(1);
    
    onProgress?.('Share URL created successfully!', 100);
    
    console.log(`Compression: ${originalSize.toLocaleString()} → ${compressed.length.toLocaleString()} bytes (${compressionRatio}% reduction)`);
    
    return {
      success: true,
      url: shareUrl,
      compressionStats: {
        originalSize,
        compressedSize: compressed.length,
        ratio: compressionRatio
      }
    };
    
  } catch (error) {
    console.error('Failed to create share URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create share URL'
    };
  }
}

/**
 * Parses a shared conversation from URL hash
 */
export async function parseShareUrl(
  onProgress?: ProgressCallback
): Promise<{ data: ConversationData | null; error?: string }> {
  try {
    const hash = window.location.hash.slice(1); // Remove #
    
    if (!hash) {
      return { data: null, error: 'No shared conversation data found in URL' };
    }
    
    onProgress?.('Reading shared conversation...', 10);
    
    // Decode from base64
    let compressed: Uint8Array;
    try {
      const binaryString = atob(hash);
      compressed = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        compressed[i] = binaryString.charCodeAt(i);
      }
    } catch (error) {
      return { data: null, error: 'Invalid share URL format' };
    }
    
    onProgress?.('Decompressing conversation...', 20);
    
    // Decompress the data
    const jsonString = await decompressData(compressed, onProgress);
    
    onProgress?.('Parsing conversation data...', 85);
    
    // Parse JSON
    const conversationData = JSON.parse(jsonString) as ConversationData;
    
    onProgress?.('Validating conversation data...', 95);
    
    // Basic validation
    if (!conversationData.conversation_id || !conversationData.history) {
      return { data: null, error: 'Invalid conversation data in shared URL' };
    }
    
    onProgress?.('Shared conversation loaded successfully!', 100);
    
    console.log(`Decompression: ${compressed.length.toLocaleString()} → ${jsonString.length.toLocaleString()} bytes`);
    
    return { data: conversationData };
    
  } catch (error) {
    console.error('Failed to parse shared conversation:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to parse shared conversation'
    };
  }
}

/**
 * Checks if there's shared conversation data in the URL
 */
export function hasSharedData(): boolean {
  return window.location.hash.length > 1;
}

/**
 * Clears the shared conversation data from URL
 */
export function clearShareUrl(): void {
  if (window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}
