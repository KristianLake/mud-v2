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
    const itemIdentifier = args.slice(1).join(' ');

    switch (action) {
      case 'take':
      case 'pickup':
      case 'get':
        if (!itemIdentifier) {
          this.listItemsInRoom();
          return '';
        }
        return this.takeItem(itemIdentifier);
      
      case 'drop':
        if (!itemIdentifier) {
          return "What do you want to drop?";
        }
        return this.dropItem(itemIdentifier);
      
      case 'examine':
      case 'inspect':
      case 'look':
        if (!itemIdentifier) {
          return "What do you want to examine?";
        }
        return this.examineItem(itemIdentifier);
      
      case 'equip':
        if (!itemIdentifier) {
          return "What do you want to equip?";
        }
        return this.equipItem(itemIdentifier);
      
      case 'unequip':
        if (!itemIdentifier) {
          return "What do you want to unequip?";
        }
        return this.unequipItem(itemIdentifier);
      
      case 'use':
        if (!itemIdentifier) {
          return "What do you want to use?";
        }
        return this.useItem(itemIdentifier);
      
      default:
        return `Unknown item action: ${action}. Try 'take', 'drop', 'examine', 'equip', 'unequip', or 'use'.`;
    }
  }

  private takeItem(itemIdentifier: string): string {
    // Get current room
    const state = this.stateService.getState();
    const roomId = state.playerLocation;
    const room = this.entityService.getRoom(roomId);
    
    if (!room) {
      return "You are in an unknown location.";
    }
    
    // First try to find item by ID (from UI click)
    const itemsInRoom = this.entityService.getItemsInRoom(roomId);
    let item = itemsInRoom.find(i => i.id === itemIdentifier);
    
    // If not found by ID, try to find by name (from text command)
    if (!item) {
      item = itemsInRoom.find(i => i.name.toLowerCase() === itemIdentifier.toLowerCase());
    }
    
    if (!item) {
      return `There's no ${itemIdentifier} here to take.`;
    }
    
    // Take item using inventory service
    const success = this.inventoryService.takeItem(item.id);
    
    if (!success) {
      return `You couldn't take the ${item.name}.`;
    }
    
    return `You take the ${item.name}.`;
  }

  private dropItem(itemIdentifier: string): string {
    // Get inventory
    const inventory = this.inventoryService.getInventory();
    
    // First try to find item by ID (from UI click)
    let item = inventory.find(i => i.id === itemIdentifier);
    
    // If not found by ID, try to find by name (from text command)
    if (!item) {
      item = inventory.find(i => i.name.toLowerCase() === itemIdentifier.toLowerCase());
    }
    
    if (!item) {
      return `You don't have a ${itemIdentifier}.`;
    }
    
    // Drop item using inventory service
    const success = this.inventoryService.dropItem(item.id);
    
    if (!success) {
      return `You couldn't drop the ${item.name}.`;
    }
    
    return `You dropped the ${item.name}.`;
  }

  private examineItem(itemIdentifier: string): string {
    // Get inventory
    const inventory = this.inventoryService.getInventory();
    
    // First try to find item by ID (from UI click)
    let item = inventory.find(i => i.id === itemIdentifier);
    
    // If not found by ID, try to find by name (from text command)
    if (!item) {
      item = inventory.find(i => i.name.toLowerCase() === itemIdentifier.toLowerCase());
    }
    
    if (item) {
      return `${item.name}: ${item.description}${item.value > 0 ? ` Worth about ${item.value} gold.` : ''}`;
    }
    
    // If not in inventory, check room
    const state = this.stateService.getState();
    const roomId = state.playerLocation;
    const itemsInRoom = this.entityService.getItemsInRoom(roomId);
    
    // Try by ID first
    item = itemsInRoom.find(i => i.id === itemIdentifier);
    
    // If not found by ID, try by name
    if (!item) {
      item = itemsInRoom.find(i => i.name.toLowerCase() === itemIdentifier.toLowerCase());
    }
    
    if (item) {
      return `${item.name}: ${item.description} You could take it.`;
    }
    
    return `You don't see a ${itemIdentifier} here.`;
  }

  private equipItem(itemIdentifier: string): string {
    // Get inventory
    const inventory = this.inventoryService.getInventory();
    
    // First try to find item by ID (from UI click)
    let item = inventory.find(i => i.id === itemIdentifier);
    
    // If not found by ID, try to find by name (from text command)
    if (!item) {
      item = inventory.find(i => i.name.toLowerCase() === itemIdentifier.toLowerCase());
    }
    
    if (!item) {
      return `You don't have a ${itemIdentifier} to equip.`;
    }
    
    // Check if item is equippable
    const equippableTypes = ['weapon', 'armor', 'shield', 'helmet', 'accessory'];
    if (!equippableTypes.includes(item.type)) {
      return `You can't equip the ${item.name}.`;
    }
    
    // Get current equipped items
    const state = this.stateService.getState();
    const equippedItems = [...(state.equippedItems || [])];
    
    // Check if already equipped
    if (equippedItems.includes(item.id)) {
      return `You already have the ${item.name} equipped.`;
    }
    
    // Add to equipped items
    equippedItems.push(item.id);
    
    // Update state
    this.stateService.updateState({
      equippedItems
    });
    
    // Emit event
    this.eventService.emit('item:equipped', { itemId: item.id, item });
    
    return `You equipped the ${item.name}.`;
  }

  private unequipItem(itemIdentifier: string): string {
    // Get state
    const state = this.stateService.getState();
    const equippedItems = [...(state.equippedItems || [])];
    
    // Get inventory
    const inventory = this.inventoryService.getInventory();
    
    // First try to find item by ID (from UI click)
    let item = inventory.find(i => i.id === itemIdentifier);
    
    // If not found by ID, try to find by name (from text command)
    if (!item) {
      item = inventory.find(i => i.name.toLowerCase() === itemIdentifier.toLowerCase());
    }
    
    if (!item) {
      return `You don't have a ${itemIdentifier} to unequip.`;
    }
    
    // Check if item is equipped
    if (!equippedItems.includes(item.id)) {
      return `The ${item.name} is not equipped.`;
    }
    
    // Remove from equipped items
    const updatedEquippedItems = equippedItems.filter(id => id !== item.id);
    
    // Update state
    this.stateService.updateState({
      equippedItems: updatedEquippedItems
    });
    
    // Emit event
    this.eventService.emit('item:unequipped', { itemId: item.id, item });
    
    return `You unequipped the ${item.name}.`;
  }

  private useItem(itemIdentifier: string): string {
    // Get inventory
    const inventory = this.inventoryService.getInventory();
    
    // First try to find item by ID (from UI click)
    let item = inventory.find(i => i.id === itemIdentifier);
    
    // If not found by ID, try to find by name (from text command)
    if (!item) {
      item = inventory.find(i => i.name.toLowerCase() === itemIdentifier.toLowerCase());
    }
    
    if (!item) {
      return `You don't have a ${itemIdentifier} to use.`;
    }
    
    // Use the item
    const success = this.inventoryService.useItem(item.id);
    
    if (!success) {
      return `You couldn't use the ${item.name}.`;
    }
    
    return `You used the ${item.name}.`;
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
