import { Item } from '../entities/Item';
import { IEventService } from './event/IEventService';
import { IStateService } from './state/IStateService';
import { ServiceTokens } from './di/ServiceTokens';
import { Container } from './di/Container';
import { BaseGameService } from './BaseGameService';
import { logger } from '../../utils/logger';
import { IMessageService } from './messaging/IMessageService';

export class TradeService extends BaseGameService {
  private stateService: IStateService;
  private messageService: IMessageService;

  constructor() {
    super();
    this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
    this.messageService = this.container.resolve<IMessageService>(ServiceTokens.MessageService);
  }

  // List items that can be bought from an NPC
  listItemsForSale(npcId: string): void {
    const gameState = this.stateService.getState();
    const npc = gameState.npcs[npcId];

    if (!npc || !npc.inventory || npc.inventory.length === 0) {
      this.messageService.addMessage({
        content: `${npc ? npc.name : 'The merchant'} has nothing for sale.`,
        type: 'system'
      });
      return;
    }

    const options = npc.inventory.map(item => ({
      id: `buy_${item.id}`,
      text: `${item.name} (${item.value} gold)`,
      action: `buy ${item.id} from ${npc.id}`
    }));

    options.push({
      id: 'cancel_buy',
      text: 'Cancel',
      action: `talk ${npc.name}`
    });

    this.messageService.addMessage({
      content: `${npc.name}: "Here's what I have for sale:"`,
      type: 'dialogue',
      options
    });
  }

  // List player items that can be sold to an NPC
  listItemsToSell(npcId: string): void {
    const gameState = this.stateService.getState();
    const npc = gameState.npcs[npcId];
    const playerInventory = gameState.inventory;

    if (!playerInventory || playerInventory.length === 0) {
      this.messageService.addMessage({
        content: "You have nothing to sell.",
        type: 'system'
      });
      return;
    }

    const options = playerInventory.map(item => ({
      id: `sell_${item.id}`,
      text: `${item.name} (${Math.floor(item.value * 0.7)} gold)`, // Selling price is 70% of value
      action: `sell ${item.id} to ${npc.id}`
    }));

    options.push({
      id: 'cancel_sell',
      text: 'Cancel',
      action: `talk ${npc.name}`
    });

    this.messageService.addMessage({
      content: `${npc.name}: "What would you like to sell?"`,
      type: 'dialogue',
      options
    });
  }

  // Buy an item from an NPC
  buyItem(itemId: string, npcId: string): string {
    const gameState = this.stateService.getState();
    const npc = gameState.npcs[npcId];
    const playerGold = gameState.playerStats.gold;

    if (!npc || !npc.inventory) {
      return "That merchant doesn't exist or has no items.";
    }

    const itemIndex = npc.inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return "That item isn't available for purchase.";
    }

    const item = npc.inventory[itemIndex];
    if (playerGold < item.value) {
      return "You don't have enough gold for that.";
    }

    // Remove the item from NPC inventory
    const updatedNpcInventory = [...npc.inventory];
    updatedNpcInventory.splice(itemIndex, 1);

    // Add the item to player inventory
    const updatedPlayerInventory = [...gameState.inventory, item];

    // Update player gold
    const updatedPlayerStats = {
      ...gameState.playerStats,
      gold: playerGold - item.value
    };

    // Update the game state
    this.stateService.updateState({
      inventory: updatedPlayerInventory,
      playerStats: updatedPlayerStats,
      npcs: {
        ...gameState.npcs,
        [npcId]: {
          ...npc,
          inventory: updatedNpcInventory
        }
      }
    });

    return `You bought ${item.name} for ${item.value} gold.`;
  }

  // Sell an item to an NPC
  sellItem(itemId: string, npcId: string): string {
    const gameState = this.stateService.getState();
    const npc = gameState.npcs[npcId];
    const playerInventory = gameState.inventory;
    const playerGold = gameState.playerStats.gold;

    if (!playerInventory) {
      return "You have nothing to sell.";
    }

    const itemIndex = playerInventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return "You don't have that item.";
    }

    const item = playerInventory[itemIndex];
    const sellValue = Math.floor(item.value * 0.7); // Sell for 70% of value

    // Remove the item from player inventory
    const updatedPlayerInventory = [...playerInventory];
    updatedPlayerInventory.splice(itemIndex, 1);

    // Add the item to NPC inventory
    const updatedNpcInventory = npc.inventory ? [...npc.inventory, item] : [item];

    // Update player gold
    const updatedPlayerStats = {
      ...gameState.playerStats,
      gold: playerGold + sellValue
    };

    // Update the game state
    this.stateService.updateState({
      inventory: updatedPlayerInventory,
      playerStats: updatedPlayerStats,
      npcs: {
        ...gameState.npcs,
        [npcId]: {
          ...npc,
          inventory: updatedNpcInventory
        }
      }
    });

    return `You sold ${item.name} for ${sellValue} gold.`;
  }

  // Initiates a trade between the player and an NPC
  initiateTrade(npcId: string, playerOffer: Item[], npcOffer: Item[]): boolean {
    const gameState = this.stateService.getState();
    const npc = gameState.npcs[npcId];

    if (!npc) {
      logger.warn(`NPC not found: ${npcId}`);
      return false;
    }

    // Basic trade logic (can be expanded with validation, bartering, etc.)
    if (this.validateTrade(playerOffer, npcOffer)) {
      this.executeTrade(playerOffer, npcOffer, gameState);
      logger.info(`Trade successful with NPC: ${npc.name}`);
      return true;
    } else {
      logger.warn(`Trade failed with NPC: ${npc.name}`);
      return false;
    }
  }

  // Validates the trade (basic example, can be expanded)
  private validateTrade(playerOffer: Item[], npcOffer: Item[]): boolean {
    // Add validation logic here (e.g., check if items are valid, sufficient gold, etc.)
    return true;
  }

  // Executes the trade by updating player and NPC inventories
  private executeTrade(playerOffer: Item[], npcOffer: Item[], gameState: any): void {
    // Filter out traded items from player's inventory
    const updatedPlayerInventory = gameState.inventory.filter((item: Item) => 
      !playerOffer.some(offerItem => offerItem.id === item.id)
    );
  
    // Add NPC's offer to player's inventory
    updatedPlayerInventory.push(...npcOffer);
  
    // Update the player's inventory in the game state
    this.stateService.updateState({ inventory: updatedPlayerInventory });
  
    logger.info('Trade executed successfully');
  }
}
