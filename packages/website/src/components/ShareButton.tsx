import React, { useState } from 'react';
import { ConversationData } from '../types';
import { createShareUrl } from '../utils/sharing';

interface ShareButtonProps {
  conversationData: ConversationData;
}

export function ShareButton({ conversationData }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<{ url?: string; error?: string } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    setShareResult(null);
    
    try {
      const result = await createShareUrl(conversationData);
      setShareResult(result);
      setShowModal(true);
    } catch (error) {
      setShareResult({
        error: error instanceof Error ? error.message : 'Failed to create share URL'
      });
      setShowModal(true);
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // Show brief success feedback
      const button = document.getElementById('copy-button');
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setShareResult(null);
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSharing ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Share URL...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share Conversation
          </>
        )}
      </button>

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {shareResult?.success ? 'Share Conversation' : 'Share Failed'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {shareResult?.success && shareResult.url ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Your conversation has been compressed and encoded into a shareable URL. 
                    Anyone with this link can view your conversation data.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shareable URL:
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={shareResult.url}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        id="copy-button"
                        onClick={() => copyToClipboard(shareResult.url!)}
                        className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex">
                      <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Privacy Notice</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          The conversation data is embedded in the URL itself. Anyone with this link can view your conversation. 
                          Only share with trusted recipients.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>• URL length: {shareResult.url.length.toLocaleString()} characters</p>
                    <p>• Data is compressed using browser-native gzip compression</p>
                    <p>• No server storage - all data is in the URL</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Unable to Create Share URL</h4>
                        <p className="text-sm text-red-700 mt-1">
                          {shareResult?.error || 'An unknown error occurred while creating the share URL.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Alternative Sharing Options:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Save the conversation JSON file and send it directly</li>
                      <li>• Share specific sections or summaries instead of the full conversation</li>
                      <li>• Use a file sharing service for very large conversations</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
