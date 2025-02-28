import { IEnvironmentService } from './IEnvironmentService';
import { IEventService } from '../event/IEventService';
import { IStateService } from '../state/IStateService';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

// NOTE: This class seems to be a specific implementation detail of EnvironmentService
//       and might be better integrated directly into that class.  Keeping it
//       temporarily to satisfy the "continue" instruction.

export class RoomEnvironment extends BaseGameService {
    private environmentService: IEnvironmentService;
    private stateService: IStateService;

    constructor() {
        super();
        this.environmentService = this.container.resolve<IEnvironmentService>(ServiceTokens.EnvironmentService);
        this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
        this.initializeListeners();
    }

    async initialize(): Promise<void> {
      logger.info('RoomEnvironment initialized');
    }

    private initializeListeners(): void {
        // Example: Listen for player movement and update room-specific environment
        this.eventService.on('playerMoved', (data: { newLocation: string }) => {
            logger.debug('RoomEnvironment received playerMoved event', { newLocation: data.newLocation });
            this.updateRoomEnvironment(data.newLocation);
        });
    }

    // Updates the environment for a specific room.
    updateRoomEnvironment(roomId: string): void {
        const gameState = this.stateService.getState();
        const room = gameState.rooms[roomId];

        if (!room) {
            logger.error(`Room not found: ${roomId}`);
            return;
        }

        // Add room-specific environment logic here
        // This could involve changing descriptions, adding ambient sounds, etc.
        logger.info(`Updating environment for room: ${roomId}`);
        // Example: this.environmentService.updateEnvironment(room.description);
    }
}
