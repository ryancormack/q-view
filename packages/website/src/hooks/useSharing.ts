import { useState, useCallback, useRef } from 'react';
import { ConversationData } from '../types';
import { createShareUrl, parseShareUrl, ProgressCallback } from '../utils/sharing';

export interface SharingState {
  isCreating: boolean;
  isParsing: boolean;
  progress: number;
  stage: string;
  error: string | null;
  shareUrl: string | null;
  compressionStats: {
    originalSize: number;
    compressedSize: number;
    ratio: string;
  } | null;
}

export interface SharingActions {
  createShare: (conversationData: ConversationData) => Promise<void>;
  parseShare: (url?: string) => Promise<ConversationData | null>;
  cancelOperation: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: SharingState = {
  isCreating: false,
  isParsing: false,
  progress: 0,
  stage: '',
  error: null,
  shareUrl: null,
  compressionStats: null,
};

export function useSharing(): [SharingState, SharingActions] {
  const [state, setState] = useState<SharingState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateProgress: ProgressCallback = useCallback((stage: string, progress = 0) => {
    setState(prev => ({
      ...prev,
      stage,
      progress: Math.round(progress),
    }));
  }, []);

  const createShare = useCallback(async (conversationData: ConversationData) => {
    // Cancel any existing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setState(prev => ({
      ...prev,
      isCreating: true,
      error: null,
      progress: 0,
      stage: 'Starting...',
      shareUrl: null,
      compressionStats: null,
    }));

    try {
      const result = await createShareUrl(conversationData, updateProgress, signal);
      
      if (signal.aborted) {
        return;
      }

      if (result.success) {
        setState(prev => ({
          ...prev,
          isCreating: false,
          shareUrl: result.url || null,
          compressionStats: result.compressionStats || null,
          progress: 100,
          stage: 'Complete!',
        }));
      } else {
        setState(prev => ({
          ...prev,
          isCreating: false,
          error: result.error || 'Failed to create share URL',
          compressionStats: result.compressionStats || null,
        }));
      }
    } catch (error) {
      if (signal.aborted) {
        setState(prev => ({
          ...prev,
          isCreating: false,
          error: 'Share creation was cancelled',
          progress: 0,
          stage: '',
        }));
      } else {
        setState(prev => ({
          ...prev,
          isCreating: false,
          error: error instanceof Error ? error.message : 'Failed to create share URL',
        }));
      }
    }
  }, [updateProgress]);

  const parseShare = useCallback(async (url?: string): Promise<ConversationData | null> => {
    // Cancel any existing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setState(prev => ({
      ...prev,
      isParsing: true,
      error: null,
      progress: 0,
      stage: 'Starting...',
    }));

    try {
      const result = await parseShareUrl(updateProgress);
      
      if (signal.aborted) {
        return null;
      }

      if (result.data) {
        setState(prev => ({
          ...prev,
          isParsing: false,
          progress: 100,
          stage: 'Complete!',
        }));
        return result.data;
      } else if (result.error) {
        setState(prev => ({
          ...prev,
          isParsing: false,
          error: result.error || 'Failed to parse shared URL',
        }));
      } else {
        // No shared data found (normal case)
        setState(prev => ({
          ...prev,
          isParsing: false,
          progress: 0,
          stage: '',
        }));
      }
      
      return null;
    } catch (error) {
      if (signal.aborted) {
        setState(prev => ({
          ...prev,
          isParsing: false,
          error: 'URL parsing was cancelled',
          progress: 0,
          stage: '',
        }));
      } else {
        setState(prev => ({
          ...prev,
          isParsing: false,
          error: error instanceof Error ? error.message : 'Failed to parse shared URL',
        }));
      }
      return null;
    }
  }, [updateProgress]);

  const cancelOperation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const reset = useCallback(() => {
    cancelOperation();
    setState(initialState);
  }, [cancelOperation]);

  const actions: SharingActions = {
    createShare,
    parseShare,
    cancelOperation,
    clearError,
    reset,
  };

  return [state, actions];
}
