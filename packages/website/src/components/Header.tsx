import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onReset?: () => void;
  isDemoMode?: boolean;
}

export function Header({ onReset, isDemoMode = false }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-4 group">
            {/* Q CLI Logo */}
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <div className="text-2xl font-bold text-orange-600">Q</div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-300 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-orange-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-white group-hover:text-orange-100 transition-colors">
                  Q CLI Conversation Viewer
                </h1>
                {isDemoMode && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-200 text-orange-800 border border-orange-300">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Demo Mode
                  </span>
                )}
              </div>
              <p className="text-orange-100 text-sm font-medium">
                {isDemoMode 
                  ? "Exploring Amazon Q Developer conversation patterns" 
                  : "Visualize and understand your Amazon Q Developer conversations"
                }
              </p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* GitHub Link */}
            <a
              href="https://github.com/ryancormack/q-view"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-orange-100 hover:text-white hover:bg-orange-400 rounded-lg transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            
            {/* Demo Link */}
            <Link
              to="/demo?demo=original-demo"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-orange-100 hover:text-white hover:bg-orange-400 rounded-lg transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Demo
            </Link>
            
            {onReset && (
              <button
                onClick={onReset}
                className="inline-flex items-center px-4 py-2 border-2 border-orange-200 rounded-lg text-sm font-semibold text-white bg-orange-400 hover:bg-orange-300 hover:text-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-300 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Load New Conversation
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
