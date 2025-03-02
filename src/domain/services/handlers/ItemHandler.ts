import { ICommandHandler } from '../../interfaces/ICommandHandler';
import { ICommand } from '../command/ICommand';
import { BaseGameService } from '../BaseGameService';
import { IInventoryService } from '../inventory/IInventoryService';
import { IEntityService } from '../entity/IEntityService';
import { IStateService } from '../state/IStateService';
import { IMessageService } from '../messaging/IMessageService';
import { IEventService } from '../event/IEventService';
import { ServiceTokens } from '../di/ServiceTokens';
import { container } from '../di/container';
import { logger } from '../../../utils/logger';

export class ItemHandler extends BaseGameService implements ICommandHandler {
    private inventoryService: IInventoryService;
    private entityService: IEntityService;
    private stateService: IStateService;

    constructor() {
        super();
        // Initialize services through DI container
        this.inventoryService = container.resolve(ServiceTokens.InventoryService);
        this.entityService = container.resolve(ServiceTokens.EntityService);
        this.stateService = container.resolve(ServiceTokens.StateService);
    }

    handle(command: ICommand): void {
        const commandName = command.getName().toLowerCase();
        const args = command.getArgs();
        
        switch (commandName) {
            case 'take':
            case 'pickup':
            case 'get':
                this.handleTake(args);
                break;
            case 'drop':
                this.handleDrop(args);
                break;
            case 'use':
                this.handleUse(args);
                break;
            case 'equip':
                this.handleEquip(args);
                break;
            case 'unequip':
                this.handleUnequip(args);
                break;
            case 'examine':
            case 'inspect':
            case 'look':
                if (args && args.length > 0) {
                    this.handleExamine(args);
                }
                break;
            default:
                return;
        }
    }

    private handleTake(args: string[]): void {
        if (!args || args.length === 0) {
            logger.warn('No item identifier provided for take command');
            return;
        }

        const itemId = args[0];
        logger.info(`Taking item: ${itemId}`);
        
        const success = this.inventoryService.takeItem(itemId);
        if (!success) {
            logger.warn(`Failed to take item: ${itemId}`);
        }
    }

    private handleDrop(args: string[]): void {
        if (!args || args.length === 0) {
            logger.warn('No item identifier provided for drop command');
            return;
        }

        const itemId = args[0];
        logger.info(`Dropping item: ${itemId}`);
        
        const success = this.inventoryService.dropItem(itemId);
        if (!success) {
            logger.warn(`Failed to drop item: ${itemId}`);
        }
    }

    private handleUse(args: string[]): void {
        if (!args || args.length === 0) {
            logger.warn('No item identifier provided for use command');
            return;
        }

        const itemId = args[0];
        logger.info(`Using item: ${itemId}`);
        
        const success = this.inventoryService.useItem(itemId);
        if (!success) {
            logger.warn(`Failed to use item: ${itemId}`);
        }
    }

    private handleEquip(args: string[]): void {
        if (!args || args.length === 0) {
            logger.warn('No item identifier provided for equip command');
            return;
        }

        const itemId = args[0];
        logger.info(`Equipping item: ${itemId}`);
        
        // Get current equipped items
        const state = this.stateService.getState();
        const equippedItems = [...(state.equippedItems || [])];
        
        // Check if already equipped
        if (equippedItems.includes(itemId)) {
            logger.info(`Item ${itemId} already equipped`);
            return;
        }
        
        // Add to equipped items<boltAction type="file" filePath="src/domain/services/handlers/ItemHandler.ts">import { ICommandHandler } from '../../interfaces/ICommandHandler';
import { ICommand } from '../command/ICommand';
import { BaseGameService } from '../BaseGameService';
import { IInventoryService } from '../inventory/IInventoryService';
import { IEntityService } from '../entity/IEntityService';
import { IStateService } from '../state/IStateService';
import { IMessageService } from '../messaging/IMessageService';
import { IEventService } from '../event/IEventService';
import { ServiceTokens } from '../di/ServiceTokens';
import { container } from '../di/container';
import { logger } from '../../../utils/logger';

export class ItemHandler extends BaseGameService implements ICommandHandler {
    private inventoryService: IInventoryService;
    private entityService: IEntityService;
    private stateService: IStateService;
    private messageService: IMessageService;
    private eventService: IEventService;

    constructor() {
        super();
        // Initialize services through DI container
        this.inventoryService = container.resolve(ServiceTokens.InventoryService);
        this.entityService = container.resolve(ServiceTokens.EntityService);
        this.stateService = container.resolve(ServiceTokens.StateService);
        this.messageService = container.resolve(ServiceTokens.MessageService);
        this.eventService = container.resolve(ServiceTokens.EventService);
    }

    handle(command: ICommand): void {
        const commandName = command.getName().toLowerCase();
        const args = command.getArgs();
        
        switch (commandName) {
            case 'take':
            case 'pickup':
            case 'get':
                this.handleTake(args);
                break;
            case 'drop':
                this.handleDrop(args);
                break;
            case 'use':
                this.handleUse(args);
                break;
            case 'equip':
                this.handleEquip(args);
                break;
            case 'unequip':
                this.handleUnequip(args);
                break;
            case 'examine':
            case 'inspect':
            case 'look':
                if (args && args.length > 0) {
                    this.handleExamine(args);
                }
                break;
            default:
                return;
        }
    }

    private handleTake(args: string[]): void {
        if (!args || args.length === 0) {
            logger.warn('No item identifier provided for take command');
            return;
        }

        const itemId = args[0];
        logger.info(`Taking item: ${itemId}`);
        
        const success = this.inventoryService.takeItem(itemId);
        if (!success) {
            logger.warn(`Failed to take item: ${itemId}`);
        }
    }

    private handleDrop(args: string[]): void {
        if (!args || args.length === 0) {
            logger.warn('No item identifier provided for drop command');
            return;
        }

        const itemId = args[0];
        logger.info(`Dropping item: ${itemId}`);
        
        const success = this.inventoryService.dropItem(itemId);
        if (!success) {
            logger.warn(`Failed to drop item: ${itemId}`);
        }
    }

    private handleUse(args: string[]): void {
        if (!args || args.length === 0) {
            logger.warn('No item identifier provided for use command');
            return;
        }

        const itemId = args[0];
        logger.info(`Using item: ${itemId}`);
        
        const success = this.inventoryService.useItem(itemId);
        if (!success) {
            logger.warn(`Failed to use item: ${itemId}`);
        }
    }

    private handleEquip(args: string[]): void {
        if (!args || args.length === 0) {
            logger.warn('No item identifier provided for equip command');
            return;
        }

        const itemId = args[0];
        logger.info(`Equipping item: ${itemId}`);
        
        // Get current equipped items
        const state = this.stateService.getState();
        const equippedItems = [...(state.equippedItems || [])];
        
        // Check if already equipped
        if (equippedItems.includes(itemId)) {
            logger.info(`Item ${itemId} already equipped`);
            return;
        }
        
        // Add to equipped items
        equippedItems.push(itemId);
        
        // Update state
        this.stateService.updateState({
            equippedItems
        });
        
        // Get item for event and message
        const item = this.entityService.getItem(itemId);
        
        // Emit event
        if (item) {
            this.eventService.emit('item:equipped', { itemId, item });
            this.messageService.addMessage(`You equipped the ${item.name}.`, 'inventory');
        }
    }

    private handleUnequip(args: string[]): void {
        if (!args || args.length === 0) {
            logger.warn('No item identifier provided for unequip command');
            return;
        }

        const itemId = args[0];
        logger.info(`Unequipping item: ${itemId}`);
        
        // Get current equipped items
        const state = this.stateService.getState();
        const equippedItems = [...(state.equippedItems || [])];
        
        // Check if item is equipped
        if (!equippedItems.includes(itemId)) {
            logger.info(`Item ${itemId} not equipped`);
            return;
        }
        
        // Remove from equipped items
        const updatedEquippedItems = equippedItems.filter(id => id !== itemId);
        
        // Update state
        this.stateService.updateState({
            equippedItems: updatedEquippedItems
        });
        
        // Get item for event and message
        const item = this.entityService.getItem(itemId);
        
        // Emit event
        if (item) {
            this.eventService.emit('item:unequipped', { itemId, item });
            this.messageService.addMessage(`You unequipped the ${item.name}.`, 'inventory');
        }
    }

    private handleExamine(args: string[]): void {
        if (!args || args.length === 0) {
            logger.warn('No item identifier provided for examine command');
            return;
        }

        const itemId = args[0];
        logger.info(`Examining item: ${itemId}`);
        
        // First check inventory
        const inventory = this.inventoryService.getInventory();
        let item = inventory.find(i => i.id === itemId);
        
        if (item) {
            this.messageService.addMessage(`${item.name}: ${item.description}${item.value > 0 ? ` Worth about ${item.value} gold.` : ''}`, 'info');
            return;
        }
        
        // If not in inventory, check room
        const state = this.stateService.getState();
        const roomId = state.playerLocation;
        const itemsInRoom = this.entityService.getItemsInRoom(roomId);
        item = itemsInRoom.find(i => i.id === itemId);
        
        if (item) {
            this.messageService.addMessage(`${item.name}: ${item.description} You could take it.`, 'info');
            return;
        }
        
        this.messageService.addMessage(`You don't see that item here.`, 'warning');
    }
}
