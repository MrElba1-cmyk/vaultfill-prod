/**
 * VaultFill Error Buffer - Core Types
 * 
 * Modular type definitions for the HITL error handling system.
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorStatus = 'pending' | 'acknowledged' | 'retrying' | 'resolved' | 'dismissed';
export type ErrorSource = 'api/leads' | 'api/knowledge' | 'live-preview' | 'document-processing' | 'unknown';

export interface ErrorContext {
  /** Original input data that caused the error */
  inputData?: Record<string, unknown>;
  /** User or session identifier */
  userId?: string;
  /** Which endpoint/component originated the error */
  source: ErrorSource;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export interface BufferedError {
  id: string;
  timestamp: string;
  error: {
    message: string;
    stack?: string;
    code?: string;
  };
  context: ErrorContext;
  severity: ErrorSeverity;
  status: ErrorStatus;
  retryCount: number;
  maxRetries: number;
  /** Human notes added during review */
  humanNotes?: string;
  /** Corrected input for retry */
  correctedInput?: Record<string, unknown>;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ErrorBufferConfig {
  maxBufferSize: number;
  defaultMaxRetries: number;
  notificationChannels: NotificationChannel[];
  /** Severity threshold for notifications (errors at or above this trigger alerts) */
  notifySeverityThreshold: ErrorSeverity;
  /** Auto-retry for low-severity errors */
  autoRetryLowSeverity: boolean;
}

export interface NotificationChannel {
  type: 'telegram' | 'webhook' | 'console';
  config: Record<string, string>;
  enabled: boolean;
}

export interface RetryHandler {
  (error: BufferedError): Promise<{ success: boolean; result?: unknown; error?: Error }>;
}
