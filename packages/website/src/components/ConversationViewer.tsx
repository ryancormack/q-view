import React, { useState } from 'react';
import { ConversationWithMetadata } from '../types';
import { ConversationFlow } from './ConversationFlow';
import { ConversationSummary } from './ConversationSummary';
import { ToolsPanel } from './ToolsPanel';
import { ConversationErrorBoundary } from './ErrorBoundary';
import SchemaVersionBadge from './SchemaVersionBadge';
import { SupportedVersion } from '../utils/versionDetection';

interface ConversationViewerProps {
  conversationWithMetadata: ConversationWithMetadata;
}

export function ConversationViewer({ conversationWithMetadata }: ConversationViewerProps) {
  const { data, metadata } = conversationWithMetadata;
  const [activeTab, setActiveTab] = useState<'conversation' | 'summary' | 'tools'>('conversation');
  const [selectedTool, setSelectedTool] = useState<{ namespace: string; toolName: string } | null>(null);

  const handleToolClick = (toolName: string) => {
    // Find which namespace contains this tool
    if (data.tools) {
      for (const [namespace, tools] of Object.entries(data.tools)) {
        const processedTools = tools.map(tool => {
          if ('ToolSpecification' in tool) {
            return (tool as any).ToolSpecification;
          }
          return tool;
        });
        
        const foundTool = processedTools.find(tool => tool.name === toolName);
        if (foundTool) {
          setSelectedTool({ namespace, toolName });
          setActiveTab('tools');
          break;
        }
      }
    }
  };

  const tabs = [
    { id: 'conversation' as const, name: 'Conversation', icon: '💬' },
    { id: 'summary' as const, name: 'Summary', icon: '📊' },
    { id: 'tools' as const, name: 'Tools', icon: '🔧' },
  ];

  return (
    <ConversationErrorBoundary>
      <div className="max-w-7xl mx-auto">
        {/* Header with conversation info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Conversation Analysis
                </h2>
                <SchemaVersionBadge 
                  version={metadata.detectedVersion as SupportedVersion}
                  validation={metadata.validation}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">ID:</span>
                  <span className="ml-2 font-mono text-gray-900">{data.conversation_id}</span>
                </div>
                {data.model && (
                  <div>
                    <span className="text-gray-500">Model:</span>
                    <span className="ml-2 text-gray-900">{data.model}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Turns:</span>
                  <span className="ml-2 text-gray-900">{data.history.length}</span>
                </div>
              </div>

              {/* Show validation warnings if any */}
              {metadata.validation.warnings.length > 0 && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">Validation Warnings</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {metadata.validation.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {data.latest_summary && (
              <div className="bg-primary-50 rounded-lg p-3 max-w-md ml-6">
                <h4 className="text-sm font-medium text-primary-900 mb-1">Latest Summary</h4>
                <p className="text-sm text-primary-700 line-clamp-3">{data.latest_summary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <ConversationErrorBoundary>
              {activeTab === 'conversation' && <ConversationFlow data={data} />}
            </ConversationErrorBoundary>
            
            <ConversationErrorBoundary>
              {activeTab === 'summary' && <ConversationSummary data={data} onToolClick={handleToolClick} />}
            </ConversationErrorBoundary>
            
            <ConversationErrorBoundary>
              {activeTab === 'tools' && <ToolsPanel data={data} selectedTool={selectedTool} />}
            </ConversationErrorBoundary>
          </div>
        </div>
      </div>
    </ConversationErrorBoundary>
  );
}
