import React from 'react';
import { DEMO_CONVERSATIONS, DemoConversation } from '../utils/demoDataLoader';

interface DemoSelectorProps {
  selectedDemo: string | null;
  onSelectDemo: (demoId: string) => void;
  loading?: boolean;
}

export function DemoSelector({ selectedDemo, onSelectDemo, loading = false }: DemoSelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Choose a Demo Conversation</h2>
          <p className="text-gray-600">Select from real Q CLI conversations to explore different use cases</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {DEMO_CONVERSATIONS.map((demo) => (
          <DemoCard
            key={demo.id}
            demo={demo}
            isSelected={selectedDemo === demo.id}
            onSelect={() => onSelectDemo(demo.id)}
            disabled={loading}
          />
        ))}
      </div>
    </div>
  );
}

interface DemoCardProps {
  demo: DemoConversation;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

function DemoCard({ demo, isSelected, onSelect, disabled = false }: DemoCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`text-left p-6 rounded-lg border-2 transition-all ${
        isSelected
          ? 'border-orange-500 bg-orange-50 shadow-md'
          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 pr-2">{demo.title}</h3>
        {isSelected && (
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{demo.description}</p>
      
      <div className="flex flex-wrap gap-2">
        {demo.tags.map((tag) => (
          <span
            key={tag}
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              isSelected
                ? 'bg-orange-200 text-orange-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}
