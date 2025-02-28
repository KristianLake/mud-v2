import { BaseRepository } from './BaseRepository';
import { IItem } from '../../entities/interfaces/IItem';
import { Item } from '../../entities/implementations/Item';

/**
 * Repository for Item entities
 * Single Responsibility: Manages storage and retrieval of items
 */
export class ItemRepository extends BaseRepository<IItem> {
  constructor() {
    super('Item');
  }
  
  /**
   * Find items by type
   */
  findByType(type: string): IItem[] {
    return this.getAll().filter(item => item.type === type);
  }
  
  /**
   * Find items with value greater than or equal to given value
   */
  findByMinimumValue(minValue: number): IItem[] {
    return this.getAll().filter(item => item.value >= minValue);
  }
  
  /**
   * Find items with value less than or equal to given value
   */
  findByMaximumValue(maxValue: number): IItem[] {
    return this.getAll().filter(item => item.value <= maxValue);
  }
  
  /**
   * Find items with a specific property
   */
  findByProperty(propertyName: string): IItem[] {
    return this.getAll().filter(
      item => item.properties && propertyName in item.properties
    );
  }
  
  /**
   * Get all weapons
   */
  getAllWeapons(): IItem[] {
    return this.findByType('weapon');
  }
  
  /**
   * Get all armor
   */
  getAllArmor(): IItem[] {
    return this.getAll().filter(
      item => ['armor', 'shield', 'helmet'].includes(item.type)
    );
  }
  
  /**
   * Get all consumables
   */
  getAllConsumables(): IItem[] {
    return this.findByType('consumable');
  }
  
  /**
   * Create an Item instance from plain object
   */
  createFromObject(obj: IItem): Item {
    return new Item(obj);
  }
}
