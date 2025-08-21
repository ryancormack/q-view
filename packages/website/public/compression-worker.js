/**
 * Web Worker for background compression/decompression operations
 * Uses consistent gzip format to match main thread
 */

/**
 * Compresses data using gzip format
 */
async function compressData(data, onProgress) {
  if (!('CompressionStream' in globalThis)) {
    throw new Error('CompressionStream not supported');
  }

  onProgress?.('Initializing compression...', 0);

  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();
  
  const chunks = [];
  
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
async function decompressData(compressedData, onProgress) {
  if (!('DecompressionStream' in globalThis)) {
    throw new Error('DecompressionStream not supported');
  }

  onProgress?.('Initializing decompression...', 0);

  const stream = new DecompressionStream('gzip');
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();
  
  const chunks = [];
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
self.onmessage = async function(e) {
  const { action, data, id } = e.data;
  
  try {
    let result;
    
    if (action === 'compress') {
      result = await compressData(data, (stage, progress) => {
        self.postMessage({
          type: 'progress',
          id,
          stage,
          progress
        });
      });
    } else if (action === 'decompress') {
      result = await decompressData(new Uint8Array(data), (stage, progress) => {
        self.postMessage({
          type: 'progress',
          id,
          stage,
          progress
        });
      });
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
    
    self.postMessage({
      type: 'success',
      id,
      result: action === 'compress' ? Array.from(result) : result
    });
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      id,
      error: error.message
    });
  }
};
