import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ConversationData } from '../types';
import { FileUpload } from '../components/FileUpload';
import { ConversationViewer } from '../components/ConversationViewer';
import { Header } from '../components/Header';

export function HomePage() {
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
          <>
            <FileUpload onFileUpload={handleFileUpload} onError={handleError} />
            
            {/* Demo page link */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <svg 
                    className="w-6 h-6 text-blue-600 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-blue-900">
                    Try the Demo
                  </h3>
                </div>
                <p className="text-blue-700 mb-4">
                  Want to see how it works first? Check out our demo with sample conversation data.
                </p>
                <Link
                  to="/demo"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  aria-label="View demo with sample conversation data"
                >
                  <svg 
                    className="w-4 h-4 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  View Demo
                </Link>
              </div>
            </div>
          </>
        ) : (
          <ConversationViewer data={conversationData} />
        )}
      </main>
    </div>
  );
}