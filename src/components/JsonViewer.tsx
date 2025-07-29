import React, { useState } from 'react';

interface JsonViewerProps {
  data: any;
  maxHeight?: string;
}

export function JsonViewer({ data, maxHeight = '200px' }: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const jsonString = JSON.stringify(data, null, 2);
  const isLarge = jsonString.length > 500;

  return (
    <div className="json-viewer bg-gray-900 rounded border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-300 font-medium">JSON</span>
        {isLarge && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>
      <div 
        className="p-3 overflow-auto custom-scrollbar"
        style={{ 
          maxHeight: isExpanded ? 'none' : maxHeight 
        }}
      >
        <pre className="text-xs text-gray-100 whitespace-pre-wrap">
          <code>{jsonString}</code>
        </pre>
      </div>
    </div>
  );
}
