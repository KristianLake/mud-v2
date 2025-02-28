import { IEntity } from './IEntity';

/**
 * Item property types
 */
export interface ItemProperties {
  damage?: number;
  defense?: number;
  healthBonus?: number;
  effect?: string;
  durability?: number;
  [key: string]: any; // For additional flexible properties
}

/**
 * Item type enum for type safety
 */
export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  SHIELD = 'shield',
  HELMET = 'helmet',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  KEY = 'key',
  QUEST = 'quest',
  MISC = 'misc'
}

/**
 * Interface for Item entities
 * Extends base entity interface
 */
export interface IItem extends IEntity {
  type: ItemType | string;
  value: number;
  properties?: ItemProperties;
}
