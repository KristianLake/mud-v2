import { IMovementValidator } from './IMovementValidator';
import { GameState } from '../state/IStateService';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

export class MovementValidator extends BaseGameService implements IMovementValidator {
    validateMovement(gameState: GameState, direction: string): boolean {
        const currentRoom = gameState.rooms[gameState.playerLocation];

        if (!currentRoom) {
            logger.error(`Current room not found: ${gameState.playerLocation}`);
            return false;
        }

        const validExit = currentRoom.exits && currentRoom.exits[direction] !== undefined;
        if (!validExit) {
          logger.warn(`Invalid move attempt: No exit in direction ${direction} from ${gameState.playerLocation}`);
        }
        return validExit;
    }
}
