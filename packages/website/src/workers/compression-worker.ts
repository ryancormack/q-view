/**
 * Web Worker for background compression/decompression operations
 * Uses consistent gzip format to match main thread
 */

type ProgressCallback = (stage: string, progress: number) => void;

interface WorkerMessage {
  action: 'compress' | 'decompress';
  data: string | number[];
  id: string;
}

interface WorkerResponse {
  type: 'success' | 'error' | 'progress';
  id: string;
  result?: number[] | string;
  error?: string;
  stage?: string;
  progress?: number;
}

/**
 * Compresses data using gzip format
 */
async function compressData(data: string, onProgress?: ProgressCallback): Promise<Uint8Array> {
  if (!('CompressionStream' in globalThis)) {
    throw new Error('CompressionStream not supported');
  }

  onProgress?.('Initializing compression...', 0);

  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();
  
  const chunks: Uint8Array[] = [];
  
  // Start reading compressed data immediately
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
  
  // Write data in chunks to allow for progress updates
  const encoder = new TextEncoder();
  const chunkSize = 64 * 1024; // 64KB chunks
  
  try {
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await writer.write(encoder.encode(chunk));
      
      const progress = ((i + chunkSize) / data.length) * 100;
      onProgress?.(`Compressing data... ${Math.min(100, Math.round(progress))}%`, Math.min(100, progress));
    }
  } finally {
    await writer.close();
  }
  
  await readPromise;
  
  // Combine all chunks into single array
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}

/**
 * Decompresses data using gzip format
 */
async function decompressData(compressedData: Uint8Array, onProgress?: ProgressCallback): Promise<string> {
  if (!('DecompressionStream' in globalThis)) {
    throw new Error('DecompressionStream not supported');
  }

  onProgress?.('Initializing decompression...', 0);

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
  
  // Write compressed data in chunks
  const chunkSize = 8192; // 8KB chunks for decompression
  for (let i = 0; i < compressedData.length; i += chunkSize) {
    const chunk = compressedData.slice(i, i + chunkSize);
    await writer.write(chunk);
    
    const progress = ((i + chunkSize) / compressedData.length) * 100;
    onProgress?.(`Decompressing data... ${Math.min(100, Math.round(progress))}%`, Math.min(100, progress));
  }
  
  await writer.close();
  await readPromise;
  
  // Combine chunks and decode to string
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return new TextDecoder().decode(result);
}

// Handle messages from main thread
self.onmessage = async function(e: MessageEvent<WorkerMessage>) {
  const { action, data, id } = e.data;
  
  try {
    let result: Uint8Array | string;
    
    if (action === 'compress') {
      result = await compressData(data as string, (stage, progress) => {
        (self as any).postMessage({
          type: 'progress',
          id,
          stage,
          progress
        } as WorkerResponse);
      });
    } else if (action === 'decompress') {
      result = await decompressData(new Uint8Array(data as number[]), (stage, progress) => {
        (self as any).postMessage({
          type: 'progress',
          id,
          stage,
          progress
        } as WorkerResponse);
      });
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
    
    (self as any).postMessage({
      type: 'success',
      id,
      result: action === 'compress' ? Array.from(result as Uint8Array) : result
    } as WorkerResponse);
    
  } catch (error) {
    (self as any).postMessage({
      type: 'error',
      id,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as WorkerResponse);
  }
};
