import React from 'react';
import { ConversationData, Message, isUserSystemMessage, isToolUseMessage, isResponseMessage } from '../types';
import { MessageCard } from './MessageCard';
import { normalizeConversationData } from '../utils/conversationNormalizer';

interface ConversationFlowProps {
  data: ConversationData;
}

export function ConversationFlow({ data: rawData }: ConversationFlowProps) {
  // Normalize the data to ensure backwards compatibility
  const data = normalizeConversationData(rawData);
  const { history, valid_history_range } = data;
  
  // Determine which part of history to show
  const startIndex = valid_history_range ? valid_history_range[0] : 0;
  const endIndex = valid_history_range ? valid_history_range[1] : history.length;
  const visibleHistory = history.slice(startIndex, endIndex);

  if (visibleHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation history</h3>
        <p className="text-gray-500">This conversation doesn't contain any visible messages.</p>
      </div>
    );
  }

  return (
    <div className="conversation-flow space-y-6 custom-scrollbar max-h-[80vh] overflow-y-auto">
      {visibleHistory.map((turn, turnIndex) => {
        // Ensure turn is an array (it should be after normalization)
        if (!Array.isArray(turn)) {
          console.warn(`Turn ${turnIndex} is not an array:`, turn);
          return null;
        }

        return (
          <div key={turnIndex} className="conversation-turn">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">{turnIndex + 1}</span>
              </div>
              <div className="ml-3 flex-1 h-px bg-gray-200"></div>
              <div className="ml-3 text-sm text-gray-500">
                Turn {turnIndex + 1}
              </div>
            </div>
            
            <div className="ml-11 space-y-4">
              {turn.map((message, messageIndex) => (
                <MessageCard
                  key={`${turnIndex}-${messageIndex}`}
                  message={message}
                  turnIndex={turnIndex}
                  messageIndex={messageIndex}
                />
              ))}
            </div>
          </div>
        );
      })}
      
      {valid_history_range && (startIndex > 0 || endIndex < history.length) && (
        <div className="mt-8 p-4 bg-warning-50 border border-warning-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-warning-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-warning-800">Partial History</h4>
              <p className="text-sm text-warning-700 mt-1">
                Showing turns {startIndex + 1}-{endIndex} of {history.length} total turns.
                {startIndex > 0 && ` ${startIndex} earlier turns hidden.`}
                {endIndex < history.length && ` ${history.length - endIndex} later turns hidden.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
