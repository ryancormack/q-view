import React from 'react';
import { ConversationData, isUserSystemMessage, isToolUseMessage, isResponseMessage } from '../types';

interface ConversationSummaryProps {
  data: ConversationData;
  onToolClick?: (toolName: string) => void;
}

export function ConversationSummary({ data, onToolClick }: ConversationSummaryProps) {
  // Calculate statistics
  const totalTurns = data.history.length;
  const totalMessages = data.history.reduce((sum, turn) => sum + turn.length, 0);
  
  let userMessages = 0;
  let toolUseMessages = 0;
  let responseMessages = 0;
  let totalToolUses = 0;
  const toolUsageCount: Record<string, number> = {};

  data.history.forEach(turn => {
    turn.forEach(message => {
      if (isUserSystemMessage(message)) {
        userMessages++;
      } else if (isToolUseMessage(message)) {
        toolUseMessages++;
        totalToolUses += message.ToolUse.tool_uses.length;
        
        message.ToolUse.tool_uses.forEach(toolUse => {
          toolUsageCount[toolUse.name] = (toolUsageCount[toolUse.name] || 0) + 1;
        });
      } else if (isResponseMessage(message)) {
        responseMessages++;
      }
    });
  });

  const topTools = Object.entries(toolUsageCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-primary-600">Total Turns</p>
              <p className="text-2xl font-semibold text-primary-900">{totalTurns}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Total Messages</p>
              <p className="text-2xl font-semibold text-green-900">{totalMessages}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Tool Uses</p>
              <p className="text-2xl font-semibold text-purple-900">{totalToolUses}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Unique Tools</p>
              <p className="text-2xl font-semibold text-orange-900">{Object.keys(toolUsageCount).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Type Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Message Type Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{userMessages}</div>
            <div className="text-sm text-gray-600">User Messages</div>
            <div className="text-xs text-gray-500">{((userMessages / totalMessages) * 100).toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{toolUseMessages}</div>
            <div className="text-sm text-gray-600">Tool Use Messages</div>
            <div className="text-xs text-gray-500">{((toolUseMessages / totalMessages) * 100).toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{responseMessages}</div>
            <div className="text-sm text-gray-600">AI Responses</div>
            <div className="text-xs text-gray-500">{((responseMessages / totalMessages) * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Top Tools Used */}
      {topTools.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Most Used Tools</h3>
            {onToolClick && (
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Click to view details
              </div>
            )}
          </div>
          <div className="space-y-3">
            {topTools.map(([toolName, count], index) => (
              <div key={toolName} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-medium text-purple-600">{index + 1}</span>
                  </div>
                  {onToolClick ? (
                    <button
                      onClick={() => onToolClick(toolName)}
                      className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline transition-colors text-left cursor-pointer"
                      title={`View details for ${toolName}`}
                    >
                      {toolName}
                    </button>
                  ) : (
                    <span className="text-sm font-medium text-gray-900">{toolName}</span>
                  )}
                </div>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(toolUsageCount))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversation Metadata */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Conversation Metadata</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Conversation ID:</span>
            <div className="font-mono text-gray-600 break-all">{data.conversation_id}</div>
          </div>
          {data.model && (
            <div>
              <span className="font-medium text-gray-700">Model:</span>
              <div className="text-gray-600">{data.model}</div>
            </div>
          )}
          {data.context_message_length && (
            <div>
              <span className="font-medium text-gray-700">Context Message Length:</span>
              <div className="text-gray-600">{data.context_message_length.toLocaleString()} characters</div>
            </div>
          )}
          {data.valid_history_range && (
            <div>
              <span className="font-medium text-gray-700">Valid History Range:</span>
              <div className="text-gray-600">
                Turns {data.valid_history_range[0] + 1} - {data.valid_history_range[1]}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Latest Summary */}
      {data.latest_summary && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Latest Summary</h3>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {data.latest_summary}
          </div>
        </div>
      )}
    </div>
  );
}
