import { IEntityService } from '../services/entity/IEntityService';
import { IStateService } from '../services/state/IStateService';
import { IEventService } from '../services/event/IEventService';
import { logger } from '../../utils/logger';

/**
 * Core system for managing game entities
 * Single Responsibility: Coordinates entity operations with state and events
 */
export class EntitySystem {
  constructor(
    private entityService: IEntityService,
    private stateService: IStateService,
    private eventService: IEventService
  ) {
    logger.debug('EntitySystem initialized');
    
    // Subscribe to state changes to update entities
    this.stateService.subscribe(this.handleStateChange.bind(this));
    
    // Initial entity setup from current state
    this.setupEntities();
  }
  
  /**
   * Initial entity setup
   */
  private setupEntities(): void {
    const state = this.stateService.getState();
    this.entityService.initializeFromState(state);
    
    // Emit event that entities are ready
    this.eventService.emit('entities:initialized');
    
    logger.debug('Entities initialized from current state');
  }
  
  /**
   * Handle state changes
   */
  private handleStateChange(state: any): void {
    // Update entities when state changes
    this.entityService.initializeFromState(state);
    
    logger.debug('Entities updated due to state change');
  }
  
  /**
   * Get all player's inventory items
   */
  getPlayerInventory(): any[] {
    const state = this.stateService.getState();
    return state.playerInventory || [];
  }
  
  /**
   * Get current player location (room ID)
   */
  getPlayerLocation(): string {
    const state = this.stateService.getState();
    return state.playerLocation;
  }
  
  /**
   * Get current room details
   */
  getCurrentRoom(): any {
    const state = this.stateService.getState();
    const roomId = state.playerLocation;
    return this.entityService.getRoom(roomId);
  }
  
  /**
   * Get items in current room
   */
  getItemsInCurrentRoom(): any[] {
    const state = this.stateService.getState();
    const roomId = state.playerLocation;
    return this.entityService.getItemsInRoom(roomId);
  }
  
  /**
   * Get NPCs in current room
   */
  getNPCsInCurrentRoom(): any[] {
    const state = this.stateService.getState();
    const roomId = state.playerLocation;
    return this.entityService.getNPCsInRoom(roomId);
  }
}
