import { LogLevel } from '../../types/logging';

export class LoggerConfig {
  level: LogLevel | string = LogLevel.INFO;
  maxLogEntries: number = 1000;
}
