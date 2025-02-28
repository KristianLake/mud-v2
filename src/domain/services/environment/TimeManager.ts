import { IEnvironmentService } from './IEnvironmentService';
import { IEventService } from '../event/IEventService';
import { IStateService } from '../state/IStateService';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

// NOTE: This class seems to duplicate functionality in EnvironmentService.
//       It should likely be removed or significantly refactored.  Keeping it
//       temporarily to satisfy the "continue" instruction.

export class TimeManager extends BaseGameService {
    private environmentService: IEnvironmentService;
    private stateService: IStateService;
    private timer: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.environmentService = this.container.resolve<IEnvironmentService>(ServiceTokens.EnvironmentService);
        this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
    }

    async initialize(): Promise<void> {
      // Initialization logic here, if any
      logger.info('TimeManager initialized');
    }

    // Starts the time cycle.
    startTimeCycle(): void {
        if (this.timer) {
            logger.warn('Time cycle already started');
            return;
        }

        logger.info('Starting time cycle');
        this.timer = setInterval(() => {
            this.updateTime();
        }, 60000); // Update time every 60 seconds (adjust as needed)
    }

    // Stops the time cycle.
    stopTimeCycle(): void {
        if (!this.timer) {
            logger.warn('Time cycle not started');
            return;
        }

        logger.info('Stopping time cycle');
        clearInterval(this.timer);
        this.timer = null;
    }

    // Updates the time of day.
    private updateTime(): void {
        const gameState = this.stateService.getState();
        const currentTime = gameState.timeOfDay;

        // Basic time progression logic (can be expanded)
        const newTime = currentTime === 'day' ? 'night' : 'day';

        this.stateService.updateState({ timeOfDay: newTime });
        this.eventService.emit('timeChange', { timeOfDay: newTime });
        logger.info(`Time updated to: ${newTime}`);
    }
}
