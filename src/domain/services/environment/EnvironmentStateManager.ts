import { logger } from '../../../utils/logger';

export class EnvironmentStateManager {
    async initialize(): Promise<void> {
        logger.debug('Initializing EnvironmentStateManager');
    }

    async cleanup(): Promise<void> {
        logger.debug('Cleaning up EnvironmentStateManager');
    }
}
