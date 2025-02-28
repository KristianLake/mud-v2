import { logger } from '../../utils/logger';

export class EffectManager {
    async initialize(): Promise<void> {
        logger.info('EffectManager initialized');
    }

    async cleanup(): Promise<void> {
        logger.info('EffectManager cleanup');
    }
}
