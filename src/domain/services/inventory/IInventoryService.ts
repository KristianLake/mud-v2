import { IItem } from '../../entities/interfaces/IItem';

/**
 * Interface for inventory management service
 */
export interface IInventoryService {
  /**
   * Get all items in player's inventory
   */
  getInventory(): IItem[];
  
  /**
   * Add an item to inventory
   */
  addItem(itemId: string): boolean;
  
  /**
   * Remove an item from inventory
   */
  removeItem(itemId: string): boolean;
  
  /**
   * Check if inventory contains an item
   */
  hasItem(itemId: string): boolean;
  
  /**
   * Get an item from inventory by ID
   */
  getItem(itemId: string): IItem | undefined;
  
  /**
   * Use an item
   */
  useItem(itemId: string): boolean;
  
  /**
   * Take an item from current room
   */
  takeItem(itemId: string): boolean;
  
  /**
   * Drop an item (remove from inventory and add to current room)
   */
  dropItem(itemId: string): boolean;
  
  /**
   * Get inventory capacity
   */
  getCapacity(): number;
  
  /**
   * Check if inventory is full
   */
  isFull(): boolean;
  
  /**
   * Get inventory weight
   */
  getWeight(): number;  /**
   * Get maximum weight capacity
   */
  getMaxWeight(): number;
}
