import React from 'react';

interface DemoNoticeProps {
  onGoToUpload: () => void;
}

export function DemoNotice({ onGoToUpload }: DemoNoticeProps) {
  return (
    <div 
      className="bg-warning-50 border-l-4 border-warning-500 p-4 mb-6"
      role="banner"
      aria-label="Demo notice"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg 
              className="w-5 h-5 text-warning-600" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-warning-800">
              Demo Mode
            </p>
            <p className="text-sm text-warning-700">
              You're viewing example conversation data to explore the application's features.
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={onGoToUpload}
            className="inline-flex items-center px-3 py-2 border border-warning-300 rounded-md shadow-sm text-sm font-medium text-warning-800 bg-warning-100 hover:bg-warning-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning-500 transition-colors"
            aria-label="Go to upload page to analyze your own conversation data"
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            Upload Your Own File
          </button>
        </div>
      </div>
    </div>
  );
}