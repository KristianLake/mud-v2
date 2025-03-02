import { BaseGameService } from '../BaseGameService';
import { IInventoryService } from './IInventoryService';
import { IStateService } from '../state/IStateService';
import { IEntityService } from '../entity/IEntityService';
import { IEventService } from '../event/IEventService';
import { IMessageService } from '../messaging/IMessageService';
import { IItem } from '../../entities/interfaces/IItem';
import { IRoom } from '../../entities/interfaces/IRoom';
import { Room } from '../../entities/implementations/Room';

/**
 * Service for managing player inventory
 * Single Responsibility: Handles inventory operations
 */
export class InventoryService extends BaseGameService implements IInventoryService {
  private readonly DEFAULT_CAPACITY = 20;
  private readonly DEFAULT_MAX_WEIGHT = 100;
  
  constructor(
    stateService: IStateService,
    entityService: IEntityService,
    eventService: IEventService,
    messageService: IMessageService
  ) {
    super(
      stateService,
      entityService,
      eventService,
      messageService,
      'InventoryService'
    );
  }
  
  /**
   * Initialize the service
   */
  protected async onInitialize(): Promise<void> {
    // Subscribe to relevant events
    this.eventService.on('item:used', this.handleItemUsed.bind(this));
    
    // No async initialization needed
    return Promise.resolve();
  }
  
  /**
   * Clean up the service
   */
  protected async onDispose(): Promise<void> {
    // Unsubscribe from events
    this.eventService.off('item:used', this.handleItemUsed.bind(this));
    
    return Promise.resolve();
  }
  
  /**
   * Get all items in player's inventory
   */
  getInventory(): IItem[] {
    const state = this.stateService.getState();
    const inventoryIds = state.playerInventory || [];
    
    return inventoryIds
      .map(id => this.entityService.getItem(id))
      .filter((item): item is IItem => item !== undefined);
  }
  
  /**
   * Add an item to inventory
   */
  addItem(itemId: string): boolean {
    // Check if item exists
    const item = this.entityService.getItem(itemId);
    if (!item) {
      this.log('error', `Cannot add non-existent item ${itemId} to inventory`);
      return false;
    }
    
    // Check if inventory is full
    if (this.isFull()) {
      this.messageService.addWarningMessage("Your inventory is full!");
      return false;
    }
    
    // Get current state
    const state = this.stateService.getState();
    const inventory = [...(state.playerInventory || [])];
    
    // Check if item is already in inventory
    if (inventory.includes(itemId)) {
      this.log('debug', `Item ${itemId} already in inventory`);
      return true;
    }
    
    // Add item to inventory
    inventory.push(itemId);
    
    // Update state
    this.stateService.updateState({
      playerInventory: inventory
    });
    
    // Emit event
    this.eventService.emit('inventory:item:added', { itemId, item });
    
    // Add message
    this.messageService.addMessage(`Added ${item.name} to inventory`, 'inventory');
    
    this.log('debug', `Added item ${itemId} to inventory`);
    return true;
  }
  
  /**
   * Remove an item from inventory
   */
  removeItem(itemId: string): boolean {
    // Get current state
    const state = this.stateService.getState();
    const inventory = [...(state.playerInventory || [])];
    
    // Check if item is in inventory
    if (!inventory.includes(itemId)) {
      this.log('debug', `Item ${itemId} not in inventory`);
      return false;
    }
    
    // Get item for event and message
    const item = this.entityService.getItem(itemId);
    
    // Remove item from inventory
    const updatedInventory = inventory.filter(id => id !== itemId);
    
    // Update state
    this.stateService.updateState({
      playerInventory: updatedInventory
    });
    
    // Emit event
    this.eventService.emit('inventory:item:removed', { itemId, item });
    
    // Add message if item exists
    if (item) {
      this.messageService.addMessage(`Removed ${item.name} from inventory`, 'inventory');
    }
    
    this.log('debug', `Removed item ${itemId} from inventory`);
    return true;
  }
  
  /**
   * Check if inventory contains an item
   */
  hasItem(itemId: string): boolean {
    const state = this.stateService.getState();
    const inventory = state.playerInventory || [];
    return inventory.includes(itemId);
  }
  
  /**
   * Get an item from inventory by ID
   */
  getItem(itemId: string): IItem | undefined {
    if (!this.hasItem(itemId)) {
      return undefined;
    }
    
    return this.entityService.getItem(itemId);
  }
  
  /**
   * Use an item
   */
  useItem(itemId: string): boolean {
    // Check if item is in inventory
    if (!this.hasItem(itemId)) {
      this.messageService.addWarningMessage("You don't have that item.");
      return false;
    }
    
    // Get the item
    const item = this.entityService.getItem(itemId);
    if (!item) {
      this.log('error', `Item ${itemId} exists in inventory but not in entity service`);
      return false;
    }
    
    // Check if item is usable
    if (item.type !== 'consumable' && !item.properties?.effect) {
      this.messageService.addWarningMessage(`You can't use the ${item.name}.`);
      return false;
    }
    
    // Emit event for item use
    this.eventService.emit('item:used', { itemId, item });
    
    // Add message
    this.messageService.addMessage(`You used the ${item.name}.`, 'inventory');
    
    // If consumable, remove from inventory
    if (item.type === 'consumable') {
      this.removeItem(itemId);
    }
    
    this.log('debug', `Used item ${itemId}`);
    return true;
  }
  
  /**
   * Take an item from the current room
   */
  takeItem(itemId: string): boolean {
    this.log('debug', `Taking item ${itemId} from room`);
    
    // Get current room
    const state = this.stateService.getState();
    const roomId = state.playerLocation;
    const room = this.entityService.getRoom(roomId);
    
    if (!room) {
      this.log('error', `Current room ${roomId} not found`);
      return false;
    }
    
    // Check if item is in the room
    if (!room.hasItem(itemId)) {
      const item = this.entityService.getItem(itemId);
      const itemName = item ? item.name : itemId;
      this.messageService.addWarningMessage(`There's no ${itemName} here to take.`);
      return false;
    }
    
    // Get item
    const item = this.entityService.getItem(itemId);
    if (!item) {
      this.log('error', `Item ${itemId} exists in room but not in entity service`);
      return false;
    }
    
    // Add to inventory
    if (!this.addItem(itemId)) {
      return false;
    }
    
    // Remove from room
    const updatedRoom = room.withRemovedItem(itemId);
    
    // Update room in entity service
    this.entityService.updateEntity('room', updatedRoom);
    
    // Emit event
    this.eventService.emit('item:taken', { itemId, item, roomId });
    
    // Add message
    this.messageService.addMessage(`You take the ${item.name}.`, 'inventory');
    
    this.log('debug', `Took item ${itemId} from room ${roomId}`);
    return true;
  }
  
  /**
   * Drop an item (remove from inventory and add to current room)
   */
  dropItem(itemId: string): boolean {
    // Check if item is in inventory
    if (!this.hasItem(itemId)) {
      this.messageService.addWarningMessage("You don't have that item.");
      return false;
    }
    
    // Get the item
    const item = this.entityService.getItem(itemId);
    if (!item) {
      this.log('error', `Item ${itemId} exists in inventory but not in entity service`);
      return false;
    }
    
    // Get current room
    const state = this.stateService.getState();
    const roomId = state.playerLocation;
    const room = this.entityService.getRoom(roomId);
    
    if (!room) {
      this.log('error', `Current room ${roomId} not found`);
      return false;
    }
    
    // Remove from inventory
    if (!this.removeItem(itemId)) {
      return false;
    }
    
    // Add to room
    const updatedRoom = room.withAddedItem(itemId);
    
    // Update room in entity service
    this.entityService.updateEntity('room', updatedRoom);
    
    // Emit event
    this.eventService.emit('item:dropped', { itemId, item, roomId });
    
    // Add message
    this.messageService.addMessage(`You dropped the ${item.name}.`, 'inventory');
    
    this.log('debug', `Dropped item ${itemId} in room ${roomId}`);
    return true;
  }
  
  /**
   * Get inventory capacity
   */
  getCapacity(): number {
    const state = this.stateService.getState();
    return state.inventoryCapacity || this.DEFAULT_CAPACITY;
  }
  
  /**
   * Check if inventory is full
   */
  isFull(): boolean {
    const state = this.stateService.getState();
    const inventory = state.playerInventory || [];
    return inventory.length >= this.getCapacity();
  }
  
  /**
   * Get inventory weight
   */
  getWeight(): number {
    const inventory = this.getInventory();
    return inventory.reduce((total, item) => {
      const weight = item.properties?.weight || 1;
      return total + weight;
    }, 0);
  }
  
  /**
   * Get maximum weight capacity
   */
  getMaxWeight(): number {
    const state = this.stateService.getState();
    return state.maxInventoryWeight || this.DEFAULT_MAX_WEIGHT;
  }
  
  /**
   * Handle item used event
   */
  private handleItemUsed(data: { itemId: string, item: IItem }): void {
    const { item } = data;
    
    // Apply item effects based on type and properties
    if (item.type === 'consumable') {
      // Handle consumable effects like healing
      if (item.properties?.healthBonus) {
        const state = this.stateService.getState();
        const currentHealth = state.playerStats?.health || 0;
        const maxHealth = state.playerStats?.maxHealth || 100;
        const healthBonus = item.properties.healthBonus;
        
        const newHealth = Math.min(currentHealth + healthBonus, maxHealth);
        
        this.stateService.updateState({
          playerStats: {
            ...state.playerStats,
            health: newHealth
          }
        });
        
        this.messageService.addMessage(`You gained ${healthBonus} health points.`, 'inventory');
        this.eventService.emit('player:health:changed', { oldHealth: currentHealth, newHealth });
      }
    }
  }
}
