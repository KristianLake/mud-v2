import { Item } from '../entities/Item';
import { IEventService } from './event/IEventService';
import { IStateService } from './state/IStateService';
import { ServiceTokens } from './di/ServiceTokens';
import { Container } from './di/Container';
import { BaseGameService } from './BaseGameService';
import { logger } from '../../utils/logger';
import { IMessageService } from './messaging/IMessageService';

export class ItemService extends BaseGameService {
  private stateService: IStateService;
  private messageService: IMessageService;

  constructor() {
    super();
    this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
    this.messageService = this.container.resolve<IMessageService>(ServiceTokens.MessageService);
  }

  // List items in the current room
  listItemsInRoom(): void {
    const gameState = this.stateService.getState();
    const currentRoom = gameState.rooms[gameState.playerLocation];
    
    if (!currentRoom || !currentRoom.items || currentRoom.items.length === 0) {
      this.messageService.addMessage({
        content: "There are no items here.",
        type: 'system'
      });
      return;
    }

    const itemList = currentRoom.items.map(item => item.name).join(', ');
    this.messageService.addMessage({
      content: `You see the following items: ${itemList}`,
      type: 'system'
    });
  }

  // Get an item by name from inventory or current room
  getItem(itemName: string): Item | null {
    const gameState = this.stateService.getState();
    const currentRoom = gameState.rooms[gameState.playerLocation];
    
    // Check inventory first
    const inventoryItem = gameState.inventory.find(
      item => item.name.toLowerCase() === itemName.toLowerCase()
    );
    if (inventoryItem) return inventoryItem;
    
    // Then check room
    if (currentRoom && currentRoom.items) {
      const roomItem = currentRoom.items.find(
        item => item.name.toLowerCase() === itemName.toLowerCase()
      );
      if (roomItem) return roomItem;
    }
    
    return null;
  }

  // Take an item from the current room
  takeItem(itemName: string): string {
    const gameState = this.stateService.getState();
    const currentRoom = gameState.rooms[gameState.playerLocation];
    
    if (!currentRoom || !currentRoom.items || currentRoom.items.length === 0) {
      return "There's nothing here to take.";
    }
    
    const itemIndex = currentRoom.items.findIndex(
      item => item.name.toLowerCase() === itemName.toLowerCase()
    );
    
    if (itemIndex === -1) {
      return `You don't see a ${itemName} here.`;
    }
    
    // Remove item from room and add to inventory
    const item = currentRoom.items[itemIndex];
    const updatedRoomItems = [...currentRoom.items];
    updatedRoomItems.splice(itemIndex, 1);
    
    const updatedInventory = [...gameState.inventory, item];
    
    // Update state
    this.stateService.updateState({
      inventory: updatedInventory,
      rooms: {
        ...gameState.rooms,
        [currentRoom.id]: {
          ...currentRoom,
          items: updatedRoomItems
        }
      }
    });
    
    return `You picked up the ${item.name}.`;
  }

  // Drop an item from inventory to the current room
  dropItem(itemId: string): string {
    const gameState = this.stateService.getState();
    const currentRoom = gameState.rooms[gameState.playerLocation];
    
    // Find the item in inventory
    const itemIndex = gameState.inventory.findIndex(
      item => item.id === itemId || item.name.toLowerCase() === itemId.toLowerCase()
    );
    
    if (itemIndex === -1) {
      return `You don't have a ${itemId} in your inventory.`;
    }
    
    // Remove from inventory and add to room
    const item = gameState.inventory[itemIndex];
    const updatedInventory = [...gameState.inventory];
    updatedInventory.splice(itemIndex, 1);
    
    const updatedRoomItems = currentRoom.items ? [...currentRoom.items, item] : [item];
    
    // Update state
    this.stateService.updateState({
      inventory: updatedInventory,
      rooms: {
        ...gameState.rooms,
        [currentRoom.id]: {
          ...currentRoom,
          items: updatedRoomItems
        }
      }
    });
    
    return `You dropped the ${item.name}.`;
  }

  // Equip an item
  equipItem(itemId: string): string {
    const gameState = this.stateService.getState();
    
    // Find the item in inventory
    const item = gameState.inventory.find(
      item => item.id === itemId || item.name.toLowerCase() === itemId.toLowerCase()
    );
    
    if (!item) {
      return `You don't have a ${itemId} in your inventory.`;
    }
    
    // Check if item is equippable
    if (!['weapon', 'armor', 'shield', 'helmet', 'accessory'].includes(item.type)) {
      return `You can't equip the ${item.name}.`;
    }
    
    // Initialize equipped items array if it doesn't exist
    const equippedItems = gameState.equippedItems || [];
    
    // Check if already equipped
    if (equippedItems.includes(item.id)) {
      return `You already have the ${item.name} equipped.`;
    }
    
    // Add to equipped items
    const updatedEquippedItems = [...equippedItems, item.id];
    
    // Update player stats based on item properties
    const updatedPlayerStats = { ...gameState.playerStats };
    if (item.properties) {
      if (item.properties.damage) {
        updatedPlayerStats.baseAttack += item.properties.damage;
      }
      if (item.properties.defense) {
        updatedPlayerStats.baseDefense += item.properties.defense;
      }
      if (item.properties.healthBonus) {
        updatedPlayerStats.maxHp += item.properties.healthBonus;
      }
    }
    
    // Update state
    this.stateService.updateState({
      equippedItems: updatedEquippedItems,
      playerStats: updatedPlayerStats
    });
    
    return `You equipped the ${item.name}.`;
  }

  // Unequip an item
  unequipItem(itemId: string): string {
    const gameState = this.stateService.getState();
    
    // Check if there are any equipped items
    if (!gameState.equippedItems || gameState.equippedItems.length === 0) {
      return "You don't have any equipped items.";
    }
    
    // Find the item in inventory
    const item = gameState.inventory.find(
      item => item.id === itemId || item.name.toLowerCase() === itemId.toLowerCase()
    );
    
    if (!item) {
      return `You don't have a ${itemId} in your inventory.`;
    }
    
    // Check if the item is equipped
    if (!gameState.equippedItems.includes(item.id)) {
      return `The ${item.name} is not equipped.`;
    }
    
    // Remove from equipped items
    const updatedEquippedItems = gameState.equippedItems.filter(id => id !== item.id);
    
    // Update player stats based on item properties
    const updatedPlayerStats = { ...gameState.playerStats };
    if (item.properties) {
      if (item.properties.damage) {
        updatedPlayerStats.baseAttack -= item.properties.damage;
      }
      if (item.properties.defense) {
        updatedPlayerStats.baseDefense -= item.properties.defense;
      }
      if (item.properties.healthBonus) {
        updatedPlayerStats.maxHp -= item.properties.healthBonus;
      }
    }
    
    // Update state
    this.stateService.updateState({
      equippedItems: updatedEquippedItems,
      playerStats: updatedPlayerStats
    });
    
    return `You unequipped the ${item.name}.`;
  }

  // Use a consumable item
  useItem(itemId: string): string {
    const gameState = this.stateService.getState();
    
    // Find the item in inventory
    const itemIndex = gameState.inventory.findIndex(
      item => item.id === itemId || item.name.toLowerCase() === itemId.toLowerCase()
    );
    
    if (itemIndex === -1) {
      return `You don't have a ${itemId} in your inventory.`;
    }
    
    const item = gameState.inventory[itemIndex];
    
    // Check if item is usable
    if (item.type !== 'consumable') {
      return `You can't use the ${item.name} that way.`;
    }
    
    // Apply item effects
    const updatedPlayerStats = { ...gameState.playerStats };
    let effectDescription = "";
    
    if (item.properties) {
      if (item.properties.effect === 'heal') {
        const healAmount = item.properties.value || 10; // Default heal of 10 if not specified
        updatedPlayerStats.hp = Math.min(updatedPlayerStats.hp + healAmount, updatedPlayerStats.maxHp);
        effectDescription = `You feel revitalized. (Healed ${healAmount} HP)`;
      } else if (item.properties.effect === 'buff') {
        // Implement temporary buffs logic here
        effectDescription = "You feel a surge of power!";
      } else {
        effectDescription = "You used the item, but nothing happened.";
      }
    } else {
      effectDescription = "You used the item, but nothing happened.";
    }
    
    // Remove the used item from inventory
    const updatedInventory = [...gameState.inventory];
    updatedInventory.splice(itemIndex, 1);
    
    // Update state
    this.stateService.updateState({
      inventory: updatedInventory,
      playerStats: updatedPlayerStats
    });
    
    return `You used the ${item.name}. ${effectDescription}`;
  }

  // Examine an item in detail
  examineItem(itemId: string): string {
    const gameState = this.stateService.getState();
    
    // Find the item in inventory
    const item = gameState.inventory.find(
      item => item.id === itemId || item.name.toLowerCase() === itemId.toLowerCase()
    );
    
    if (!item) {
      return `You don't have a ${itemId} in your inventory.`;
    }
    
    let detailText = `${item.name}: ${item.description}`;
    
    if (item.value > 0) {
      detailText += ` Worth about ${item.value} gold.`;
    }
    
    if (item.properties) {
      if (item.type === 'weapon' && item.properties.damage) {
        detailText += ` Damage: +${item.properties.damage}`;
      }
      if ((item.type === 'armor' || item.type === 'shield') && item.properties.defense) {
        detailText += ` Defense: +${item.properties.defense}`;
      }
      if (item.properties.durability) {
        detailText += ` Durability: ${item.properties.durability}`;
      }
    }
    
    return detailText;
  }
}
