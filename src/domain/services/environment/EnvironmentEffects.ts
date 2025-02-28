import { IEnvironmentService } from './IEnvironmentService';
import { IEventService } from '../event/IEventService';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

// NOTE: This class seems to duplicate functionality in EnvironmentService.
//       It should likely be removed or significantly refactored.  Keeping it
//       temporarily to satisfy the "continue" instruction.

export class EnvironmentEffects extends BaseGameService {
    private environmentService: IEnvironmentService;

    constructor() {
        super();
        this.environmentService = this.container.resolve<IEnvironmentService>(ServiceTokens.EnvironmentService);
        this.initializeListeners();
    }

    async initialize(): Promise<void> {
      logger.info('EnvironmentEffects initialized');
    }

    private initializeListeners(): void {
        // Example: Listen for a time change event and trigger corresponding effects
        this.eventService.on('timeChange', (data: { timeOfDay: string }) => {
            logger.debug('EnvironmentEffects received timeChange event', { timeOfDay: data.timeOfDay });
            this.applyTimeOfDayEffects(data.timeOfDay);
        });
    }

    // Applies effects based on the time of day.
    applyTimeOfDayEffects(timeOfDay: string): void {
        switch (timeOfDay) {
            case 'day':
                logger.info('Applying daytime environment effects');
                // Implement daytime effects (e.g., ambient sounds, visual changes)
                break;
            case 'night':
                logger.info('Applying nighttime environment effects');
                // Implement nighttime effects (e.g., different sounds, darker visuals)
                break;
            default:
                logger.warn(`Unknown time of day: ${timeOfDay}`);
        }
    }
}
