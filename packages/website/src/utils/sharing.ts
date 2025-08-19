import { ConversationData } from '../types';

const MAX_URL_LENGTH = 100000; // Increased limit - most browsers support URLs up to 2MB
const CHUNK_SIZE = 64 * 1024; // 64KB chunks for streaming
const PROGRESS_YIELD_INTERVAL = 10; // Yield control every 10 chunks

export interface ProgressCallback {
  (stage: string, progress?: number): void;
}

/**
 * Optimizes conversation data for better compression by removing redundant information
 */
function optimizeConversationData(data: ConversationData): ConversationData {
  // Create a deep copy to avoid modifying the original
  const optimized = JSON.parse(JSON.stringify(data));
  
  // Remove or minimize redundant data that doesn't affect the core conversation
  if (optimized.history) {
    optimized.history = optimized.history.map((turn: any[]) => {
      return turn.map((message: any) => {
        // Keep essential fields, remove verbose metadata
        const essential = {
          role: message.role,
          content: message.content
        };
        
        // Preserve tool use information but compress it
        if (message.role === 'assistant' && message.content) {
          const content = Array.isArray(message.content) ? message.content : [message.content];
          essential.content = content.map((item: any) => {
            if (item.type === 'tool_use') {
              return {
                type: 'tool_use',
                id: item.id,
                name: item.name,
                input: item.input
              };
            }
            return item;
          });
        }
        
        return essential;
      });
    });
  }
  
  // Keep tools but remove verbose descriptions for compression
  if (optimized.tools) {
    Object.keys(optimized.tools).forEach(namespace => {
      optimized.tools[namespace] = optimized.tools[namespace].map((tool: any) => ({
        name: tool.name,
        description: tool.description?.substring(0, 200) + (tool.description?.length > 200 ? '...' : ''), // Truncate long descriptions
        input_schema: tool.input_schema
      }));
    });
  }
  
  return optimized;
}

/**
 * Compresses conversation data using streaming compression with progress feedback
 */
async function compressData(
  data: string, 
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<Uint8Array> {
  if (!('CompressionStream' in window)) {
    throw new Error('CompressionStream not supported in this browser');
  }

  if (signal?.aborted) {
    throw new Error('Compression cancelled');
  }

  // Choose compression format based on data size
  const compressionFormat = data.length > 100000 ? 'deflate' : 'gzip';
  onProgress?.('Initializing compression...', 0);

  const stream = new CompressionStream(compressionFormat);
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();
  
  const chunks: Uint8Array[] = [];
  
  // Start reading compressed data immediately
  const readPromise = (async () => {
    try {
      while (true) {
        if (signal?.aborted) {
          throw new Error('Compression cancelled');
        }
        
        const { value, done } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
  })();
  
  // Write data in chunks with progress updates
  const encoder = new TextEncoder();
  const totalChunks = Math.ceil(data.length / CHUNK_SIZE);
  
  try {
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      if (signal?.aborted) {
        throw new Error('Compression cancelled');
      }
      
      const chunk = data.slice(i, i + CHUNK_SIZE);
      await writer.write(encoder.encode(chunk));
      
      const currentChunk = Math.floor(i / CHUNK_SIZE) + 1;
      const progress = (currentChunk / totalChunks) * 80; // 80% for compression
      onProgress?.('Compressing data...', progress);
      
      // Yield control periodically to prevent UI blocking
      if (currentChunk % PROGRESS_YIELD_INTERVAL === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  } finally {
    await writer.close();
  }
  
  onProgress?.('Finalizing compression...', 85);
  await readPromise;
  
  // Combine chunks efficiently
  onProgress?.('Combining compressed data...', 90);
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  onProgress?.('Compression complete', 100);
  return result;
}

/**
 * Decompresses data using streaming decompression with progress feedback
 */
async function decompressData(
  compressedData: Uint8Array,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<string> {
  if (!('DecompressionStream' in window)) {
    throw new Error('DecompressionStream not supported in this browser');
  }

  if (signal?.aborted) {
    throw new Error('Decompression cancelled');
  }

  onProgress?.('Initializing decompression...', 0);

  // Try both gzip and deflate for compatibility
  const formats = ['gzip', 'deflate'] as const;
  let lastError: Error | null = null;

  for (const format of formats) {
    try {
      const stream = new DecompressionStream(format);
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      // Start reading decompressed data
      const chunks: Uint8Array[] = [];
      const readPromise = (async () => {
        try {
          while (true) {
            if (signal?.aborted) {
              throw new Error('Decompression cancelled');
            }
            
            const { value, done } = await reader.read();
            if (done) break;
            if (value) chunks.push(value);
          }
        } finally {
          reader.releaseLock();
        }
      })();
      
      onProgress?.('Decompressing data...', 20);
      
      // Write compressed data in chunks
      const chunkSize = 8192; // 8KB chunks for decompression
      for (let i = 0; i < compressedData.length; i += chunkSize) {
        if (signal?.aborted) {
          throw new Error('Decompression cancelled');
        }
        
        const chunk = compressedData.slice(i, i + chunkSize);
        await writer.write(chunk);
        
        const progress = 20 + (i / compressedData.length) * 60; // 20-80%
        onProgress?.('Decompressing data...', progress);
      }
      
      await writer.close();
      await readPromise;
      
      onProgress?.('Combining decompressed data...', 85);
      
      // Combine chunks and decode to string
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      onProgress?.('Decompression complete', 100);
      return new TextDecoder().decode(result);
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Decompression failed');
      // Try next format
      continue;
    }
  }
  
  throw lastError || new Error('Failed to decompress data with any supported format');
}

/**
 * Web Worker support for background compression
 */
let workerSupported: boolean | null = null;

function isWorkerSupported(): boolean {
  if (workerSupported === null) {
    try {
      workerSupported = typeof Worker !== 'undefined' && 
                       typeof window !== 'undefined' &&
                       'CompressionStream' in window;
    } catch {
      workerSupported = false;
    }
  }
  return workerSupported;
}

/**
 * Compresses data using Web Worker for better performance
 */
async function compressDataWithWorker(
  data: string,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    if (!isWorkerSupported()) {
      // Fallback to main thread compression
      return compressData(data, onProgress, signal).then(resolve).catch(reject);
    }

    const worker = new Worker('/compression-worker.js');
    const id = Math.random().toString(36).substr(2, 9);
    
    const cleanup = () => {
      worker.terminate();
    };

    const handleAbort = () => {
      cleanup();
      reject(new Error('Compression cancelled'));
    };

    if (signal) {
      signal.addEventListener('abort', handleAbort);
    }
    
    worker.onmessage = (e) => {
      const { type, id: messageId, progress, result, error } = e.data;
      
      if (messageId !== id) return;
      
      switch (type) {
        case 'progress':
          onProgress?.('Compressing data...', progress);
          break;
          
        case 'success':
          if (signal) {
            signal.removeEventListener('abort', handleAbort);
          }
          cleanup();
          resolve(new Uint8Array(result));
          break;
          
        case 'error':
          if (signal) {
            signal.removeEventListener('abort', handleAbort);
          }
          cleanup();
          reject(new Error(error));
          break;
      }
    };
    
    worker.onerror = (error) => {
      if (signal) {
        signal.removeEventListener('abort', handleAbort);
      }
      cleanup();
      reject(error);
    };
    
    // Send compression task to worker
    worker.postMessage({
      action: 'compress',
      data,
      id
    });
  });
}

/**
 * Decompresses data using Web Worker for better performance
 */
async function decompressDataWithWorker(
  compressedData: Uint8Array,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isWorkerSupported()) {
      // Fallback to main thread decompression
      return decompressData(compressedData, onProgress, signal).then(resolve).catch(reject);
    }

    const worker = new Worker('/compression-worker.js');
    const id = Math.random().toString(36).substr(2, 9);
    
    const cleanup = () => {
      worker.terminate();
    };

    const handleAbort = () => {
      cleanup();
      reject(new Error('Decompression cancelled'));
    };

    if (signal) {
      signal.addEventListener('abort', handleAbort);
    }
    
    worker.onmessage = (e) => {
      const { type, id: messageId, progress, result, error } = e.data;
      
      if (messageId !== id) return;
      
      switch (type) {
        case 'progress':
          onProgress?.('Decompressing data...', progress);
          break;
          
        case 'success':
          if (signal) {
            signal.removeEventListener('abort', handleAbort);
          }
          cleanup();
          resolve(result);
          break;
          
        case 'error':
          if (signal) {
            signal.removeEventListener('abort', handleAbort);
          }
          cleanup();
          reject(new Error(error));
          break;
      }
    };
    
    worker.onerror = (error) => {
      if (signal) {
        signal.removeEventListener('abort', handleAbort);
      }
      cleanup();
      reject(error);
    };
    
    // Send decompression task to worker
    worker.postMessage({
      action: 'decompress',
      data: Array.from(compressedData), // Convert to regular array for transfer
      id
    });
  });
}
function uint8ArrayToBase64Url(data: Uint8Array): string {
  // Convert to base64
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  const base64 = btoa(binary);
  
  // Convert to base64url (URL-safe)
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Converts base64url back to Uint8Array
 */
function base64UrlToUint8Array(base64url: string): Uint8Array {
  // Convert base64url back to base64
  let base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  
  // Decode base64 to binary string
  const binary = atob(base64);
  
  // Convert to Uint8Array
  const data = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    data[i] = binary.charCodeAt(i);
  }
  
  return data;
}

/**
 * Creates a shareable URL for a conversation with progress feedback and cancellation support
 */
export async function createShareUrl(
  conversationData: ConversationData,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<{ url: string; success: boolean; error?: string; compressionStats?: { originalSize: number; compressedSize: number; ratio: string } }> {
  try {
    if (signal?.aborted) {
      throw new Error('Share URL creation cancelled');
    }

    onProgress?.('Preparing conversation data...', 0);
    
    // Optimize the conversation data for better compression
    const optimizedData = optimizeConversationData(conversationData);
    
    // Check conversation size before processing
    const jsonString = JSON.stringify(optimizedData);
    const originalSize = JSON.stringify(conversationData).length; // Original size for stats
    
    onProgress?.('Optimized conversation data for sharing', 5);
    
    // Warn about very large conversations
    if (jsonString.length > 1000000) { // 1MB
      onProgress?.('Processing large conversation (this may take a moment)...', 10);
    }
    
    if (signal?.aborted) {
      throw new Error('Share URL creation cancelled');
    }
    
    // Use Web Worker compression if available, otherwise fallback to main thread
    const useWorker = isWorkerSupported() && jsonString.length > 50000; // Use worker for files > 50KB
    
    let compressed: Uint8Array;
    if (useWorker) {
      onProgress?.('Using background compression for better performance...', 15);
      compressed = await compressDataWithWorker(jsonString, (stage, progress) => {
        const overallProgress = 15 + (progress || 0) * 0.7; // 15-85%
        onProgress?.(stage, overallProgress);
      }, signal);
    } else {
      compressed = await compressData(jsonString, (stage, progress) => {
        const overallProgress = 10 + (progress || 0) * 0.75; // 10-85%
        onProgress?.(stage, overallProgress);
      }, signal);
    }
    
    if (signal?.aborted) {
      throw new Error('Share URL creation cancelled');
    }
    
    onProgress?.('Encoding for URL...', 90);
    
    // Convert to base64url
    const encoded = uint8ArrayToBase64Url(compressed);
    
    onProgress?.('Generating share URL...', 95);
    
    // Create the share URL
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}#share=${encoded}`;
    
    // Check if URL is too long
    if (shareUrl.length > MAX_URL_LENGTH) {
      const compressionRatio = ((originalSize - compressed.length) / originalSize * 100).toFixed(1);
      return {
        success: false,
        url: '',
        error: `Conversation is too large to share via URL (${shareUrl.length.toLocaleString()} characters). ` +
               `Even with optimization and ${compressionRatio}% compression, it exceeds browser limits. ` +
               `Try sharing a smaller section of the conversation or use the JSON export feature instead.`,
        compressionStats: {
          originalSize,
          compressedSize: compressed.length,
          ratio: compressionRatio
        }
      };
    }
    
    const compressionRatio = ((originalSize - compressed.length) / originalSize * 100).toFixed(1);
    
    onProgress?.('Share URL created successfully!', 100);
    
    console.log(`Compression: ${originalSize.toLocaleString()} → ${compressed.length.toLocaleString()} bytes (${compressionRatio}% reduction)${useWorker ? ' [Worker]' : ' [Main Thread]'}`);
    
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
    if (signal?.aborted || (error instanceof Error && error.message.includes('cancelled'))) {
      return {
        success: false,
        url: '',
        error: 'Share URL creation was cancelled'
      };
    }
    
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'Failed to create share URL'
    };
  }
}

/**
 * Extracts conversation data from a share URL with progress feedback
 */
export async function parseShareUrl(
  url?: string,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<{ data: ConversationData | null; error?: string }> {
  try {
    if (signal?.aborted) {
      throw new Error('URL parsing cancelled');
    }

    onProgress?.('Parsing share URL...', 0);
    
    const urlToParse = url || window.location.href;
    const hashIndex = urlToParse.indexOf('#share=');
    
    if (hashIndex === -1) {
      return { data: null };
    }
    
    onProgress?.('Extracting shared data...', 10);
    
    // Extract the encoded data from the URL
    const encoded = urlToParse.substring(hashIndex + 7); // 7 = length of '#share='
    
    if (!encoded) {
      return { data: null, error: 'No shared data found in URL' };
    }
    
    if (signal?.aborted) {
      throw new Error('URL parsing cancelled');
    }
    
    onProgress?.('Decoding shared data...', 20);
    
    // Decode from base64url
    const compressed = base64UrlToUint8Array(encoded);
    
    if (signal?.aborted) {
      throw new Error('URL parsing cancelled');
    }
    
    // Use Web Worker decompression if available for large data
    const useWorker = isWorkerSupported() && compressed.length > 10000; // Use worker for compressed data > 10KB
    
    let jsonString: string;
    if (useWorker) {
      onProgress?.('Using background decompression for better performance...', 25);
      jsonString = await decompressDataWithWorker(compressed, (stage, progress) => {
        const overallProgress = 25 + (progress || 0) * 0.55; // 25-80%
        onProgress?.(stage, overallProgress);
      }, signal);
    } else {
      jsonString = await decompressData(compressed, (stage, progress) => {
        const overallProgress = 20 + (progress || 0) * 0.6; // 20-80%
        onProgress?.(stage, overallProgress);
      }, signal);
    }
    
    if (signal?.aborted) {
      throw new Error('URL parsing cancelled');
    }
    
    onProgress?.('Parsing conversation data...', 85);
    
    // Parse JSON
    const conversationData = JSON.parse(jsonString) as ConversationData;
    
    onProgress?.('Validating conversation data...', 95);
    
    // Basic validation
    if (!conversationData.conversation_id || !conversationData.history) {
      return { data: null, error: 'Invalid conversation data in shared URL' };
    }
    
    onProgress?.('Shared conversation loaded successfully!', 100);
    
    console.log(`Decompression: ${compressed.length.toLocaleString()} → ${jsonString.length.toLocaleString()} bytes${useWorker ? ' [Worker]' : ' [Main Thread]'}`);
    
    return { data: conversationData };
  } catch (error) {
    if (signal?.aborted || (error instanceof Error && error.message.includes('cancelled'))) {
      return {
        data: null,
        error: 'URL parsing was cancelled'
      };
    }
    
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to parse shared conversation'
    };
  }
}

/**
 * Checks if the current URL contains shared conversation data
 */
export function hasSharedData(): boolean {
  return window.location.hash.startsWith('#share=');
}

/**
 * Clears the share data from the URL without reloading the page
 */
export function clearShareUrl(): void {
  if (hasSharedData()) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}
