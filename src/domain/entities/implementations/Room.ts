import { IRoom, IRoomExits } from '../interfaces/IRoom';

/**
 * Implementation of Room entity
 * Single Responsibility: Models a room in the game
 */
export class Room implements IRoom {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly items: string[];
  public readonly npcs: string[];
  public readonly exits: IRoomExits;

  constructor(params: IRoom) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.items = [...params.items];
    this.npcs = [...params.npcs];
    this.exits = { ...params.exits };
  }

  /**
   * Check if a direction is a valid exit
   */
  hasExit(direction: string): boolean {
    return direction in this.exits;
  }

  /**
   * Get room ID connected in the given direction
   */
  getExitRoomId(direction: string): string | null {
    return this.exits[direction] || null;
  }

  /**
   * Get all available exit directions
   */
  getExitDirections(): string[] {
    return Object.keys(this.exits);
  }

  /**
   * Check if room contains an item with given ID
   */
  hasItem(itemId: string): boolean {
    return this.items.includes(itemId);
  }

  /**
   * Check if room contains an NPC with given ID
   */
  hasNPC(npcId: string): boolean {
    return this.npcs.includes(npcId);
  }

  /**
   * Create a new Room with added item
   */
  withAddedItem(itemId: string): Room {
    if (this.hasItem(itemId)) return this;
    
    return new Room({
      ...this,
      items: [...this.items, itemId]
    });
  }

  /**
   * Create a new Room with removed item
   */
  withRemovedItem(itemId: string): Room {
    if (!this.hasItem(itemId)) return this;
    
    return new Room({
      ...this,
      items: this.items.filter(id => id !== itemId)
    });
  }

  /**
   * Create a new Room with added NPC
   */
  withAddedNPC(npcId: string): Room {
    if (this.hasNPC(npcId)) return this;
    
    return new Room({
      ...this,
      npcs: [...this.npcs, npcId]
    });
  }

  /**
   * Create a new Room with removed NPC
   */
  withRemovedNPC(npcId: string): Room {
    if (!this.hasNPC(npcId)) return this;
    
    return new Room({
      ...this,
      npcs: this.npcs.filter(id => id !== npcId)
    });
  }
}
