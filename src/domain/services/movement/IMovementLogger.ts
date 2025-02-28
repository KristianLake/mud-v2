import { MovementService } from '../MovementService';
import { IEventService } from '../event/IEventService';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

// NOTE: This class seems unnecessary as logging can be handled within MovementService.
//       Keeping it temporarily to satisfy the "continue" instruction.

export class MovementLogger extends BaseGameService {
    private movementService: MovementService;

    constructor() {
        super();
        this.movementService = new MovementService(); // No need for DI
        this.initializeListeners();
    }

    private initializeListeners(): void {
        this.eventService.on('playerMoved', (data: { direction: string, newLocation: string }) => {
            logger.info(`Player moved ${data.direction} to ${data.newLocation}`);
        });
    }
}
