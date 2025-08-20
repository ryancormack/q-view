// Test for hybrid v1.14.0 format conversion
import { detectSchemaVersion } from '../versionDetection';
import { V1_14_Normalizer } from '../normalizers/v1.14.0Normalizer';

// Mock hybrid format data (like schema-fix.json)
const mockHybridData = {
  conversation_id: "test-hybrid",
  history: [
    {
      user: {
        additional_context: "",
        env_context: {
          operating_system: "macos",
          architecture: "arm64", // v1.14.0 specific field
          current_directory: "/test",
          env_state: {
            variables: {}
          }
        },
        content: {
          Prompt: {
            prompt: "Hello, this is a test prompt"
          }
        },
        timestamp: null,
        images: null
      },
      assistant: {
        Response: {
          message_id: "test-123",
          content: "Hello! This is a test response."
        }
      },
      request_metadata: {
        request_id: "test-request",
        message_id: "test-123",
        conversation_id: "test-hybrid",
        response_size: 100,
        tool_use_ids_and_names: [],
        message_meta_tags: []
      }
    }
  ],
  valid_history_range: [0, 1] as [number, number],
  transcript: [
    {
      role: "user",
      content: "Hello, this is a test prompt",
      timestamp: "2024-01-01T00:00:00Z"
    }
  ],
  tools: {},
  file_line_tracker: {}
};

console.log('Testing hybrid format detection...');
const detectedVersion = detectSchemaVersion(mockHybridData);
console.log('Detected version:', detectedVersion); // Should be 'v1.14.0'

console.log('\nTesting hybrid format normalization...');
try {
  // Cast to any to avoid strict type checking in test
  const normalized = V1_14_Normalizer.normalize(mockHybridData as any);
  console.log('Normalization successful!');
  console.log('Conversation ID:', normalized.conversation_id);
  console.log('History length:', normalized.history.length);
  
  if (normalized.history.length > 0) {
    const firstTurn = normalized.history[0];
    console.log('First turn messages:', firstTurn.length);
    
    // Check user message
    const userMessage = firstTurn[0];
    if ('content' in userMessage && userMessage.content && 'Prompt' in userMessage.content) {
      console.log('User prompt extracted:', userMessage.content.Prompt.prompt.substring(0, 50) + '...');
    }
    
    // Check assistant message
    if (firstTurn.length > 1) {
      const assistantMessage = firstTurn[1];
      if ('Response' in assistantMessage) {
        console.log('Assistant response extracted:', assistantMessage.Response.content.substring(0, 50) + '...');
      }
    }
  }
  
  console.log('Transcript length:', normalized.transcript.length);
} catch (error) {
  console.error('Normalization failed:', error);
}

console.log('\nHybrid format test completed!');

export {};
