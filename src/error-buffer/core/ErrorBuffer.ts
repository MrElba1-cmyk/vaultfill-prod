/**
 * VaultFill Error Buffer - Core Engine
 * 
 * Captures errors, buffers them for human review, supports retry with corrected input.
 * Designed as a singleton service that integrates at API and component boundaries.
 */

import { randomUUID } from 'crypto';
import {
  BufferedError,
  ErrorBufferConfig,
  ErrorContext,
  ErrorSeverity,
  ErrorStatus,
  RetryHandler,
} from './types';
import { ErrorNotifier } from '../notifications/ErrorNotifier';
import { ErrorLogger } from './ErrorLogger';

const SEVERITY_RANK: Record<ErrorSeverity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

const DEFAULT_CONFIG: ErrorBufferConfig = {
  maxBufferSize: 500,
  defaultMaxRetries: 3,
  notificationChannels: [{ type: 'console', config: {}, enabled: true }],
  notifySeverityThreshold: 'medium',
  autoRetryLowSeverity: false,
};

export class ErrorBuffer {
  private buffer: Map<string, BufferedError> = new Map();
  private retryHandlers: Map<string, RetryHandler> = new Map();
  private config: ErrorBufferConfig;
  private notifier: ErrorNotifier;
  private logger: ErrorLogger;

  constructor(config: Partial<ErrorBufferConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.notifier = new ErrorNotifier(this.config.notificationChannels);
    this.logger = new ErrorLogger();
  }

  /**
   * Capture an error into the buffer. This is the primary entry point.
   */
  async capture(
    error: Error,
    context: ErrorContext,
    severity: ErrorSeverity = 'medium'
  ): Promise<BufferedError> {
    // Evict oldest if at capacity
    if (this.buffer.size >= this.config.maxBufferSize) {
      this.evictOldest();
    }

    const buffered: BufferedError = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
      },
      context,
      severity,
      status: 'pending',
      retryCount: 0,
      maxRetries: this.config.defaultMaxRetries,
    };

    this.buffer.set(buffered.id, buffered);
    this.logger.log(buffered);

    // Notify if severity meets threshold
    if (SEVERITY_RANK[severity] >= SEVERITY_RANK[this.config.notifySeverityThreshold]) {
      await this.notifier.notify(buffered);
    }

    // Auto-retry low severity if configured
    if (this.config.autoRetryLowSeverity && severity === 'low') {
      await this.retry(buffered.id);
    }

    return buffered;
  }

  /**
   * Retry a buffered error, optionally with corrected input.
   */
  async retry(
    errorId: string,
    correctedInput?: Record<string, unknown>
  ): Promise<{ success: boolean; result?: unknown }> {
    const entry = this.buffer.get(errorId);
    if (!entry) throw new Error(`Error ${errorId} not found in buffer`);
    if (entry.status === 'resolved') throw new Error(`Error ${errorId} already resolved`);

    const handler = this.retryHandlers.get(entry.context.source);
    if (!handler) {
      this.logger.warn(`No retry handler registered for source: ${entry.context.source}`);
      return { success: false };
    }

    entry.status = 'retrying';
    entry.retryCount++;
    if (correctedInput) {
      entry.correctedInput = correctedInput;
      entry.context.inputData = correctedInput;
    }

    try {
      const result = await handler(entry);
      if (result.success) {
        entry.status = 'resolved';
        entry.resolvedAt = new Date().toISOString();
        this.logger.info(`Error ${errorId} resolved after ${entry.retryCount} retries`);
      } else {
        entry.status = entry.retryCount >= entry.maxRetries ? 'pending' : 'pending';
        if (result.error) {
          entry.error.message = result.error.message;
        }
      }
      return result;
    } catch (retryError) {
      entry.status = 'pending';
      entry.error.message = (retryError as Error).message;
      this.logger.error(`Retry failed for ${errorId}:`, retryError);
      return { success: false };
    }
  }

  /** Register a retry handler for a given error source */
  registerRetryHandler(source: string, handler: RetryHandler): void {
    this.retryHandlers.set(source, handler);
  }

  /** Acknowledge an error (human has seen it) */
  acknowledge(errorId: string, notes?: string): void {
    const entry = this.buffer.get(errorId);
    if (!entry) throw new Error(`Error ${errorId} not found`);
    entry.status = 'acknowledged';
    if (notes) entry.humanNotes = notes;
  }

  /** Dismiss an error */
  dismiss(errorId: string, resolvedBy?: string): void {
    const entry = this.buffer.get(errorId);
    if (!entry) throw new Error(`Error ${errorId} not found`);
    entry.status = 'dismissed';
    entry.resolvedAt = new Date().toISOString();
    entry.resolvedBy = resolvedBy;
  }

  /** Get all buffered errors, optionally filtered */
  list(filter?: { status?: ErrorStatus; source?: string; severity?: ErrorSeverity }): BufferedError[] {
    let entries = Array.from(this.buffer.values());
    if (filter?.status) entries = entries.filter(e => e.status === filter.status);
    if (filter?.source) entries = entries.filter(e => e.context.source === filter.source);
    if (filter?.severity) entries = entries.filter(e => e.severity === filter.severity);
    return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  /** Get a single error by ID */
  get(errorId: string): BufferedError | undefined {
    return this.buffer.get(errorId);
  }

  /** Get counts by status */
  stats(): Record<ErrorStatus, number> {
    const counts: Record<string, number> = { pending: 0, acknowledged: 0, retrying: 0, resolved: 0, dismissed: 0 };
    for (const entry of this.buffer.values()) {
      counts[entry.status] = (counts[entry.status] || 0) + 1;
    }
    return counts as Record<ErrorStatus, number>;
  }

  private evictOldest(): void {
    // Remove oldest resolved/dismissed first, then oldest pending
    const sorted = Array.from(this.buffer.entries())
      .sort((a, b) => a[1].timestamp.localeCompare(b[1].timestamp));
    
    const evictable = sorted.find(([, e]) => e.status === 'resolved' || e.status === 'dismissed')
      || sorted[0];
    
    if (evictable) this.buffer.delete(evictable[0]);
  }
}

/** Singleton instance */
let _instance: ErrorBuffer | null = null;

export function getErrorBuffer(config?: Partial<ErrorBufferConfig>): ErrorBuffer {
  if (!_instance) _instance = new ErrorBuffer(config);
  return _instance;
}

export function resetErrorBuffer(): void {
  _instance = null;
}
