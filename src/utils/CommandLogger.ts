import { logger } from './logger';

export class CommandLogger {
    logCommandExecution(command: string, args: string[]): void {
        logger.info(`Executing command: ${command} with arguments: ${args.join(', ')}`);
    }

    logCommandResult(command: string, result: string): void {
        logger.info(`Command ${command} result: ${result}`);
    }

    logCommandError(command: string, error: Error): void {
        logger.error(`Command ${command} failed: ${error.message}`);
    }
}
