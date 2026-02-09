/**
 * VaultFill Error Buffer — Public API
 */

// Core
export { ErrorBuffer, getErrorBuffer, resetErrorBuffer } from './core/ErrorBuffer';
export { ErrorLogger } from './core/ErrorLogger';
export type {
  BufferedError,
  ErrorBufferConfig,
  ErrorContext,
  ErrorSeverity,
  ErrorSource,
  ErrorStatus,
  NotificationChannel,
  RetryHandler,
} from './core/types';

// Notifications
export { ErrorNotifier } from './notifications/ErrorNotifier';

// Middleware
export { withErrorBuffer, expressErrorBuffer } from './middleware/errorBufferMiddleware';

// API routes
export { GET, acknowledgeError, retryError, dismissError } from './api/errorBufferApi';
