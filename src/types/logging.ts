/**
 * Available log levels for the logging system
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Structure of a log entry
 */
export interface LogEntry {
  level: LogLevel | string;
  message: string;
  timestamp: number;
  context?: any;
  filename?: string;
}
