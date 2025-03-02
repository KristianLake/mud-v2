// Message types
export type MessageType = 'system' | 'player' | 'error' | 'command' | 'ambient' | 'npc' | 'inventory' | 'quest';

// Message action
export interface MessageAction {
  label: string;
  command: string;
  style?: string;
}

// Message structure
export interface Message {
  content: string;
  type: MessageType;
  timestamp?: number;
  actions?: MessageAction[];
}

// Quest structure
export interface Quest {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  canComplete: boolean;
  objectives: {
    id: string;
    description: string;
    isCompleted: boolean;
    type: string;
    target?: string;
  }[];
  rewards: {
    type: string;
    value: number;
    description: string;
  }[];
}

// NPC structure
export interface NPC {
  id: string;
  name: string;
  description: string;
  location: string;
  dialogue: Record<string, string>;
  canTrade?: boolean;
  inventory?: string[];
  questIds?: string[];
  hasQuest?: boolean;
}

// Item structure
export interface Item {
  id: string;
  name: string;
  description: string;
  location: string;
  isCarryable: boolean;
  value?: number;
  type?: string;
  properties?: Record<string, any>;
}

// Room structure
export interface Room {
  id: string;
  name: string;
  description: string;
  exits: Record<string, string>;
  items?: string[];
  npcs?: string[];
}

// Player stats
export interface PlayerStats {
  health: number;
  maxHealth: number;
  level: number;
  experience: number;
  gold: number;
}

// Trade item
export interface TradeItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}
