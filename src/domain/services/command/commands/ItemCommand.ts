import { BaseCommand } from '../BaseCommand';
import { ICommandStrategy } from '../strategies/ICommandStrategy';
import { IInventoryService } from '../../inventory/IInventoryService';
import { IStateService } from '../../state/IStateService';
import { IEntityService } from '../../entity/IEntityService';
import { IMessageService } from '../../messaging/IMessageService';
import { IEventService } from '../../event/IEventService';

export class ItemCommand extends BaseCommand {
  private readonly inventoryService: IInventoryService;
  private readonly stateService: IStateService;
  private readonly entityService: IEntityService;
  private readonly messageService: IMessageService;
  private readonly eventService: IEventService;

  constructor(
    strategy: ICommandStrategy,
    inventoryService: IInventoryService,
    stateService: IStateService,
    entityService: IEntityService,
    messageService: IMessageService,
    eventService: IEventService
  ) {
    super(strategy);
    this.inventoryService = inventoryService;
    this.stateService = stateService;
    this.entityService = entityService;
    this.messageService = messageService;
    this.eventService = eventService;
  }

  execute(args?: string[]): string {
    if (!args || args.length === 0) {
      return "What do you want to do with an item? Try 'take [item]' or 'drop [item]'.";
    }

    const action = args[0].toLowerCase();
    const itemName = args.slice(1).join(' ');

    switch (action) {
      case 'take':
      case 'pickup':
      case 'get':
        if (!itemName) {
          this.listItemsInRoom();
          return '';
        }
        return this.takeItem(itemName);
      
      case 'drop':
        if (!itemName) {
          return "What do you want to drop?";
        }
        return this.dropItem(itemName);
      
      case 'examine':
      case 'inspect':
      case 'look':
        if (!itemName) {
          return "What do you want to examine?";
        }
        return this.examineItem(itemName);
      
      default:
        return `Unknown item action: ${action}. Try 'take', 'drop', or 'examine'.`;
    }
  }

  private takeItem(itemName: string): string {
    // Get current room
    const state = this.stateService.getState();
    const roomId = state.playerLocation;
    const room = this.entityService.getRoom(roomId);
    
    if (!room) {
      return "You are in an unknown location.";
    }
    
    // Find item in room by name
    const itemsInRoom = this.entityService.getItemsInRoom(roomId);
    const item = itemsInRoom.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    
    if (!item) {
      return `There's no ${itemName} here to take.`;
    }
    
    // Take item using inventory service
    const success = this.inventoryService.takeItem(item.id);
    
    if (!success) {
      return `You couldn't take the ${itemName}.`;
    }
    
    return `You take the ${itemName}.`;
  }

  private dropItem(itemName: string): string {
    // Get inventory
    const inventory = this.inventoryService.getInventory();
    
    // Find item in inventory by name
    const item = inventory.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    
    if (!item) {
      return `You don't have a ${itemName}.`;
    }
    
    // Drop item using inventory service
    const success = this.inventoryService.dropItem(item.id);
    
    if (!success) {
      return `You couldn't drop the ${itemName}.`;
    }
    
    return `You dropped the ${itemName}.`;
  }

  private examineItem(itemName: string): string {
    // First, check if item is in inventory
    const inventory = this.inventoryService.getInventory();
    let item = inventory.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    
    if (item) {
      return `${item.name}: ${item.description}${item.value > 0 ? ` Worth about ${item.value} gold.` : ''}`;
    }
    
    // If not in inventory, check room
    const state = this.stateService.getState();
    const roomId = state.playerLocation;
    const itemsInRoom = this.entityService.getItemsInRoom(roomId);
    item = itemsInRoom.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    
    if (item) {
      return `${item.name}: ${item.description} You could take it.`;
    }
    
    return `You don't see a ${itemName} here.`;
  }

  private listItemsInRoom(): void {
    const state = this.stateService.getState();
    const roomId = state.playerLocation;
    const itemsInRoom = this.entityService.getItemsInRoom(roomId);
    
    if (itemsInRoom.length === 0) {
      this.messageService.addMessage("There are no items here.", 'info');
      return;
    }
    
    this.messageService.addMessage("You see:", 'info');
    itemsInRoom.forEach(item => {
      this.messageService.addMessage(`- ${item.name}`, 'info');
    });
  }
}
