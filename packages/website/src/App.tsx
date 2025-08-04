import React, { useState, useCallback } from 'react';
import { ConversationData } from './types';
import { FileUpload } from './components/FileUpload';
import { ConversationViewer } from './components/ConversationViewer';
import { Header } from './components/Header';

function App() {
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((data: ConversationData) => {
    setConversationData(data);
    setError(null);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setConversationData(null);
  }, []);

  const handleReset = useCallback(() => {
    setConversationData(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onReset={conversationData ? handleReset : undefined} />
      
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-error-800">Error</h3>
                <div className="mt-2 text-sm text-error-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!conversationData ? (
          <FileUpload onFileUpload={handleFileUpload} onError={handleError} />
        ) : (
          <ConversationViewer data={conversationData} />
        )}
      </main>
    </div>
  );
}

export default App;
