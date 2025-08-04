import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ConversationData } from '../types';
import { ConversationViewer } from '../components/ConversationViewer';
import { Header } from '../components/Header';
import { DemoNotice } from '../components/DemoNotice';
import { DemoSelector } from '../components/DemoSelector';
import { 
  loadDemoConversation, 
  getErrorMessage,
  DEMO_CONVERSATIONS
} from '../utils/demoDataLoader';

export function DemoPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleGoToUpload = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const loadData = useCallback(async (demoId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await loadDemoConversation(demoId);
      setConversationData(data);
      setSelectedDemo(demoId);
      // Update URL to reflect selected demo
      setSearchParams({ demo: demoId });
    } catch (err) {
      const errorMessage = err instanceof Error ? getErrorMessage(err) : 'An unexpected error occurred';
      setError(errorMessage);
      setConversationData(null);
    } finally {
      setLoading(false);
    }
  }, [setSearchParams]);

  const handleSelectDemo = useCallback((demoId: string) => {
    loadData(demoId);
  }, [loadData]);

  const handleRetry = useCallback(() => {
    if (selectedDemo) {
      setRetryCount(prev => prev + 1);
      loadData(selectedDemo);
    }
  }, [selectedDemo, loadData]);

  // Load demo from URL parameter on mount
  useEffect(() => {
    const demoParam = searchParams.get('demo');
    if (demoParam && DEMO_CONVERSATIONS.find(d => d.id === demoParam)) {
      loadData(demoParam);
    } else {
      // Default to first demo if no valid demo specified
      const defaultDemo = DEMO_CONVERSATIONS[0];
      if (defaultDemo) {
        loadData(defaultDemo.id);
      }
    }
  }, []); // Only run on mount

  // Loading state
  if (loading && !conversationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <Header isDemoMode={true} />
        
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mb-6"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Q CLI Demo</h2>
              <p className="text-gray-600">Preparing sample conversation with tool usage...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error && !conversationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <Header isDemoMode={true} />
        
        <main className="container mx-auto px-4 py-8">
          <DemoNotice onGoToUpload={handleGoToUpload} />
          
          <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg 
                  className="h-8 w-8 text-red-600" 
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
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Demo Data Unavailable
              </h3>
              
              <p className="text-gray-600 mb-8 text-lg">
                {error}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all cursor-pointer"
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
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
                  className="inline-flex items-center px-6 py-3 border-2 border-orange-300 text-base font-semibold rounded-lg shadow-sm text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all cursor-pointer"
                >
                  <svg 
                    className="w-5 h-5 mr-2" 
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
                  Upload Your Q CLI File
                </button>
              </div>
              
              {retryCount > 0 && (
                <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Retry attempt: <span className="font-semibold">{retryCount}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Success state with loaded data
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <Header isDemoMode={true} />
      
      <main className="container mx-auto px-4 py-8">
        <DemoNotice onGoToUpload={handleGoToUpload} />
        
        <DemoSelector
          selectedDemo={selectedDemo}
          onSelectDemo={handleSelectDemo}
          loading={loading}
        />
        
        {conversationData && (
          <ConversationViewer data={conversationData} />
        )}
      </main>
    </div>
  );
}