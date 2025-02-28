import { Logger } from './Logger';
import { LoggerConfig } from './LoggerConfig';
import { LogLevel } from '../../types/logging';
import type { LogEntry } from '../../types/logging';

// Create a singleton logger instance
const loggerConfig = new LoggerConfig();
// Use getInstance to ensure we have a singleton
const logger = Logger.getInstance(loggerConfig);

// Export types and logger instance
export { 
  logger, 
  Logger,
  LoggerConfig,
  LogLevel
};

// Re-export the type (not the implementation)
export type { LogEntry };
