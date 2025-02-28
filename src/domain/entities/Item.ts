export interface Item {
  id: string;
  name: string;
  description: string;
  type: string; // e.g., 'weapon', 'armor', 'shield', 'helmet', 'accessory', 'consumable', 'key', 'quest'
  value: number;
  properties?: {
    damage?: number;
    defense?: number;
    healthBonus?: number;
    effect?: string;
    durability?: number;
    [key: string]: any; // For additional flexible properties
  };
}
