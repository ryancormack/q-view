import React, { useState } from 'react';
import { SupportedVersion } from '../utils/versionDetection';
import { ValidationResult, getVersionDisplayName, getVersionCompatibility } from '../utils/schemaVersioning';

interface SchemaVersionBadgeProps {
  version: SupportedVersion;
  validation: ValidationResult;
  className?: string;
}

export function SchemaVersionBadge({ version, validation, className = '' }: SchemaVersionBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const displayName = getVersionDisplayName(version);
  const compatibility = getVersionCompatibility(version);

  const getBadgeColor = () => {
    if (!validation.isValid) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (validation.warnings.length > 0) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (compatibility.isLatest) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusIcon = () => {
    if (!validation.isValid) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (validation.warnings.length > 0) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const getStatusText = () => {
    if (!validation.isValid) {
      return 'Invalid';
    }
    if (validation.warnings.length > 0) {
      return 'Valid (Warnings)';
    }
    return 'Valid';
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-all hover:shadow-sm ${getBadgeColor()}`}
      >
        {getStatusIcon()}
        <span className="ml-2">{displayName}</span>
        <span className="ml-2 text-xs opacity-75">({getStatusText()})</span>
        <svg 
          className={`ml-1 w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDetails && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
          <div className="space-y-3">
            {/* Version Info */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Schema Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">Version:</span> {version}
                </div>
                <div>
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-1 ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {validation.isValid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                {compatibility.isLatest && (
                  <div className="flex items-center text-green-600">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Latest version
                  </div>
                )}
              </div>
            </div>

            {/* Validation Errors */}
            {validation.errors.length > 0 && (
              <div>
                <h5 className="font-medium text-red-800 mb-1">Errors</h5>
                <ul className="text-sm text-red-600 space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-400 mr-1">•</span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Validation Warnings */}
            {validation.warnings.length > 0 && (
              <div>
                <h5 className="font-medium text-yellow-800 mb-1">Warnings</h5>
                <ul className="text-sm text-yellow-600 space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-400 mr-1">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deprecation Warning */}
            {compatibility.deprecationWarning && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm text-yellow-800">{compatibility.deprecationWarning}</p>
                </div>
              </div>
            )}

            {/* Features */}
            <div>
              <h5 className="font-medium text-gray-800 mb-1">Supported Features</h5>
              <div className="flex flex-wrap gap-1">
                {['basic_conversation_flow', 'tool_usage_tracking'].map(feature => (
                  <span key={feature} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {feature.replace(/_/g, ' ')}
                  </span>
                ))}
                {version === 'v1.14.0' && (
                  <>
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                      enhanced metadata
                    </span>
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                      file tracking
                    </span>
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                      tool origins
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchemaVersionBadge;
