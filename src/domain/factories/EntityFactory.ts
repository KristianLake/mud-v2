import { ItemRepository } from '../repositories/implementations/ItemRepository';
import { NPCRepository } from '../repositories/implementations/NPCRepository';
import { QuestRepository } from '../repositories/implementations/QuestRepository';
import { RoomRepository } from '../repositories/implementations/RoomRepository';

import { IItem } from '../entities/interfaces/IItem';
import { INPC } from '../entities/interfaces/INPC';
import { IQuest } from '../entities/interfaces/IQuest';
import { IRoom } from '../entities/interfaces/IRoom';

import { Item } from '../entities/implementations/Item';
import { NPC } from '../entities/implementations/NPC';
import { Quest } from '../entities/implementations/Quest';
import { Room } from '../entities/implementations/Room';
import { logger } from '../../utils/logger';

/**
 * Factory for creating game entities
 * Single Responsibility: Creates and initializes entity objects
 * Factory design pattern
 */
export class EntityFactory {
  private static _instance: EntityFactory;
  
  private itemRepository: ItemRepository;
  private npcRepository: NPCRepository;
  private questRepository: QuestRepository;
  private roomRepository: RoomRepository;
  
  private constructor() {
    this.itemRepository = new ItemRepository();
    this.npcRepository = new NPCRepository();
    this.questRepository = new QuestRepository();
    this.roomRepository = new RoomRepository();
    
    logger.debug('EntityFactory initialized');
  }
  
  /**
   * Get factory instance (singleton)
   */
  public static getInstance(): EntityFactory {
    if (!EntityFactory._instance) {
      EntityFactory._instance = new EntityFactory();
    }
    return EntityFactory._instance;
  }
  
  /**
   * Create an Item entity
   */
  createItem(data: IItem): Item {
    const item = new Item(data);
    this.itemRepository.save(item);
    return item;
  }
  
  /**
   * Create an NPC entity
   */
  createNPC(data: INPC): NPC {
    const npc = new NPC(data);
    this.npcRepository.save(npc);
    return npc;
  }
  
  /**
   * Create a Quest entity
   */
  createQuest(data: IQuest): Quest {
    const quest = new Quest(data);
    this.questRepository.save(quest);
    return quest;
  }
  
  /**
   * Create a Room entity
   */
  createRoom(data: IRoom): Room {
    const room = new Room(data);
    this.roomRepository.save(room);
    return room;
  }
  
  /**
   * Get the item repository
   */
  getItemRepository(): ItemRepository {
    return this.itemRepository;
  }
  
  /**
   * Get the NPC repository
   */
  getNPCRepository(): NPCRepository {
    return this.npcRepository;
  }
  
  /**
   * Get the quest repository
   */
  getQuestRepository(): QuestRepository {
    return this.questRepository;
  }
  
  /**
   * Get the room repository
   */
  getRoomRepository(): RoomRepository {
    return this.roomRepository;
  }
  
  /**
   * Reset all repositories
   */
  reset(): void {
    this.itemRepository.clear();
    this.npcRepository.clear();
    this.questRepository.clear();
    this.roomRepository.clear();
    logger.debug('All entity repositories reset');
  }
}
