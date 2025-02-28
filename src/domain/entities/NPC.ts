import { Item } from './Item';

export interface NPC {
  id: string;
  name: string;
  description: string;
  dialogue: {
    greeting: string[];
    topics?: Record<string, string[]>;
    options?: DialogueOption[];
    farewell: string[];
  };
  inventory: Item[];
  isHostile?: boolean;
  isMerchant?: boolean;
  isQuestGiver?: boolean;
  stats?: {
    health: number;
    attack?: number;
    defense?: number;
  };
  currentRoomId?: string;
  health?: number;
}

export interface DialogueOption {
  id: string;
  text: string;
  action?: string;
  nextOptions?: DialogueOption[];
  condition?: () => boolean;
}
