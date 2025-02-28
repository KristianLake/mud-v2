import { logger } from '../../../utils/logger';

export class EffectManager {
    async initialize(): Promise<void> {
        logger.debug('Initializing EffectManager');
    }

    async cleanup(): Promise<void> {
        logger.debug('Cleaning up EffectManager');
    }
}
