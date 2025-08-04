import React, { useCallback, useState } from 'react';
import { ConversationData } from '../types';

interface FileUploadProps {
  onFileUpload: (data: ConversationData) => void;
  onError: (error: string) => void;
}

export function FileUpload({ onFileUpload, onError }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateConversationData = (data: any): data is ConversationData => {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check required fields
    if (!data.conversation_id || typeof data.conversation_id !== 'string') {
      return false;
    }

    if (!Array.isArray(data.history)) {
      return false;
    }

    if (!Array.isArray(data.transcript)) {
      return false;
    }

    return true;
  };

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!validateConversationData(data)) {
        throw new Error('Invalid conversation data format. Please ensure the JSON matches the expected schema.');
      }
      
      onFileUpload(data);
    } catch (error) {
      if (error instanceof SyntaxError) {
        onError('Invalid JSON file. Please check the file format.');
      } else {
        onError(error instanceof Error ? error.message : 'Failed to process file');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [onFileUpload, onError]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.name.endsWith('.json')) {
      onError('Please select a JSON file.');
      return;
    }
    
    processFile(file);
  }, [processFile, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Conversation File</h2>
        <p className="text-gray-600">
          Select or drag and drop a JSON file containing GenAI conversation history
        </p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-gray-600">Processing file...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your JSON file here
              </p>
              <p className="text-gray-500 mb-4">or</p>
              <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Choose File
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="sr-only"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Supports JSON files up to 10MB
            </p>
          </>
        )}
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Expected Format</h3>
        <p className="text-sm text-gray-600 mb-3">
          The JSON file should contain a conversation object with the following structure:
        </p>
        <div className="bg-white rounded border p-3 text-xs font-mono text-gray-700 overflow-x-auto">
          <pre>{`{
  "conversation_id": "uuid-string",
  "history": [
    [/* array of messages */]
  ],
  "transcript": ["string array"],
  "tools": { /* optional tools object */ },
  "model": "model-name"
}`}</pre>
        </div>
      </div>
    </div>
  );
}
