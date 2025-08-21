import React from 'react';
import { SharingState } from '../hooks/useSharing';

interface SharingProgressProps {
  state: SharingState;
  onCancel?: () => void;
  className?: string;
}

export function SharingProgress({ state, onCancel, className = '' }: SharingProgressProps) {
  const { isCreating, isParsing, progress, stage, error, compressionStats } = state;
  
  if (!isCreating && !isParsing && !error) {
    return null;
  }

  const isActive = isCreating || isParsing;
  const operation = isCreating ? 'Creating' : 'Loading';

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isActive && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          )}
          <span className="font-medium text-gray-900">
            {error ? 'Error' : `${operation} Share URL`}
          </span>
        </div>
        
        {isActive && onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {operation} Failed
              </h3>
              <div className="mt-1 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar and Status */}
      {isActive && (
        <>
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{stage}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Performance Tips */}
          {isCreating && progress < 50 && (
            <div className="text-xs text-gray-500 mt-2">
              <div className="flex items-center space-x-1">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Large conversations may take a moment to compress</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Compression Stats */}
      {compressionStats && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-600">
            <div className="font-medium mb-1">Compression Results</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Original:</span>{' '}
                <span className="font-mono">{compressionStats.originalSize.toLocaleString()} bytes</span>
              </div>
              <div>
                <span className="text-gray-500">Compressed:</span>{' '}
                <span className="font-mono">{compressionStats.compressedSize.toLocaleString()} bytes</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Reduction:</span>{' '}
                <span className="font-medium text-green-600">{compressionStats.ratio}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
