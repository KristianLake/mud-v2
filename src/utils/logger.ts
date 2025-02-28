// This file is a bridge to ensure backward compatibility
// with components that might be importing from this path directly
import { logger, Logger, LoggerConfig, LogLevel } from './logger/index';
import type { LogEntry } from '../types/logging';

// Re-export everything from the logger module
export { logger, Logger, LoggerConfig, LogLevel };
export type { LogEntry };

// Add any missing methods for backward compatibility
if (!logger.setMinLevel) {
  logger.setMinLevel = function(level: number) {
    switch (level) {
      case 0:
        this.setLevel(LogLevel.DEBUG);
        break;
      case 1:
        this.setLevel(LogLevel.INFO);
        break;
      case 2:
        this.setLevel(LogLevel.WARN);
        break;
      case 3:
        this.setLevel(LogLevel.ERROR);
        break;
      default:
        this.setLevel(LogLevel.INFO);
    }
  };
}
