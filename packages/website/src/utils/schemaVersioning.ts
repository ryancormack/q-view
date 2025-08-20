import { ConversationData } from '../types';
import { SupportedVersion, getVersionFeatures } from './versionDetection';
import { V1_14_Normalizer } from './normalizers/v1.14.0Normalizer';
import { normalizeConversationData as v1_10_Normalizer } from './conversationNormalizer';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SchemaVersionConfig {
  version: SupportedVersion;
  schemaPath: string;
  normalizer: (data: any) => ConversationData;
  features: string[];
  description: string;
}

export interface NormalizationResult {
  normalized: ConversationData;
  detectedVersion: SupportedVersion;
  originalFormat: string;
  metadata?: any;
  validation: ValidationResult;
}

/**
 * Configuration for each supported schema version
 */
export const VERSION_HANDLERS: Record<SupportedVersion, SchemaVersionConfig> = {
  'v1.10.0': {
    version: 'v1.10.0',
    schemaPath: '/schemas/v1.10.0.json',
    normalizer: v1_10_Normalizer,
    features: getVersionFeatures('v1.10.0'),
    description: 'Legacy Q CLI conversation format with basic tool tracking'
  },
  'v1.14.0': {
    version: 'v1.14.0',
    schemaPath: '/schemas/v1.14.0.json',
    normalizer: V1_14_Normalizer.normalize,
    features: getVersionFeatures('v1.14.0'),
    description: 'Enhanced Q CLI format with metadata, file tracking, and tool origins'
  }
};

/**
 * Schema cache to avoid repeated fetches
 */
const schemaCache = new Map<string, any>();

/**
 * Loads a JSON schema for the specified version
 */
export async function loadSchema(version: SupportedVersion): Promise<any> {
  const cacheKey = version;
  
  if (schemaCache.has(cacheKey)) {
    return schemaCache.get(cacheKey);
  }

  try {
    const config = VERSION_HANDLERS[version];
    if (!config) {
      throw new Error(`Unsupported schema version: ${version}`);
    }

    const response = await fetch(config.schemaPath);
    if (!response.ok) {
      throw new Error(`Failed to load schema: ${response.statusText}`);
    }

    const schema = await response.json();
    schemaCache.set(cacheKey, schema);
    return schema;
  } catch (error) {
    console.error(`Error loading schema for version ${version}:`, error);
    throw error;
  }
}

/**
 * Validates conversation data against its detected schema version
 */
export async function validateConversationData(
  data: any, 
  version: SupportedVersion
): Promise<ValidationResult> {
  try {
    const schema = await loadSchema(version);
    
    // Basic validation - in a real implementation, you'd use a JSON Schema validator
    // like Ajv here. For now, we'll do basic structural validation.
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic required field validation
    if (!data.conversation_id) {
      errors.push('Missing required field: conversation_id');
    }

    if (!Array.isArray(data.history)) {
      errors.push('Missing or invalid field: history must be an array');
    }

    // Version-specific validation
    if (version === 'v1.14.0') {
      if (!data.file_line_tracker) {
        warnings.push('v1.14.0 conversations typically include file_line_tracker');
      }
      
      if (!Array.isArray(data.valid_history_range) || data.valid_history_range.length !== 2) {
        errors.push('v1.14.0 requires valid_history_range as array of 2 numbers');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: []
    };
  }
}

/**
 * Gets the configuration for a specific schema version
 */
export function getVersionConfig(version: SupportedVersion): SchemaVersionConfig {
  const config = VERSION_HANDLERS[version];
  if (!config) {
    throw new Error(`Unsupported schema version: ${version}`);
  }
  return config;
}

/**
 * Gets all supported schema versions
 */
export function getSupportedVersions(): SupportedVersion[] {
  return Object.keys(VERSION_HANDLERS) as SupportedVersion[];
}

/**
 * Checks if a schema version is supported
 */
export function isVersionSupported(version: string): version is SupportedVersion {
  return version in VERSION_HANDLERS;
}

/**
 * Gets version-specific metadata extraction function
 */
export function extractVersionMetadata(data: any, version: SupportedVersion): any {
  switch (version) {
    case 'v1.14.0':
      return V1_14_Normalizer.extractMetadata(data);
    case 'v1.10.0':
    default:
      return null;
  }
}

/**
 * Normalizes conversation data using the appropriate version handler
 */
export async function normalizeWithVersion(data: any, version: SupportedVersion): Promise<NormalizationResult> {
  const config = getVersionConfig(version);
  
  // Validate the data
  const validation = await validateConversationData(data, version);
  
  // Normalize the data
  const normalized = config.normalizer(data);
  
  // Extract version-specific metadata
  const metadata = extractVersionMetadata(data, version);
  
  return {
    normalized,
    detectedVersion: version,
    originalFormat: version,
    metadata,
    validation
  };
}

/**
 * Gets a user-friendly version display name
 */
export function getVersionDisplayName(version: SupportedVersion): string {
  const displayNames: Record<SupportedVersion, string> = {
    'v1.10.0': 'Schema v1.10.0',
    'v1.14.0': 'Schema v1.14.0'
  };
  
  return displayNames[version] || version;
}

/**
 * Gets version compatibility information
 */
export function getVersionCompatibility(version: SupportedVersion): {
  canReadVersions: SupportedVersion[];
  isLatest: boolean;
  deprecationWarning?: string;
} {
  const allVersions = getSupportedVersions();
  const versionIndex = allVersions.indexOf(version);
  const isLatest = versionIndex === allVersions.length - 1;
  
  return {
    canReadVersions: allVersions.slice(0, versionIndex + 1),
    isLatest,
    deprecationWarning: version === 'v1.10.0' 
      ? 'This is a legacy format. Consider upgrading to v1.14.0 for enhanced features.'
      : undefined
  };
}
