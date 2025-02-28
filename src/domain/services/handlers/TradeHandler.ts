import { ICommandHandler } from '../../interfaces/ICommandHandler';
import { ICommand } from '../command/ICommand';
import { TradeService } from '../TradeService';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

export class TradeHandler extends BaseGameService implements ICommandHandler {
    private tradeService: TradeService;

    constructor() {
        super();
        this.tradeService = new TradeService(); // No need for DI
    }

    handle(command: ICommand): void {
        if (command.getName() !== 'trade') {
            return;
        }

        const npcId = command.getArgs()[0];
        if (!npcId) {
            logger.warn('No NPC ID provided for trade command');
            return;
        }

        // Logic to initiate trade with the specified NPC
        logger.info(`Initiating trade with NPC: ${npcId}`);
    }
}
