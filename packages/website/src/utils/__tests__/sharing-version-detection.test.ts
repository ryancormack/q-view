// Test to verify that version detection works after sharing optimization
import { detectSchemaVersion } from '../versionDetection';

// Mock v1.14.0 conversation data (like what would be shared)
const mockV1_14_ConversationData = {
  conversation_id: "test-v1.14.0-shared",
  history: [
    {
      user: {
        additional_context: "",
        env_context: {
          operating_system: "macos",
          architecture: "arm64",
          current_directory: "/test"
        },
        content: {
          Prompt: {
            prompt: "Test prompt"
          }
        }
      },
      assistant: {
        Response: {
          message_id: "test-123",
          content: "Test response"
        }
      },
      request_metadata: {
        message_id: "test-123",
        conversation_id: "test-v1.14.0-shared",
        tool_use_ids_and_names: [],
        model_id: "claude-3-5-sonnet"
      }
    }
  ],
  valid_history_range: [0, 1] as [number, number],
  transcript: [
    {
      role: "user",
      content: "Test prompt",
      timestamp: "2024-01-01T00:00:00Z"
    }
  ],
  tools: {},
  file_line_tracker: {},
  model_info: {
    model_id: "claude-3-5-sonnet",
    model_name: "Claude 3.5 Sonnet"
  }
};

// Mock v1.10.0 conversation data
const mockV1_10_ConversationData = {
  conversation_id: "test-v1.10.0-shared",
  history: [
    [
      {
        additional_context: "",
        content: {
          Prompt: {
            prompt: "Test prompt"
          }
        }
      },
      {
        Response: {
          message_id: "test-123",
          content: "Test response"
        }
      }
    ]
  ],
  transcript: ["user: Test prompt", "assistant: Test response"],
  tools: {}
};

console.log('Testing version detection after sharing optimization...');

// Test v1.14.0 detection
const v1_14_version = detectSchemaVersion(mockV1_14_ConversationData);
console.log('v1.14.0 conversation detected as:', v1_14_version);
console.log('✓ Should be v1.14.0:', v1_14_version === 'v1.14.0' ? 'PASS' : 'FAIL');

// Test v1.10.0 detection  
const v1_10_version = detectSchemaVersion(mockV1_10_ConversationData);
console.log('v1.10.0 conversation detected as:', v1_10_version);
console.log('✓ Should be v1.10.0:', v1_10_version === 'v1.10.0' ? 'PASS' : 'FAIL');

console.log('\nVersion detection test completed!');

export {};
