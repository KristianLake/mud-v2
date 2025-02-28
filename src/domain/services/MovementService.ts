import { IEventService } from './event/IEventService';
import { IStateService } from './state/IStateService';
import { IMovementValidator } from './movement/IMovementValidator';
import { MovementValidator } from './movement/MovementValidator';
import { ServiceTokens } from './di/ServiceTokens';
import { Container } from './di/Container';
import { BaseGameService } from './BaseGameService';
import { logger } from '../../utils/logger';

export class MovementService extends BaseGameService {
  private stateService: IStateService;
  private movementValidator: IMovementValidator;

  constructor() {
    super();
    this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
    this.movementValidator = new MovementValidator(); // No need for DI here
  }

  movePlayer(direction: string): void {
    const gameState = this.stateService.getState();
    const currentRoom = gameState.rooms[gameState.playerLocation];

    if (this.movementValidator.validateMovement(gameState, direction)) {
      const newLocation = currentRoom.exits[direction];
      this.stateService.updateState({ playerLocation: newLocation });
      logger.info(`Player moved ${direction} to ${newLocation}`);
      this.eventService.emit('playerMoved', { direction, newLocation });
    } else {
      logger.warn(`Invalid movement attempt: ${direction} from ${gameState.playerLocation}`);
      // Optionally, emit an event for invalid movement
    }
  }
}
