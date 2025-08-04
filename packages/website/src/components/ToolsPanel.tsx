import React, { useState } from 'react';
import { ConversationData, ToolSpecification } from '../types';
import { JsonViewer } from './JsonViewer';

interface ToolsPanelProps {
  data: ConversationData;
  selectedTool?: { namespace: string; toolName: string } | null;
}

export function ToolsPanel({ data, selectedTool: externalSelectedTool }: ToolsPanelProps) {
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolSpecification | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset error when data changes
  React.useEffect(() => {
    setError(null);
  }, [data]);

  // Handle external tool selection from other components
  React.useEffect(() => {
    if (externalSelectedTool && data.tools) {
      const { namespace, toolName } = externalSelectedTool;
      
      // Set the namespace
      setSelectedNamespace(namespace);
      
      // Find and set the specific tool
      const rawTools = data.tools[namespace] || [];
      const processedTools = rawTools.map(tool => {
        if ('ToolSpecification' in tool) {
          return (tool as any).ToolSpecification as ToolSpecification;
        }
        return tool as ToolSpecification;
      });
      
      const foundTool = processedTools.find(tool => tool.name === toolName);
      if (foundTool) {
        setSelectedTool(foundTool);
      }
    }
  }, [externalSelectedTool, data.tools]);

  if (!data.tools || Object.keys(data.tools).length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tools available</h3>
        <p className="text-gray-500">This conversation doesn't include tool specifications.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading tools</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => setError(null)}
          className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  try {
    const namespaces = Object.keys(data.tools);
    const currentNamespace = selectedNamespace || namespaces[0];
    const rawTools = data.tools[currentNamespace] || [];
    
    // Extract tools from ToolSpecification wrapper if needed
    const currentTools = rawTools.map(tool => {
      if ('ToolSpecification' in tool) {
        return (tool as any).ToolSpecification as ToolSpecification;
      }
      return tool as ToolSpecification;
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Namespaces Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tool Namespaces</h3>
          <div className="space-y-2">
            {namespaces.map((namespace) => (
              <button
                key={namespace}
                onClick={() => {
                  setSelectedNamespace(namespace);
                  setSelectedTool(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                  currentNamespace === namespace
                    ? 'bg-primary-100 text-primary-800 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{namespace}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {data.tools![namespace].length}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools List */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tools in {currentNamespace}
          </h3>
          <div className="space-y-2">
            {currentTools.map((tool, index) => (
              <button
                key={`${tool.name}-${index}`}
                onClick={() => setSelectedTool(tool)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                  selectedTool === tool
                    ? 'bg-purple-100 text-purple-800 font-medium ring-2 ring-purple-300'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{tool.name}</div>
                {tool.description && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {tool.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tool Details */}
      <div className="lg:col-span-1">
        {selectedTool ? (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tool Details</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Name</h4>
                <div className="text-sm font-mono bg-gray-100 rounded px-2 py-1">
                  {selectedTool.name}
                </div>
              </div>

              {selectedTool.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <div className="text-sm text-gray-600">
                    {selectedTool.description}
                  </div>
                </div>
              )}

              {selectedTool.input_schema && selectedTool.input_schema.json && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Input Schema</h4>
                  <JsonViewer data={selectedTool.input_schema.json} maxHeight="400px" />
                </div>
              )}

              {selectedTool.input_schema?.json?.properties && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Parameters</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedTool.input_schema.json.properties).map(([paramName, paramSchema]: [string, any]) => (
                      <div key={paramName} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{paramName}</span>
                          <div className="flex items-center space-x-2">
                            {paramSchema.type && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {paramSchema.type}
                              </span>
                            )}
                            {selectedTool.input_schema?.json?.required?.includes(paramName) && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                required
                              </span>
                            )}
                          </div>
                        </div>
                        {paramSchema.description && (
                          <div className="text-xs text-gray-600">
                            {paramSchema.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!selectedTool.input_schema || !selectedTool.input_schema.json) && (
                <div className="text-center py-4">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No schema information available</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">Select a tool to view its details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  } catch (err) {
    // Handle any rendering errors
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error rendering tools</h3>
        <p className="text-gray-500 mb-4">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Reload page
        </button>
      </div>
    );
  }
}
