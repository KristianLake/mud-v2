import { logger } from './logger';

export class StateLogger {
    logStateChange(newState: any, oldState: any): void {
        logger.debug('Game state changed', { oldState, newState });
    }

    logStateSnapshot(state: any, description: string): void {
        logger.debug(`State snapshot: ${description}`, { state });
    }

    logStateError(error: Error, context?: any): void {
        logger.error('State error', { error, context });
    }
}
