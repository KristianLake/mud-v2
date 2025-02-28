import { IEntityService } from './IEntityService';
import { EntityFactory } from '../../factories/EntityFactory';
import { IItem } from '../../entities/interfaces/IItem';
import { INPC } from '../../entities/interfaces/INPC';
import { IQuest } from '../../entities/interfaces/IQuest';
import { IRoom } from '../../entities/interfaces/IRoom';
import { Item } from '../../entities/implementations/Item';
import { NPC } from '../../entities/implementations/NPC';
import { Quest } from '../../entities/implementations/Quest';
import { Room } from '../../entities/implementations/Room';
import { logger } from '../../../utils/logger';
import { IStateService } from '../state/IStateService';

/**
 * Service for managing game entities
 * Single Responsibility: Coordinates entity operations
 * Implements IEntityService interface
 */
export class EntityService implements IEntityService {
  private entityFactory: EntityFactory;
  
  constructor(private stateService: IStateService) {
    this.entityFactory = EntityFactory.getInstance();
    logger.debug('EntityService initialized');
    this.initialize();
  }
  
  /**
   * Initialize the service with state data
   */
  private initialize(): void {
    const state = this.stateService.getState();
    if (state) {
      this.initializeFromState(state);
    }
  }
  
  /**
   * Initialize entities from state
   */
  initializeFromState(state: any): void {
    logger.debug('Initializing entities from state');
    
    // Reset repositories
    this.entityFactory.reset();
    
    // Initialize rooms
    if (state.rooms && typeof state.rooms === 'object') {
      const roomRepo = this.entityFactory.getRoomRepository();
      Object.values(state.rooms).forEach((room: any) => {
        roomRepo.save(new Room(room));
      });
      logger.debug(`Initialized ${roomRepo.count()} rooms`);
    }
    
    // Initialize NPCs
    if (state.npcs && typeof state.npcs === 'object') {
      const npcRepo = this.entityFactory.getNPCRepository();
      Object.values(state.npcs).forEach((npc: any) => {
        npcRepo.save(new NPC(npc));
      });
      logger.debug(`Initialized ${npcRepo.count()} NPCs`);
    }
    
    // Initialize items
    if (state.items && typeof state.items === 'object') {
      const itemRepo = this.entityFactory.getItemRepository();
      Object.values(state.items).forEach((item: any) => {
        itemRepo.save(new Item(item));
      });
      logger.debug(`Initialized ${itemRepo.count()} items`);
    }
    
    // Add inventory items if they're not already in the item repository
    if (state.playerInventory && Array.isArray(state.playerInventory)) {
      const itemRepo = this.entityFactory.getItemRepository();
      state.playerInventory.forEach((itemId: string) => {
        if (!itemRepo.getById(itemId) && state.items && state.items[itemId]) {
          itemRepo.save(new Item(state.items[itemId]));
        }
      });
    }
    
    // Initialize quests
    if (state.questLog && Array.isArray(state.questLog)) {
      const questRepo = this.entityFactory.getQuestRepository();
      state.questLog.forEach((quest: any) => {
        questRepo.save(new Quest(quest));
      });
      logger.debug(`Initialized ${questRepo.count()} quests`);
    }
    
    logger.debug('Entity initialization complete');
  }
  
  /**
   * Get an item by ID
   */
  getItem(itemId: string): IItem | undefined {
    return this.entityFactory.getItemRepository().getById(itemId);
  }
  
  /**
   * Get all items
   */
  getAllItems(): IItem[] {
    return this.entityFactory.getItemRepository().getAll();
  }
  
  /**
   * Get an NPC by ID
   */
  getNPC(npcId: string): INPC | undefined {
    return this.entityFactory.getNPCRepository().getById(npcId);
  }
  
  /**
   * Get all NPCs
   */
  getAllNPCs(): INPC[] {
    return this.entityFactory.getNPCRepository().getAll();
  }
  
  /**
   * Get a room by ID
   */
  getRoom(roomId: string): IRoom | undefined {
    return this.entityFactory.getRoomRepository().getById(roomId);
  }
  
  /**
   * Get all rooms
   */
  getAllRooms(): IRoom[] {
    return this.entityFactory.getRoomRepository().getAll();
  }
  
  /**
   * Get a quest by ID
   */
  getQuest(questId: string): IQuest | undefined {
    return this.entityFactory.getQuestRepository().getById(questId);
  }
  
  /**
   * Get all quests
   */
  getAllQuests(): IQuest[] {
    return this.entityFactory.getQuestRepository().getAll();
  }
  
  /**
   * Get items in a specific room
   */
  getItemsInRoom(roomId: string): IItem[] {
    const room = this.getRoom(roomId);
    if (!room) return [];
    
    const itemRepo = this.entityFactory.getItemRepository();
    return room.items
      .map(id => itemRepo.getById(id))
      .filter((item): item is IItem => item !== undefined);
  }
  
  /**
   * Get NPCs in a specific room
   */
  getNPCsInRoom(roomId: string): INPC[] {
    const room = this.getRoom(roomId);
    if (!room) return [];
    
    const npcRepo = this.entityFactory.getNPCRepository();
    return room.npcs
      .map(id => npcRepo.getById(id))
      .filter((npc): npc is INPC => npc !== undefined);
  }
  
  /**
   * Get active quests (not completed)
   */
  getActiveQuests(): IQuest[] {
    return this.entityFactory.getQuestRepository().findAllActive();
  }
  
  /**
   * Update an entity
   */
  updateEntity<T>(type: 'item' | 'npc' | 'quest' | 'room', entity: T): void {
    switch (type) {
      case 'item':
        this.entityFactory.getItemRepository().save(entity as unknown as IItem);
        break;
      case 'npc':
        this.entityFactory.getNPCRepository().save(entity as unknown as INPC);
        break;
      case 'quest':
        this.entityFactory.getQuestRepository().save(entity as unknown as IQuest);
        break;
      case 'room':
        this.entityFactory.getRoomRepository().save(entity as unknown as IRoom);
        break;
      default:
        logger.error(`Unknown entity type: ${type}`);
    }
  }
}
