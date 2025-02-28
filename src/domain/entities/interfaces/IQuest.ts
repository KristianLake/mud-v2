import { IEntity } from './IEntity';

/**
 * Interface for quest objectives
 */
export interface IQuestObjective {
  description: string;
  isCompleted: boolean;
  type: string; // e.g., 'collect', 'defeat', 'explore'
  target?: string; // e.g., item ID, NPC ID, room ID
  count?: number; // e.g., number of items to collect
}

/**
 * Interface for quest rewards
 */
export interface IQuestReward {
  type: string; // e.g., 'item', 'gold', 'xp'
  target?: string; // e.g., item ID
  count?: number; // e.g., amount of gold
}

/**
 * Interface for Quest entities
 * Extends base entity interface
 */
export interface IQuest extends IEntity {
  objectives: IQuestObjective[];
  rewards: IQuestReward[];
  isCompleted: boolean;
}
