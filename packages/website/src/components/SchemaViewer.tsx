import React, { useEffect, useState } from 'react';

interface SchemaViewerProps {
  onClose: () => void;
}

export function SchemaViewer({ onClose }: SchemaViewerProps) {
  const [schema, setSchema] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the schema from the root schema.json file
    fetch('/schema.json')
      .then(response => response.text())
      .then(data => {
        setSchema(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load schema:', error);
        setSchema('Failed to load schema');
        setLoading(false);
      });
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(schema);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-hidden">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Q CLI Conversation JSON Schema</h2>
              <p className="text-sm text-gray-600">Complete schema definition for conversation files</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center p-2 border border-gray-300 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto custom-scrollbar">
              <pre className="p-6 text-sm text-gray-800 font-mono leading-relaxed whitespace-pre-wrap break-words">
                {schema}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Key Components:</p>
              <ul className="text-xs space-y-1">
                <li>• <code className="bg-gray-200 px-1 rounded">conversation_id</code> - Unique identifier</li>
                <li>• <code className="bg-gray-200 px-1 rounded">history</code> - Array of conversation turns</li>
                <li>• <code className="bg-gray-200 px-1 rounded">tools</code> - Available tool specifications</li>
                <li>• <code className="bg-gray-200 px-1 rounded">transcript</code> - Flat text representation</li>
              </ul>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
