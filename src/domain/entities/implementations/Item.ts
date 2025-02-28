import { IItem, ItemType, ItemProperties } from '../interfaces/IItem';

/**
 * Implementation of Item entity
 * Single Responsibility: Models an item in the game
 */
export class Item implements IItem {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly type: ItemType | string;
  public readonly value: number;
  public readonly properties?: ItemProperties;

  constructor(params: IItem) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.type = params.type;
    this.value = params.value;
    this.properties = params.properties;
  }

  /**
   * Check if item is a weapon
   */
  isWeapon(): boolean {
    return this.type === ItemType.WEAPON;
  }

  /**
   * Check if item is armor
   */
  isArmor(): boolean {
    return this.type === ItemType.ARMOR ||
           this.type === ItemType.SHIELD ||
           this.type === ItemType.HELMET;
  }

  /**
   * Check if item is consumable
   */
  isConsumable(): boolean {
    return this.type === ItemType.CONSUMABLE;
  }

  /**
   * Check if item is a quest item
   */
  isQuestItem(): boolean {
    return this.type === ItemType.QUEST;
  }

  /**
   * Get item's damage value, if any
   */
  getDamageValue(): number {
    return this.properties?.damage || 0;
  }

  /**
   * Get item's defense value, if any
   */
  getDefenseValue(): number {
    return this.properties?.defense || 0;
  }

  /**
   * Get item's health bonus, if any
   */
  getHealthBonus(): number {
    return this.properties?.healthBonus || 0;
  }

  /**
   * Create a copy of the item with modified properties
   */
  withProperties(properties: Partial<ItemProperties>): Item {
    return new Item({
      ...this,
      properties: {
        ...this.properties,
        ...properties
      }
    });
  }

  /**
   * Create a copy of the item with a new value
   */
  withValue(value: number): Item {
    return new Item({
      ...this,
      value
    });
  }
}
