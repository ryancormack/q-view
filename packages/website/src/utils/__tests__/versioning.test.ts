// Basic test to verify versioning system functionality
// This would be expanded with proper test framework in production

import { detectSchemaVersion, hasV1_14_Structure, hasV1_10_Structure } from '../versionDetection';
import { V1_14_Normalizer } from '../normalizers/v1.14.0Normalizer';

// Mock v1.10.0 conversation data
const mockV1_10_Data = {
  conversation_id: "test-v1.10.0",
  history: [
    [
      {
        additional_context: "test",
        content: {
          Prompt: { prompt: "Hello" }
        }
      },
      {
        Response: {
          message_id: "123",
          content: "Hi there!"
        }
      }
    ]
  ],
  transcript: ["user: Hello", "assistant: Hi there!"],
  tools: {}
};

// Mock v1.14.0 conversation data
const mockV1_14_Data = {
  conversation_id: "test-v1.14.0",
  history: [
    {
      user: {
        additional_context: "test",
        env_context: {
          operating_system: "macos",
          architecture: "arm64",
          current_directory: "/test"
        }
      },
      assistant: {
        message_id: "123",
        content: [
          {
            content_type: "text",
            text: "Hi there!"
          }
        ]
      }
    }
  ],
  valid_history_range: [0, 1] as [number, number],
  transcript: [
    {
      role: "user",
      content: "Hello",
      timestamp: "2024-01-01T00:00:00Z"
    }
  ],
  tools: {},
  file_line_tracker: {}
};

// Test version detection
console.log('Testing version detection...');

console.log('v1.10.0 detection:', detectSchemaVersion(mockV1_10_Data)); // Should be 'v1.10.0'
console.log('v1.14.0 detection:', detectSchemaVersion(mockV1_14_Data)); // Should be 'v1.14.0'

console.log('v1.10.0 structure check:', hasV1_10_Structure(mockV1_10_Data)); // Should be true
console.log('v1.14.0 structure check:', hasV1_14_Structure(mockV1_14_Data)); // Should be true

// Test normalization
console.log('\nTesting v1.14.0 normalization...');
try {
  const normalized = V1_14_Normalizer.normalize(mockV1_14_Data);
  console.log('Normalization successful:', {
    conversation_id: normalized.conversation_id,
    historyLength: normalized.history.length,
    hasTranscript: Array.isArray(normalized.transcript)
  });
} catch (error) {
  console.error('Normalization failed:', error);
}

console.log('\nVersioning system test completed!');

export {}; // Make this a module
