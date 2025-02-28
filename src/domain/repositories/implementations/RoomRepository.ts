import { BaseRepository } from './BaseRepository';
import { IRoom } from '../../entities/interfaces/IRoom';
import { Room } from '../../entities/implementations/Room';

/**
 * Repository for Room entities
 * Single Responsibility: Manages storage and retrieval of rooms
 */
export class RoomRepository extends BaseRepository<IRoom> {
  constructor() {
    super('Room');
  }
  
  /**
   * Find rooms that contain a specific item
   */
  findRoomsWithItem(itemId: string): IRoom[] {
    return this.getAll().filter(room => room.items.includes(itemId));
  }
  
  /**
   * Find rooms that contain a specific NPC
   */
  findRoomsWithNPC(npcId: string): IRoom[] {
    return this.getAll().filter(room => room.npcs.includes(npcId));
  }
  
  /**
   * Find rooms that are connected to a specific room
   */
  findConnectedRooms(roomId: string): IRoom[] {
    const room = this.getById(roomId);
    if (!room) return [];
    
    // Get all room IDs this room connects to
    const connectedRoomIds = Object.values(room.exits);
    
    // Return all connected rooms that exist
    return connectedRoomIds
      .map(id => this.getById(id))
      .filter((r): r is IRoom => r !== undefined);
  }
  
  /**
   * Find rooms that have a specific exit direction
   */
  findRoomsWithExit(direction: string): IRoom[] {
    return this.getAll().filter(room => direction in room.exits);
  }
  
  /**
   * Get the direction from one room to another, if connected
   */
  getDirectionBetweenRooms(fromRoomId: string, toRoomId: string): string | null {
    const fromRoom = this.getById(fromRoomId);
    if (!fromRoom) return null;
    
    // Find the exit direction that leads to the target room
    for (const [direction, exitRoomId] of Object.entries(fromRoom.exits)) {
      if (exitRoomId === toRoomId) {
        return direction;
      }
    }
    
    return null;
  }
  
  /**
   * Create a Room instance from plain object
   */
  createFromObject(obj: IRoom): Room {
    return new Room(obj);
  }
}
