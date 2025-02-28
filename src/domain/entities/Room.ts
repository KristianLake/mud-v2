export interface Room {
  id: string;
  name: string;
  description: string;
  items: string[]; // Array of item IDs
  npcs: string[]; // Array of NPC IDs
  exits: { [key: string]: string }; // Direction -> room ID mapping
}
