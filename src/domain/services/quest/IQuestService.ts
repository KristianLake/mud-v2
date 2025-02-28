import { IQuest } from '../../entities/interfaces/IQuest';

/**
 * Interface for quest service
 * Follows Interface Segregation with focused methods
 */
export interface IQuestService {
  /**
   * Start a quest
   */
  startQuest(questId: string): boolean;
  
  /**
   * Get all active quests
   */
  getActiveQuests(): IQuest[];
  
  /**
   * Get all completed quests
   */
  getCompletedQuests(): IQuest[];
  
  /**
   * Get a quest by ID
   */
  getQuest(questId: string): IQuest | undefined;
  
  /**
   * Check if a quest is active
   */
  isQuestActive(questId: string): boolean;
  
  /**
   * Check if a quest is completed
   */
  isQuestCompleted(questId: string): boolean;
  
  /**
   * Update a quest objective
   */
  updateQuestObjective(questId: string, objectiveIndex: number, isCompleted: boolean): boolean;
  
  /**
   * Check if all objectives are completed for a quest
   */
  areAllObjectivesCompleted(questId: string): boolean;
  
  /**
   * Complete a quest
   */
  completeQuest(questId: string): boolean;
  
  /**
   * Award quest rewards
   */
  awardQuestRewards(questId: string): boolean;
  
  /**
   * Track progress for collect item objective
   */
  trackItemCollectionProgress(itemId: string): void;
  
  /**
   * Track progress for defeat NPC objective
   */
  trackNPCDefeatProgress(npcId: string): void;
  
  /**
   * Track progress for visit room objective
   */
  trackRoomVisitProgress(roomId: string): void;
}
