/**
 * Interface Segregation Principle - Split into focused interfaces
 */

import { Room, NPC, Item, TimeOfDay, QuestEntry } from '../../../types';

/**
 * Player state interface
 */
export interface IPlayerState {
  readonly playerLocation: string;
  readonly playerInventory: Item[];
  readonly playerGold: number;
  readonly playerHealth: number;
  readonly playerStats: {
    readonly baseAttack: number;
    readonly baseDefense: number;
    readonly maxHealth: number;
  };
}

/**
 * World state interface
 */
export interface IWorldState {
  readonly rooms: Record<string, Room>;
  readonly npcs: Record<string, NPC>;
  readonly timeOfDay: TimeOfDay;
}

/**
 * Quest state interface
 */
export interface IQuestState {
  readonly questLog: QuestEntry[];
}

/**
 * Combined game state interface
 */
export interface IGameState extends 
  IPlayerState,
  IWorldState,
  IQuestState {}
