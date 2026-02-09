/**
 * Structured error logger for the Error Buffer system.
 */

import { BufferedError } from './types';

export class ErrorLogger {
  private logStore: Array<{ timestamp: string; level: string; message: string; data?: unknown }> = [];

  log(entry: BufferedError): void {
    const record = {
      timestamp: entry.timestamp,
      level: 'error',
      message: `[ErrorBuffer] Captured: ${entry.error.message}`,
      data: {
        id: entry.id,
        source: entry.context.source,
        severity: entry.severity,
        userId: entry.context.userId,
        inputDataKeys: entry.context.inputData ? Object.keys(entry.context.inputData) : [],
        errorCode: entry.error.code,
      },
    };
    this.logStore.push(record);
    console.error(JSON.stringify(record));
  }

  info(message: string, data?: unknown): void {
    const record = { timestamp: new Date().toISOString(), level: 'info', message: `[ErrorBuffer] ${message}`, data };
    this.logStore.push(record);
    console.log(JSON.stringify(record));
  }

  warn(message: string, data?: unknown): void {
    const record = { timestamp: new Date().toISOString(), level: 'warn', message: `[ErrorBuffer] ${message}`, data };
    this.logStore.push(record);
    console.warn(JSON.stringify(record));
  }

  error(message: string, data?: unknown): void {
    const record = { timestamp: new Date().toISOString(), level: 'error', message: `[ErrorBuffer] ${message}`, data };
    this.logStore.push(record);
    console.error(JSON.stringify(record));
  }

  /** Get recent log entries (for dashboard) */
  getRecent(limit = 50): typeof this.logStore {
    return this.logStore.slice(-limit);
  }
}
