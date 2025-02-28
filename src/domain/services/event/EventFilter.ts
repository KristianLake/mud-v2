import { IEventBus } from './IEventBus';
import { IEventService } from './IEventService';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

// NOTE: This class seems unnecessary as filtering can be handled within EventService or
//       by the subscribers themselves.  It should likely be removed.  Keeping it
//       temporarily to satisfy the "continue" instruction.

export class EventFilter extends BaseGameService {
    private eventService: IEventService;

    constructor() {
        super();
        this.eventService = this.container.resolve<IEventService>(ServiceTokens.EventService);
    }

    // Applies a filter to an event before it is emitted.
    applyFilter(event: string, data: any, filter: (data: any) => boolean): any | null {
        if (filter(data)) {
            logger.debug(`Event passed filter: ${event}`);
            return data;
        } else {
            logger.debug(`Event filtered out: ${event}`);
            return null; // Or throw an error, depending on your needs
        }
    }

    // Registers a listener with a filter.
    onWithFilter(event: string, listener: (...args: any[]) => void, filter: (data: any) => boolean): void {
        const filteredListener = (data: any) => {
            if (filter(data)) {
                listener(data);
            }
        };
        this.eventService.on(event, filteredListener);
        logger.debug(`Registered listener with filter for event: ${event}`);
    }
}
