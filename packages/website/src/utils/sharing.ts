import { ConversationData } from '../types';

const MAX_URL_LENGTH = 200000; // 200KB limit - increased to accommodate v1.14.0 format while staying well within browser limits

export type ProgressCallback = (stage: string, progress: number) => void;

/**
 * Optimizes conversation data for better compression by removing verbose content
 * while preserving ALL fields needed for version detection and functionality.
 * Ultra-aggressive optimization for maximum shareability.
 */
function optimizeConversationData(data: ConversationData): ConversationData {
  // Create a deep copy to avoid modifying the original
  const optimized = JSON.parse(JSON.stringify(data));
  
  // Detect if this is v1.14.0 format for more aggressive optimization
  const isV1_14_Format = !!(optimized as any).file_line_tracker || !!(optimized as any).model_info;
  
  console.log(`Format detection: isV1_14_Format = ${isV1_14_Format}`);
  
  // Log what fields are actually present
  const presentFields: any = {};
  Object.keys(optimized).forEach(key => {
    const size = JSON.stringify((optimized as any)[key]).length;
    if (size > 1000) { // Only log fields > 1KB
      presentFields[key] = (size / 1024).toFixed(1) + 'KB';
    }
  });
  console.log('Large fields present:', presentFields);
  
  // ULTRA-AGGRESSIVE: Remove large redundant fields for ALL formats (not just v1.14.0)
  const fieldsToRemove = ['transcript', 'latest_summary', 'context_manager', 'valid_history_range', 'context_message_length', 'next_message', 'file_line_tracker'];
  
  fieldsToRemove.forEach(field => {
    if ((optimized as any)[field]) {
      const size = JSON.stringify((optimized as any)[field]).length;
      console.log(`Removing ${field}: ${(size / 1024).toFixed(1)}KB`);
      delete (optimized as any)[field];
    }
  });
  
  // Minimize model_info
  if ((optimized as any).model_info) {
    (optimized as any).model_info = {
      model_id: (optimized as any).model_info.model_id || 'preserved'
    };
  }
  
  // ULTRA-AGGRESSIVE: Minimize tools definitions (63KB -> ~5KB)
  if (optimized.tools) {
    const toolsSizeBefore = JSON.stringify(optimized.tools).length;
    console.log(`Tools size before compression: ${(toolsSizeBefore / 1024).toFixed(1)}KB`);
    
    Object.keys(optimized.tools).forEach(namespace => {
      optimized.tools[namespace] = optimized.tools[namespace].map((tool: any) => {
        return {
          name: tool.name,
          description: tool.description && tool.description.length > 100
            ? tool.description.substring(0, 100) + '...'
            : tool.description,
          // Remove verbose input_schema entirely for sharing - not needed for viewing
          input_schema: { type: 'object', properties: {}, required: [] }
        };
      });
    });
    
    const toolsSizeAfter = JSON.stringify(optimized.tools).length;
    console.log(`Tools size after compression: ${(toolsSizeAfter / 1024).toFixed(1)}KB (saved ${((toolsSizeBefore - toolsSizeAfter) / 1024).toFixed(1)}KB)`);
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
          if (compressed.content?.Prompt?.prompt && compressed.content.Prompt.prompt.length > 3000) {
            compressed.content.Prompt.prompt = compressed.content.Prompt.prompt.substring(0, 3000) + '...[truncated for sharing]';
          }
          
          // Compress very long additional_context
          if (compressed.additional_context && compressed.additional_context.length > 1000) {
            compressed.additional_context = compressed.additional_context.substring(0, 1000) + '...[truncated for sharing]';
          }
          
          return compressed;
        });
      } else if (entry && typeof entry === 'object') {
        // v1.14.0 format - ultra-aggressive optimization
        const compressed = { ...entry };
        
        // ULTRA-AGGRESSIVE: User content optimization
        if (compressed.user) {
          // Keep only essential content, remove all metadata
          compressed.user = {
            content: compressed.user.content
            // Remove: timestamp, additional_context, env_context, images
          };
          
          // Replace images with minimal placeholder
          if (entry.user.images) {
            compressed.user.images = ['[removed]'];
          }
          
          // ULTRA-AGGRESSIVE: Tool results compression
          if (compressed.user.content?.ToolUseResults?.tool_use_results) {
            compressed.user.content.ToolUseResults.tool_use_results = compressed.user.content.ToolUseResults.tool_use_results.map((result: any) => {
              return {
                tool_use_id: result.tool_use_id,
                status: result.status,
                content: result.content ? { '0': { Text: '[Tool result truncated for sharing]' } } : undefined
              };
            });
          }
        }
        
        // ULTRA-AGGRESSIVE: Assistant content optimization
        if (compressed.assistant) {
          // Aggressively truncate long responses (6-7KB -> 2KB max)
          if (compressed.assistant.Response?.content && compressed.assistant.Response.content.length > 2000) {
            compressed.assistant.Response.content = compressed.assistant.Response.content.substring(0, 2000) + '...[truncated for sharing]';
          }
          
          // Aggressively truncate ToolUse content
          if (compressed.assistant.ToolUse?.content && compressed.assistant.ToolUse.content.length > 1000) {
            compressed.assistant.ToolUse.content = compressed.assistant.ToolUse.content.substring(0, 1000) + '...[truncated for sharing]';
          }
          
          // ULTRA-AGGRESSIVE: Tool use compression
          if (compressed.assistant.ToolUse?.tool_uses) {
            compressed.assistant.ToolUse.tool_uses = compressed.assistant.ToolUse.tool_uses.map((tool: any) => {
              return {
                id: tool.id,
                name: tool.name,
                args: tool.args && JSON.stringify(tool.args).length > 500
                  ? { summary: '[Large args truncated for sharing]' }
                  : tool.args
              };
            });
          }
        }
        
        // ULTRA-AGGRESSIVE: Remove request_metadata entirely (not needed for viewing)
        // This saves significant space across all entries
        delete compressed.request_metadata;
        
        return compressed;
      }
      
      return entry;
    });
  }
  
  return optimized;
}

/**
 * Compresses data using deflate compression (slightly better than gzip)
 */
async function compressData(
  data: string, 
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  if (!('CompressionStream' in globalThis)) {
    throw new Error('CompressionStream not supported in this browser');
  }

  onProgress?.('Compressing conversation data...', 20);

  // Use deflate instead of gzip for slightly better compression
  const stream = new CompressionStream('deflate');
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
 * Decompresses data using deflate decompression
 */
async function decompressData(
  compressedData: Uint8Array, 
  onProgress?: ProgressCallback
): Promise<string> {
  if (!('DecompressionStream' in globalThis)) {
    throw new Error('DecompressionStream not supported in this browser');
  }

  onProgress?.('Decompressing conversation data...', 30);

  // Use deflate to match compression
  const stream = new DecompressionStream('deflate');
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
    
    // Calculate original size before optimization
    const originalSize = new TextEncoder().encode(JSON.stringify(conversationData)).length;
    
    // Optimize the data first
    const optimizedData = optimizeConversationData(conversationData);
    const jsonString = JSON.stringify(optimizedData);
    const optimizedSize = new TextEncoder().encode(jsonString).length;
    
    // Debug logging to see what's happening
    console.log(`Optimization: ${(originalSize / 1024).toFixed(1)}KB → ${(optimizedSize / 1024).toFixed(1)}KB (saved ${((originalSize - optimizedSize) / 1024).toFixed(1)}KB)`);
    
    if (signal?.aborted) {
      throw new Error('Share operation cancelled');
    }
    
    onProgress?.('Starting compression...', 10);
    
    // Compress the data
    const compressed = await compressData(jsonString, onProgress);
    
    // Debug compression results
    console.log(`Compression: ${(optimizedSize / 1024).toFixed(1)}KB → ${(compressed.length / 1024).toFixed(1)}KB (${((1 - compressed.length / optimizedSize) * 100).toFixed(1)}% compression)`);
    
    if (signal?.aborted) {
      throw new Error('Share operation cancelled');
    }
    
    onProgress?.('Encoding for URL...', 80);
    
    // Convert to base64 for URL encoding
    const base64 = btoa(String.fromCharCode(...compressed));
    const shareUrl = `${window.location.origin}${window.location.pathname}#${base64}`;
    
    // Debug URL length
    console.log(`URL encoding: ${(compressed.length / 1024).toFixed(1)}KB compressed → ${base64.length.toLocaleString()} base64 chars → ${shareUrl.length.toLocaleString()} total URL length`);
    
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
