import { ICommandHandler } from '../../interfaces/ICommandHandler';
import { ICommand } from '../command/ICommand';
import { Inventory } from '../Inventory';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

export class InventoryHandler extends BaseGameService implements ICommandHandler {
    private inventory: Inventory;

    constructor() {
        super();
        this.inventory = new Inventory(); // No need for DI
    }

    handle(command: ICommand): void {
        switch (command.getName()) {
            case 'take':
                this.handleTake(command);
                break;
            case 'drop':
                this.handleDrop(command);
                break;
            case 'use':
                this.handleUse(command);
                break;
            default:
                return;
        }
    }

    private handleTake(command: ICommand): void {
        const itemId = command.getArgs()[0];
        if (!itemId) {
            logger.warn('No item ID provided for take command');
            return;
        }

        // Logic to add the item to the inventory
        logger.info(`Taking item: ${itemId}`);
    }

    private handleDrop(command: ICommand): void {
        const itemId = command.getArgs()[0];
        if (!itemId) {
            logger.warn('No item ID provided for drop command');
            return;
        }

        // Logic to remove the item from the inventory
        logger.info(`Dropping item: ${itemId}`);
    }

    private handleUse(command: ICommand): void {
        const itemId = command.getArgs()[0];
        if (!itemId) {
            logger.warn('No item ID provided for use command');
            return;
        }

        // Logic to use the item
        logger.info(`Using item: ${itemId}`);
    }
}
