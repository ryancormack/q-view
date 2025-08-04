import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConversationData } from '../types';
import { ConversationViewer } from '../components/ConversationViewer';
import { Header } from '../components/Header';
import { DemoNotice } from '../components/DemoNotice';
import { 
  loadDemoData, 
  getErrorMessage
} from '../utils/demoDataLoader';

export function DemoPage() {
  const navigate = useNavigate();
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleGoToUpload = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await loadDemoData();
      setConversationData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : 'An unexpected error occurred';
      setError(errorMessage);
      setConversationData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    loadData();
  }, [loadData]);

  // Load demo data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header isDemoMode={true} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Loading demo conversation...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header isDemoMode={true} />
        
        <main className="container mx-auto px-4 py-8">
          <DemoNotice onGoToUpload={handleGoToUpload} />
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-100 mb-4">
                <svg 
                  className="h-6 w-6 text-error-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to Load Demo Data
              </h3>
              
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {error}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                    />
                  </svg>
                  Try Again
                </button>
                
                <button
                  onClick={handleGoToUpload}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                    />
                  </svg>
                  Upload Your Own File
                </button>
              </div>
              
              {retryCount > 0 && (
                <p className="text-sm text-gray-500 mt-4">
                  Retry attempt: {retryCount}
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Success state with loaded data
  return (
    <div className="min-h-screen bg-gray-50">
      <Header isDemoMode={true} />
      
      <main className="container mx-auto px-4 py-8">
        <DemoNotice onGoToUpload={handleGoToUpload} />
        
        {conversationData && (
          <ConversationViewer data={conversationData} />
        )}
      </main>
    </div>
  );
}