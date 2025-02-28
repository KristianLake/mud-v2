import { IItem } from '../../entities/interfaces/IItem';
import { INPC } from '../../entities/interfaces/INPC';
import { IQuest } from '../../entities/interfaces/IQuest';
import { IRoom } from '../../entities/interfaces/IRoom';

/**
 * Interface for entity service
 * Follows Interface Segregation with specific entity-related methods
 */
export interface IEntityService {
  /**
   * Initialize entities from state
   */
  initializeFromState(state: any): void;
  
  /**
   * Get an item by ID
   */
  getItem(itemId: string): IItem | undefined;
  
  /**
   * Get all items
   */
  getAllItems(): IItem[];
  
  /**
   * Get an NPC by ID
   */
  getNPC(npcId: string): INPC | undefined;
  
  /**
   * Get all NPCs
   */
  getAllNPCs(): INPC[];
  
  /**
   * Get a room by ID
   */
  getRoom(roomId: string): IRoom | undefined;
  
  /**
   * Get all rooms
   */
  getAllRooms(): IRoom[];
  
  /**
   * Get a quest by ID
   */
  getQuest(questId: string): IQuest | undefined;
  
  /**
   * Get all quests
   */
  getAllQuests(): IQuest[];
  
  /**
   * Get items in a specific room
   */
  getItemsInRoom(roomId: string): IItem[];
  
  /**
   * Get NPCs in a specific room
   */
  getNPCsInRoom(roomId: string): INPC[];
  
  /**
   * Get active quests (not completed)
   */
  getActiveQuests(): IQuest[];
  
  /**
   * Update an entity
   */
  updateEntity<T>(type: 'item' | 'npc' | 'quest' | 'room', entity: T): void;
}
