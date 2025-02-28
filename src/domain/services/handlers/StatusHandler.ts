import { ICommandHandler } from '../../interfaces/ICommandHandler';
import { ICommand } from '../command/ICommand';
import { PlayerStats } from '../PlayerStats';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

export class StatusHandler extends BaseGameService implements ICommandHandler {
    private playerStats: PlayerStats;

    constructor() {
        super();
        this.playerStats = new PlayerStats();
    }

    handle(command: ICommand): void {
        if (command.getName() !== 'status') {
            return;
        }

        // Logic to retrieve and display player status (health, gold, etc.)
        logger.info('Displaying player status');
    }
}
