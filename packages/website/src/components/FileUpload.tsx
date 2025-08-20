import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ConversationWithMetadata } from '../types';
import { normalizeConversationWithVersion } from '../utils/conversationNormalizer';

interface FileUploadProps {
  onFileUpload: (data: ConversationWithMetadata) => void;
  onError: (error: string) => void;
}

export function FileUpload({ onFileUpload, onError }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      const rawData = JSON.parse(text);
      
      // Use new version-aware normalization
      const result = await normalizeConversationWithVersion(rawData);
      
      console.log(`Detected conversation format: ${result.metadata.detectedVersion}`);
      console.log(`Validation result:`, result.metadata.validation);
      
      // Check if validation passed
      if (!result.metadata.validation.isValid) {
        const errorMessage = `Invalid conversation format (${result.metadata.detectedVersion}): ${result.metadata.validation.errors.join(', ')}`;
        throw new Error(errorMessage);
      }
      
      // Show warnings if any
      if (result.metadata.validation.warnings.length > 0) {
        console.warn('Validation warnings:', result.metadata.validation.warnings);
      }
      
      onFileUpload(result);
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
    <div className="max-w-4xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-orange-400 bg-orange-50 scale-105'
            : 'border-gray-300 hover:border-orange-300 hover:bg-orange-25'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mb-6"></div>
            <p className="text-lg font-medium text-gray-700">Processing your Q CLI conversation...</p>
            <p className="text-sm text-gray-500 mt-2">Analyzing tools and message flow</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center">
              {/* Upload Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-orange-600"
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
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Upload Your Q CLI Conversation
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Drop your conversation JSON file here to start exploring your Amazon Q Developer interactions
              </p>
              
              <label className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Choose Conversation File
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="sr-only"
                />
              </label>
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                JSON files only
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Processed locally
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Up to 10MB
              </div>
            </div>
          </>
        )}
      </div>

      {/* Demo Link */}
      <div className="mt-12 max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-blue-900 mb-3">
            Try the Interactive Demo
          </h3>
          <p className="text-blue-700 mb-6">
            Explore a real Q CLI conversation to see how the viewer works with actual tool usage and conversation patterns.
          </p>
          <Link
            to="/demo?demo=original-demo"
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View Demo
          </Link>
        </div>
      </div>

      {/* Expected Format Section */}
      <div className="mt-12 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Expected Q CLI Format</h3>
            <p className="text-gray-600">Your conversation JSON should include these key components</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 border">
          <pre className="text-sm font-mono text-gray-700 overflow-x-auto">
{`{
  "conversation_id": "uuid-string",
  "history": [
    [/* Array of message objects per turn */]
  ],
  "transcript": ["Flat text representation"],
  "tools": {
    "namespace": [
      {
        "name": "tool_name",
        "description": "What the tool does",
        "input_schema": { /* JSON Schema */ }
      }
    ]
  },
  "model": "claude-3-5-sonnet-20241022"
}`}
          </pre>
        </div>
        
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Message Types</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• User prompts and system messages</li>
              <li>• Tool use requests with parameters</li>
              <li>• Tool results and responses</li>
              <li>• AI-generated text responses</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Tool Information</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Complete tool specifications</li>
              <li>• Input parameter schemas</li>
              <li>• Tool usage patterns</li>
              <li>• Execution results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
