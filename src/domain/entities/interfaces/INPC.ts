import { IEntity } from './IEntity';
import { IItem } from './IItem';

/**
 * Interface for NPC dialogue options
 */
export interface IDialogueOption {
  id: string;
  text: string;
  action?: string;
  nextOptions?: IDialogueOption[];
  condition?: () => boolean;
}

/**
 * Interface for NPC dialogue
 */
export interface INPCDialogue {
  greeting: string[];
  topics?: Record<string, string[]>;
  options?: IDialogueOption[];
  farewell: string[];
}

/**
 * Interface for NPC stats
 */
export interface INPCStats {
  health: number;
  attack?: number;
  defense?: number;
}

/**
 * Interface for NPC entities
 * Extends base entity interface
 */
export interface INPC extends IEntity {
  dialogue: INPCDialogue;
  inventory: IItem[];
  isHostile?: boolean;
  isMerchant?: boolean;
  isQuestGiver?: boolean;
  stats?: INPCStats;
  currentRoomId?: string;
  health?: number;
}
