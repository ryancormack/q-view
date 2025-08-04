import React, { useState } from 'react';
import { ConversationData } from '../types';
import { ConversationFlow } from './ConversationFlow';
import { ConversationSummary } from './ConversationSummary';
import { ToolsPanel } from './ToolsPanel';

interface ConversationViewerProps {
  data: ConversationData;
}

export function ConversationViewer({ data }: ConversationViewerProps) {
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
    <div className="max-w-7xl mx-auto">
      {/* Header with conversation info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Conversation Analysis
            </h2>
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
          </div>
          
          {data.latest_summary && (
            <div className="bg-primary-50 rounded-lg p-3 max-w-md">
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
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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
          {activeTab === 'conversation' && <ConversationFlow data={data} />}
          {activeTab === 'summary' && <ConversationSummary data={data} onToolClick={handleToolClick} />}
          {activeTab === 'tools' && <ToolsPanel data={data} selectedTool={selectedTool} />}
        </div>
      </div>
    </div>
  );
}
