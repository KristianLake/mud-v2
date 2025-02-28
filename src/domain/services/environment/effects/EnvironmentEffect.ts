import { BaseGameService } from '../../BaseGameService';
import { logger } from '../../../../utils/logger';

// NOTE: This class seems to be a specific implementation detail of EnvironmentEffects
//       and might be better integrated directly into that class.  Keeping it
//       temporarily to satisfy the "continue" instruction.

export class EnvironmentEffect extends BaseGameService {
    private effectName: string;
    private duration: number; // Duration in milliseconds
    private timer: NodeJS.Timeout | null = null;

    constructor(effectName: string, duration: number) {
        super();
        this.effectName = effectName;
        this.duration = duration;
    }

    // Starts the environment effect.
    start(): void {
        if (this.timer) {
            logger.warn(`Effect already started: ${this.effectName}`);
            return;
        }

        logger.info(`Starting environment effect: ${this.effectName}`);
        this.timer = setTimeout(() => {
            this.stop();
        }, this.duration);

        // Add logic to apply the effect here
    }

    // Stops the environment effect.
    stop(): void {
        if (!this.timer) {
            logger.warn(`Effect not started: ${this.effectName}`);
            return;
        }

        logger.info(`Stopping environment effect: ${this.effectName}`);
        clearTimeout(this.timer);
        this.timer = null;

        // Add logic to remove the effect here
    }
}
