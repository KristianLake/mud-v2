import { IEventBus } from './IEventBus';
import { IEventService } from './IEventService';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

// NOTE: This class seems to duplicate functionality in other history-related classes
//       (CommandHistory, GameStateHistory).  It should likely be removed or significantly
//       refactored.  Keeping it temporarily to satisfy the "continue" instruction.

export class EventHistory extends BaseGameService {
    private eventService: IEventService;
    private history: { event: string; data: any; timestamp: Date }[] = [];

    constructor() {
        super();
        this.eventService = this.container.resolve<IEventService>(ServiceTokens.EventService);
        this.initializeListeners();
    }

    private initializeListeners(): void {
        this.eventService.on('*', (data: any, event: string) => {
            this.recordEvent(event, data);
        });
    }

    // Records an event in the history.
    recordEvent(event: string, data: any): void {
        this.history.push({ event, data, timestamp: new Date() });
        logger.debug(`Recorded event in history: ${event}`);
    }

    // Retrieves the event history.
    getHistory(): { event: string; data: any; timestamp: Date }[] {
        return this.history;
    }

    // Clears the event history.
    clearHistory(): void {
        this.history = [];
        logger.info('Event history cleared');
    }
}
