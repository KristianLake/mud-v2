import { EventEmitter } from '../../utils/EventEmitter';
import { logger } from '../../utils/logger';

export interface GameState {
  playerLocation: string;
  inventory: string[];
  playerStats: {
    health: number;
    maxHealth: number;
    level: number;
    experience: number;
    gold: number;
  };
  rooms: Record<string, {
    id: string;
    name: string;
    description: string;
    exits: Record<string, string>;
    items?: string[];
    npcs?: string[];
  }>;
  items: Record<string, {
    id: string;
    name: string;
    description: string;
    location: string;
    isCarryable: boolean;
    value?: number;
    type?: string;
    properties?: Record<string, any>;
  }>;
  npcs: Record<string, {
    id: string;
    name: string;
    description: string;
    location: string;
    dialogue: Record<string, string>;
    canTrade?: boolean;
    inventory?: string[];
    questIds?: string[];
    hasQuest?: boolean;
  }>;
  quests?: any[];
}

export class Game {
  private events = new EventEmitter();
  private state: GameState;
  
  constructor(initialState: Partial<GameState> = {}) {
    this.state = {
      playerLocation: 'start',
      inventory: [],
      playerStats: {
        health: 100,
        maxHealth: 100,
        level: 1,
        experience: 0,
        gold: 100
      },
      rooms: {},
      items: {},
      npcs: {},
      ...initialState
    };
    
    logger.debug('Game initialized with state', this.state);
  }
  
  /**
   * Get the current game state
   */
  getState(): GameState {
    return this.state;
  }
  
  /**
   * Update the game state
   */
  setState(newState: Partial<GameState>): void {
    this.state = { ...this.state, ...newState };
    this.events.emit('stateChanged', this.state);
    logger.debug('Game state updated', this.state);
  }
  
  /**
   * Process player command
   */
  processCommand(command: string): string {
    logger.debug(`Processing command: ${command}`);
    
    // Simple command echo for now
    return `You typed: ${command}`;
  }
  
  /**
   * Move player to a new room
   * @param direction Direction to move
   * @returns True if movement was successful
   */
  movePlayer(direction: string): boolean {
    const currentRoomId = this.state.playerLocation;
    const currentRoom = this.state.rooms[currentRoomId];
    
    if (!currentRoom) {
      logger.error(`Cannot move - current room ${currentRoomId} not found`);
      return false;
    }
    
    if (!currentRoom.exits || !currentRoom.exits[direction]) {
      logger.debug(`Cannot move ${direction} - no exit exists`);
      return false;
    }
    
    const newRoomId = currentRoom.exits[direction];
    const newRoom = this.state.rooms[newRoomId];
    
    if (!newRoom) {
      logger.error(`Cannot move to room ${newRoomId} - room not found`);
      return false;
    }
    
    // Update player location
    this.setState({
      playerLocation: newRoomId
    });
    
    logger.debug(`Player moved from ${currentRoomId} to ${newRoomId}`);
    this.events.emit('playerMoved', { from: currentRoomId, to: newRoomId, direction });
    
    return true;
  }
  
  /**
   * Take an item from the current room
   * @param itemId ID of the item to take
   * @returns True if the item was taken successfully
   */
  takeItem(itemId: string): boolean {
    const currentRoomId = this.state.playerLocation;
    const currentRoom = this.state.rooms[currentRoomId];
    
    if (!currentRoom) {
      logger.error(`Cannot take item - current room ${currentRoomId} not found`);
      return false;
    }
    
    if (!currentRoom.items || !currentRoom.items.includes(itemId)) {
      logger.debug(`Cannot take item ${itemId} - not in room ${currentRoomId}`);
      return false;
    }
    
    const item = this.state.items[itemId];
    
    if (!item) {
      logger.error(`Cannot take item ${itemId} - item not found in game state`);
      return false;
    }
    
    if (!item.isCarryable) {
      logger.debug(`Cannot take item ${itemId} - not carryable`);
      return false;
    }
    
    // Remove from room
    const updatedRoomItems = currentRoom.items.filter(id => id !== itemId);
    const updatedRoom = { ...currentRoom, items: updatedRoomItems };
    const updatedRooms = { ...this.state.rooms, [currentRoomId]: updatedRoom };
    
    // Add to inventory
    const updatedInventory = [...this.state.inventory, itemId];
    
    // Update state
    this.setState({
      rooms: updatedRooms,
      inventory: updatedInventory
    });
    
    logger.debug(`Took item ${itemId} from room ${currentRoomId}`);
    this.events.emit('itemTaken', { itemId, from: currentRoomId });
    
    return true;
  }
  
  /**
   * Drop an item from inventory into current room
   * @param itemId ID of the item to drop
   * @returns True if the item was dropped successfully 
   */
  dropItem(itemId: string): boolean {
    if (!this.state.inventory.includes(itemId)) {
      logger.debug(`Cannot drop item ${itemId} - not in inventory`);
      return false;
    }
    
    const currentRoomId = this.state.playerLocation;
    const currentRoom = this.state.rooms[currentRoomId];
    
    if (!currentRoom) {
      logger.error(`Cannot drop item - current room ${currentRoomId} not found`);
      return false;
    }
    
    // Remove from inventory
    const updatedInventory = this.state.inventory.filter(id => id !== itemId);
    
    // Add to room
    const roomItems = currentRoom.items || [];
    const updatedRoomItems = [...roomItems, itemId];
    const updatedRoom = { ...currentRoom, items: updatedRoomItems };
    const updatedRooms = { ...this.state.rooms, [currentRoomId]: updatedRoom };
    
    // Update state
    this.setState({
      rooms: updatedRooms,
      inventory: updatedInventory
    });
    
    logger.debug(`Dropped item ${itemId} in room ${currentRoomId}`);
    this.events.emit('itemDropped', { itemId, to: currentRoomId });
    
    return true;
  }
  
  /**
   * Add an item to player inventory
   * @param itemId ID of the item to add
   * @returns True if the item was added successfully
   */
  addItemToInventory(itemId: string): boolean {
    if (this.state.inventory.includes(itemId)) {
      logger.debug(`Item ${itemId} already in inventory`);
      return true;
    }
    
    const item = this.state.items[itemId];
    
    if (!item) {
      logger.error(`Cannot add item ${itemId} - item not found in game state`);
      return false;
    }
    
    // Add to inventory
    const updatedInventory = [...this.state.inventory, itemId];
    
    // Update state
    this.setState({
      inventory: updatedInventory
    });
    
    logger.debug(`Added item ${itemId} to inventory`);
    this.events.emit('itemAdded', { itemId });
    
    return true;
  }
  
  /**
   * Remove an item from player inventory
   * @param itemId ID of the item to remove
   * @returns True if the item was removed successfully
   */
  removeItemFromInventory(itemId: string): boolean {
    if (!this.state.inventory.includes(itemId)) {
      logger.debug(`Cannot remove item ${itemId} - not in inventory`);
      return false;
    }
    
    // Remove from inventory
    const updatedInventory = this.state.inventory.filter(id => id !== itemId);
    
    // Update state
    this.setState({
      inventory: updatedInventory
    });
    
    logger.debug(`Removed item ${itemId} from inventory`);
    this.events.emit('itemRemoved', { itemId });
    
    return true;
  }
  
  /**
   * Subscribe to game events
   */
  on(eventName: string, callback: Function): void {
    this.events.on(eventName, callback);
  }
  
  /**
   * Unsubscribe from game events
   */
  off(eventName: string, callback: Function): void {
    this.events.off(eventName, callback);
  }
}
