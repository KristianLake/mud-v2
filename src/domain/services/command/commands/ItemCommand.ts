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
        const examineResult = this.examineItem(itemIdentifier);
        this.messageService.addMessage(examineResult);
        return '';
      
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

  private examineItem(itemIdentifier: string): string {
    // First check inventory
    const inventory = this.inventoryService.getInventory();
    let item = inventory.find(i => 
      i.name.toLowerCase() === itemIdentifier.toLowerCase() || 
      i.id === itemIdentifier
    );

    // If found in inventory, return detailed description
    if (item) {
      let description = `${item.name}: ${item.description}`;
      
      // Add value information if item has value
      if (item.value > 0) {
        description += `\nValue: ${item.value} gold`;
      }
      
      // Add weapon stats if applicable
      if (item.properties?.damage) {
        description += `\nDamage: ${item.properties.damage}`;
      }
      
      // Add armor stats if applicable
      if (item.properties?.defense) {
        description += `\nDefense: ${item.properties.defense}`;
      }
      
      // Add health bonus if applicable
      if (item.properties?.healthBonus) {
        description += `\nHealth Bonus: ${item.properties.healthBonus}`;
      }
      
      return description;
    }

    // If not in inventory, check room
    const state = this.stateService.getState();
    const roomId = state.playerLocation;
    const itemsInRoom = this.entityService.getItemsInRoom(roomId);
    
    item = itemsInRoom.find(i => 
      i.name.toLowerCase() === itemIdentifier.toLowerCase() || 
      i.id === itemIdentifier
    );

    if (item) {
      let description = `${item.name}: ${item.description}\nYou can see this item on the ground.`;
      
      if (item.value > 0) {
        description += `\nIt looks to be worth about ${item.value} gold.`;
      }
      
      return description;
    }

    return `You don't see a ${itemIdentifier} here.`;
  }

  // ... [rest of the existing methods remain unchanged]
}
