/**
 * React hook for LivePreview and dashboard components.
 * Captures client-side errors and provides error buffer state.
 */

import { useCallback, useRef } from 'react';

interface ClientError {
  message: string;
  source: string;
  inputData?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface UseErrorBufferReturn {
  captureError: (error: Error, context: Omit<ClientError, 'message'>) => Promise<string | null>;
  wrapAsync: <T>(fn: () => Promise<T>, context: Omit<ClientError, 'message'>) => Promise<T | null>;
}

/**
 * Hook for LivePreview and other React components to capture errors
 * into the server-side error buffer via API.
 */
export function useErrorBuffer(): UseErrorBufferReturn {
  const pendingRef = useRef(false);

  const captureError = useCallback(async (
    error: Error,
    context: Omit<ClientError, 'message'>
  ): Promise<string | null> => {
    try {
      const resp = await fetch('/api/error-buffer/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          source: context.source,
          inputData: context.inputData,
          severity: context.severity || 'medium',
        }),
      });
      const data = await resp.json();
      return data.errorId || null;
    } catch {
      console.error('[useErrorBuffer] Failed to report error to buffer');
      return null;
    }
  }, []);

  const wrapAsync = useCallback(async <T>(
    fn: () => Promise<T>,
    context: Omit<ClientError, 'message'>
  ): Promise<T | null> => {
    try {
      return await fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      await captureError(err, context);
      return null;
    }
  }, [captureError]);

  return { captureError, wrapAsync };
}
