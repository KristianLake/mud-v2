import { ICommandHandler } from '../../interfaces/ICommandHandler';
import { ICommand } from '../command/ICommand';
import { MovementService } from '../MovementService';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

export class MovementHandler extends BaseGameService implements ICommandHandler {
    private movementService: MovementService;

    constructor() {
        super();
        this.movementService = new MovementService(); // No need for DI
    }

    handle(command: ICommand): void {
        if (command.getName() !== 'move') {
            return;
        }

        const direction = command.getArgs()[0];
        if (!direction) {
            logger.warn('No direction provided for move command');
            return;
        }

        this.movementService.movePlayer(direction);
    }
}
