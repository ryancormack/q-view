import React from 'react';

interface DemoNoticeProps {
  onGoToUpload: () => void;
}

export function DemoNotice({ onGoToUpload }: DemoNoticeProps) {
  return (
    <div 
      className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-6 mb-8 shadow-sm"
      role="banner"
      aria-label="Demo notice"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg 
                className="w-5 h-5 text-white" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-blue-900">
              Q CLI Demo Mode
            </h3>
            <p className="text-blue-700 mt-1">
              You're exploring a sample Amazon Q Developer conversation to see how the viewer works. 
              This includes real tool usage patterns and conversation flow.
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-6">
          <button
            onClick={onGoToUpload}
            className="inline-flex items-center px-4 py-2 border-2 border-blue-300 rounded-lg shadow-sm text-sm font-semibold text-blue-800 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer"
            aria-label="Go to upload page to analyze your own Q CLI conversation data"
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
            Upload Your Q CLI File
          </button>
        </div>
      </div>
    </div>
  );
}