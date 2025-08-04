import React, { useState } from 'react';
import { 
  Message, 
  isUserSystemMessage, 
  isToolUseMessage, 
  isResponseMessage,
  isPromptContent,
  isToolUseResultsContent
} from '../types';
import { JsonViewer } from './JsonViewer';

interface MessageCardProps {
  message: Message;
  turnIndex: number;
  messageIndex: number;
}

export function MessageCard({ message, turnIndex, messageIndex }: MessageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isUserSystemMessage(message)) {
    const isUserPrompt = isPromptContent(message.content);
    const isToolResults = isToolUseResultsContent(message.content);
    
    return (
      <div className={`border rounded-lg p-4 ${
        isUserPrompt 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
              isUserPrompt 
                ? 'bg-blue-500' 
                : 'bg-gray-500'
            }`}>
              {isUserPrompt ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
            </div>
            <h3 className={`text-sm font-medium ${
              isUserPrompt 
                ? 'text-blue-900' 
                : 'text-gray-900'
            }`}>
              {isUserPrompt ? 'User Message' : 'Tool Results'}
            </h3>
          </div>
          <span className={`text-xs px-2 py-1 rounded ${
            isUserPrompt 
              ? 'text-blue-600 bg-blue-100' 
              : 'text-gray-600 bg-gray-100'
          }`}>
            {turnIndex + 1}.{messageIndex + 1}
          </span>
        </div>

        {isPromptContent(message.content) && (
          <div className="bg-white rounded border p-3 mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Prompt</h4>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {message.content.Prompt.prompt}
            </div>
          </div>
        )}

        {isToolUseResultsContent(message.content) && (
          <div className="bg-white rounded border p-3 mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Tool Use Results</h4>
            <div className="space-y-3">
              {message.content.ToolUseResults.tool_use_results.map((result, idx) => (
                <div key={idx} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-gray-600">{result.tool_use_id}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      result.status === 'Success' 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-error-100 text-error-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {result.content.map((content, contentIdx) => (
                      <div key={contentIdx}>
                        {content.Text && (
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {content.Text}
                          </div>
                        )}
                        {content.Json && (
                          <JsonViewer data={content.Json} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {message.env_context && (
          <div className="bg-gray-50 rounded border p-3 mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Environment Context</h4>
            <div className="text-xs space-y-1">
              <div><span className="font-medium">OS:</span> {message.env_context.env_state.operating_system}</div>
              <div><span className="font-medium">CWD:</span> {message.env_context.env_state.current_working_directory}</div>
              {message.env_context.env_state.environment_variables.length > 0 && (
                <div><span className="font-medium">Env Vars:</span> {message.env_context.env_state.environment_variables.length} variables</div>
              )}
            </div>
          </div>
        )}

        {message.additional_context && (
          <div className="bg-gray-50 rounded border p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Context</h4>
            <div className="text-sm text-gray-700">{message.additional_context}</div>
          </div>
        )}
      </div>
    );
  }

  if (isToolUseMessage(message)) {
    return (
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-purple-900">Tool Use</h3>
          </div>
          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
            {turnIndex + 1}.{messageIndex + 1}
          </span>
        </div>

        <div className="bg-white rounded border p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Message</h4>
            <span className="text-xs font-mono text-gray-500">{message.ToolUse.message_id}</span>
          </div>
          {message.ToolUse.content && (
            <div className="text-sm text-gray-700 whitespace-pre-wrap mb-3">
              {message.ToolUse.content}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {message.ToolUse.tool_uses.map((toolUse, idx) => (
            <div key={idx} className="bg-white rounded border p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{toolUse.name}</span>
                  {toolUse.orig_name !== toolUse.name && (
                    <span className="ml-2 text-xs text-gray-500">({toolUse.orig_name})</span>
                  )}
                </div>
                <span className="text-xs font-mono text-gray-500">{toolUse.id}</span>
              </div>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-purple-600 hover:text-purple-800 mb-2"
              >
                {isExpanded ? 'Hide' : 'Show'} Arguments
              </button>
              
              {isExpanded && (
                <div className="space-y-2">
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-1">Processed Arguments</h5>
                    <JsonViewer data={toolUse.args} />
                  </div>
                  {JSON.stringify(toolUse.args) !== JSON.stringify(toolUse.orig_args) && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-1">Original Arguments</h5>
                      <JsonViewer data={toolUse.orig_args} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isResponseMessage(message)) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-green-900">AI Response</h3>
          </div>
          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
            {turnIndex + 1}.{messageIndex + 1}
          </span>
        </div>

        <div className="bg-white rounded border p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Response</h4>
            <span className="text-xs font-mono text-gray-500">{message.Response.message_id}</span>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {message.Response.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="text-sm text-gray-500">Unknown message type</div>
      <JsonViewer data={message} />
    </div>
  );
}
