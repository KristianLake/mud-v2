import { IRoom } from '../../entities/interfaces/IRoom';

/**
 * Interface for movement service
 */
export interface IMovementService {
  /**
   * Move player in a direction
   * @param direction Direction to move
   * @returns True if movement was successful
   */
  move(direction: string): boolean;
  
  /**
   * Get available exit directions from current room
   * @returns Array of available exit directions
   */
  getAvailableExits(): string[];
  
  /**
   * Get current room
   * @returns Current room or undefined if not in a room
   */
  getCurrentRoom(): IRoom | undefined;
  
  /**
   * Get current room ID
   * @returns Current room ID
   */
  getCurrentRoomId(): string;
  
  /**
   * Check if a direction is valid from current room
   * @param direction Direction to check
   * @returns True if direction is valid
   */
  isValidDirection(direction: string): boolean;
  
  /**
   * Get room description
   * @returns Room description
   */
  getRoomDescription(): string;
  
  /**
   * Teleport player to a specific room
   * @param roomId Room ID to teleport to
   * @returns True if teleport was successful
   */
  teleport(roomId: string): boolean;
  
  /**
   * Look around the current room
   */
  lookAround(): void;
}
