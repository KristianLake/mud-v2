import { Item } from '../entities/Item';
import { IEventService } from './event/IEventService';
import { IStateService } from './state/IStateService';
import { ServiceTokens } from './di/ServiceTokens';
import { Container } from './di/Container';
import { BaseGameService } from './BaseGameService';
import { logger } from '../../utils/logger';

export class Inventory extends BaseGameService {
  private stateService: IStateService;

  constructor() {
    super();
    this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
  }

  addItem(item: Item): void {
    const gameState = this.stateService.getState();
    const updatedInventory = [...gameState.playerInventory, item];
    this.stateService.updateState({ playerInventory: updatedInventory });
    logger.info(`Added item to inventory: ${item.name}`);
    this.eventService.emit('inventoryChange', { inventory: updatedInventory });
  }

  removeItem(itemId: string): void {
    const gameState = this.stateService.getState();
    const updatedInventory = gameState.playerInventory.filter((i) => i.id !== itemId);
    this.stateService.updateState({ playerInventory: updatedInventory });
    logger.info(`Removed item from inventory: ${itemId}`);
    this.eventService.emit('inventoryChange', { inventory: updatedInventory });
  }

  getItem(itemId: string): Item | undefined {
    const gameState = this.stateService.getState();
    return gameState.playerInventory.find((i) => i.id === itemId);
  }

  getAllItems(): Item[] {
    const gameState = this.stateService.getState();
    return gameState.playerInventory;
  }
}
