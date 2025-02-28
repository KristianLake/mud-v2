import { BaseRepository } from './BaseRepository';
import { INPC } from '../../entities/interfaces/INPC';
import { NPC } from '../../entities/implementations/NPC';

/**
 * Repository for NPC entities
 * Single Responsibility: Manages storage and retrieval of NPCs
 */
export class NPCRepository extends BaseRepository<INPC> {
  constructor() {
    super('NPC');
  }
  
  /**
   * Find NPCs by room ID
   */
  findByRoomId(roomId: string): INPC[] {
    return this.getAll().filter(npc => npc.currentRoomId === roomId);
  }
  
  /**
   * Find all merchants
   */
  findAllMerchants(): INPC[] {
    return this.getAll().filter(npc => npc.isMerchant);
  }
  
  /**
   * Find all quest givers
   */
  findAllQuestGivers(): INPC[] {
    return this.getAll().filter(npc => npc.isQuestGiver);
  }
  
  /**
   * Find all hostile NPCs
   */
  findAllHostile(): INPC[] {
    return this.getAll().filter(npc => npc.isHostile);
  }
  
  /**
   * Get NPCs that are alive
   */
  findAllAlive(): INPC[] {
    return this.getAll().filter(npc => {
      if (npc.health === undefined || npc.stats?.health === undefined) {
        return true; // NPCs without health tracking are considered "alive"
      }
      return npc.health > 0;
    });
  }
  
  /**
   * Get NPCs in the same room as another NPC
   */
  findNPCsInSameRoom(npcId: string): INPC[] {
    const npc = this.getById(npcId);
    if (!npc || !npc.currentRoomId) return [];
    
    return this.findByRoomId(npc.currentRoomId).filter(
      otherNpc => otherNpc.id !== npcId
    );
  }
  
  /**
   * Create an NPC instance from plain object
   */
  createFromObject(obj: INPC): NPC {
    return new NPC(obj);
  }
}
