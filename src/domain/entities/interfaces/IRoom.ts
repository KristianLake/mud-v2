import { IEntity } from './IEntity';

/**
 * Interface for room exits
 */
export interface IRoomExits {
  [direction: string]: string; // Direction -> room ID mapping
}

/**
 * Interface for Room entities
 * Extends base entity interface
 */
export interface IRoom extends IEntity {
  items: string[]; // Array of item IDs
  npcs: string[]; // Array of NPC IDs
  exits: IRoomExits;
}
