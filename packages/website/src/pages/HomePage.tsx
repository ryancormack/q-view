import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ConversationWithMetadata } from '../types';
import { FileUpload } from '../components/FileUpload';
import { ConversationViewer } from '../components/ConversationViewer';
import { Header } from '../components/Header';
import { SchemaViewer } from '../components/SchemaViewer';

export function HomePage() {
  const [conversationData, setConversationData] = useState<ConversationWithMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSchema, setShowSchema] = useState(false);

  const handleFileUpload = useCallback((data: ConversationWithMetadata) => {
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <Header onReset={conversationData ? handleReset : undefined} />
      
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!conversationData ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Understand Your <span className="text-orange-600">Amazon Q Developer</span> Conversations
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Upload your Q CLI conversation JSON files to visualize tool usage, understand conversation flow, 
                  and explore how Amazon Q Developer processes your requests.
                </p>
                
                {/* Key Features */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tool Usage Analytics</h3>
                    <p className="text-gray-600">See which tools Q Developer uses most frequently and understand their parameters.</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversation Flow</h3>
                    <p className="text-gray-600">Visualize the back-and-forth between you and Q Developer with clear message types.</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-md border border-orange-100">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy & Security First</h3>
                    <p className="text-gray-600">All conversations are processed locally in your browser - no data leaves your device.</p>
                  </div>
                </div>
              </div>
            </div>

            <FileUpload onFileUpload={handleFileUpload} onError={handleError} />
            
            {/* Schema Link */}
            <div className="max-w-2xl mx-auto mt-12">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-purple-900 mb-3">
                  View JSON Schema
                </h3>
                <p className="text-purple-700 mb-6">
                  Understand the expected format for Q CLI conversation files and see the complete data structure.
                </p>
                <button
                  onClick={() => setShowSchema(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  View Schema
                </button>
              </div>
            </div>

            {/* How to Get Your Data */}
            <div className="max-w-4xl mx-auto mt-12 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                How to Get Your Q CLI Conversation Data
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                    Save from Q CLI Chat
                  </h4>
                  <p className="text-gray-600 mb-4">
                    While in an active Q CLI chat session, use the <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">/save</code> command to export your conversation to a JSON file.
                  </p>
                  <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm text-gray-800 mb-3">
                    /save ~/my-conversation.json
                  </div>
                  <p className="text-xs text-gray-500">
                    Add <code className="bg-gray-100 px-1 rounded">-f</code> or <code className="bg-gray-100 px-1 rounded">--force</code> to overwrite existing files
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                    Upload & Analyze
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Simply drag and drop your saved conversation JSON file above to start exploring your Q Developer interactions.
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Files are processed locally in your browser
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> Q CLI also supports automatic directory-based persistence and loading with <code className="bg-blue-100 px-1 rounded">/load</code> commands.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <ConversationViewer conversationWithMetadata={conversationData} />
        )}

        {/* Schema Modal */}
        {showSchema && (
          <SchemaViewer onClose={() => setShowSchema(false)} />
        )}
      </main>
    </div>
  );
}