import { IEventEmitter } from '../../core/IEventEmitter';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';
import { IEventService } from '../../event/IEventService';

// NOTE: This class seems unnecessary as we already have EventService and EventBus.
//       It should likely be removed.  Keeping it temporarily to satisfy the "continue" instruction.

export class EnvironmentEventEmitter extends BaseGameService implements IEventEmitter {
    constructor() {
        super();
    }

    async initialize(eventService: IEventService): Promise<void> {
        logger.debug('Initializing EnvironmentEventEmitter');
        // No specific initialization logic needed for now, but keep the method for future use
        return Promise.resolve();
    }

    on(event: string, listener: (...args: any[]) => void): void {
        this.eventService.on(event, listener);
        logger.debug(`Registered listener for environment event: ${event}`);
    }

    off(event: string, listener: (...args: any[]) => void): void {
        this.eventService.off(event, listener);
        logger.debug(`Unregistered listener for environment event: ${event}`);
    }

    emit(event: string, ...args: any[]): void {
        this.eventService.emit(event, ...args);
        logger.debug(`Emitted environment event: ${event}`);
    }
}
