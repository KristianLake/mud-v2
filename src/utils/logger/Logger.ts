import { LoggerConfig } from './LoggerConfig';
import { LogLevel, LogEntry } from '../../types/logging';

/**
 * Logger class for handling application logging.
 */
export class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private static instance: Logger;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config || new LoggerConfig());
    }
    return Logger.instance;
  }

  /**
   * Sets the minimum logging level.
   * @param level The minimum log level as a number (0=DEBUG, 1=INFO, 2=WARN, 3=ERROR)
   */
  setMinLevel(level: number): void {
    switch (level) {
      case 0:
        this.config.level = LogLevel.DEBUG;
        break;
      case 1:
        this.config.level = LogLevel.INFO;
        break;
      case 2:
        this.config.level = LogLevel.WARN;
        break;
      case 3:
        this.config.level = LogLevel.ERROR;
        break;
      default:
        this.config.level = LogLevel.INFO;
    }
  }

  /**
   * Sets the logging level.
   * @param level The log level to set.
   */
  setLevel(level: LogLevel | string): void {
    this.config.level = level;
  }

  /**
   * Logs a debug message.
   * @param message The message to log.
   * @param context Additional context information.
   * @param filename The name of the file where the log is being called.
   */
  debug(message: string, context?: any, filename?: string): void {
    if (this.config.level === LogLevel.DEBUG || this.config.level === 'debug') {
      const fileInfo = filename ? `[${filename}] ` : '';
      console.debug(`[DEBUG] ${fileInfo}${message}`, context);
      this.addLogEntry(LogLevel.DEBUG, message, context, filename);
    }
  }

  /**
   * Logs an info message.
   * @param message to log.
   * @param context Additional context information.
   * @param filename The name of the file where the log is being called.
   */
  info(message: string, context?: any, filename?: string): void {
    if ([LogLevel.DEBUG, LogLevel.INFO, 'debug', 'info'].includes(this.config.level)) {
      const fileInfo = filename ? `[${filename}] ` : '';
      console.info(`[INFO] ${fileInfo}${message}`, context);
      this.addLogEntry(LogLevel.INFO, message, context, filename);
    }
  }

  /**
   * Logs a warning message.
   * @param message The message to log.
   * @param context Additional context information.
   * @param filename The name of the file where the log is being called.
   */
  warn(message: string, context?: any, filename?: string): void {
    if ([LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, 'debug', 'info', 'warn'].includes(this.config.level)) {
      const fileInfo = filename ? `[${filename}] ` : '';
      console.warn(`[WARN] ${fileInfo}${message}`, context);
      this.addLogEntry(LogLevel.WARN, message, context, filename);
    }
  }

  /**
   * Logs an error message.
   * @param message The message to log.
   * @param context Additional context information.
   * @param filename The name of the file where the log is being called.
   */
  error(message: string, context?: any, filename?: string): void {
    const fileInfo = filename ? `[${filename}] ` : '';
    console.error(`[ERROR] ${fileInfo}${message}`, context);
    this.addLogEntry(LogLevel.ERROR, message, context, filename);
  }

  /**
   * Add a log entry to the internal log storage
   */
  private addLogEntry(level: LogLevel | string, message: string, context?: any, filename?: string): void {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
      filename
    };

    this.logs.push(logEntry);
    
    // Trim logs if they exceed the maximum
    if (this.logs.length > this.config.maxLogEntries) {
      this.logs = this.logs.slice(-this.config.maxLogEntries);
    }
  }

  /**
   * Get the most recent logs
   * @param count Number of logs to return (default: all logs)
   * @returns Array of log entries
   */
  getRecentLogs(count?: number): LogEntry[] {
    if (count && count > 0) {
      return this.logs.slice(-count);
    }
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }
}
