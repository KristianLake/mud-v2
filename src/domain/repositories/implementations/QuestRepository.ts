import { BaseRepository } from './BaseRepository';
import { IQuest } from '../../entities/interfaces/IQuest';
import { Quest } from '../../entities/implementations/Quest';

/**
 * Repository for Quest entities
 * Single Responsibility: Manages storage and retrieval of quests
 */
export class QuestRepository extends BaseRepository<IQuest> {
  constructor() {
    super('Quest');
  }
  
  /**
   * Find all completed quests
   */
  findAllCompleted(): IQuest[] {
    return this.getAll().filter(quest => quest.isCompleted);
  }
  
  /**
   * Find all active (not completed) quests
   */
  findAllActive(): IQuest[] {
    return this.getAll().filter(quest => !quest.isCompleted);
  }
  
  /**
   * Find quests that involve a specific item
   */
  findQuestsInvolvingItem(itemId: string): IQuest[] {
    return this.getAll().filter(quest => {
      // Check objectives for the item
      const hasObjectiveWithItem = quest.objectives.some(
        obj => obj.type === 'collect' && obj.target === itemId
      );
      
      // Check rewards for the item
      const hasRewardWithItem = quest.rewards.some(
        reward => reward.type === 'item' && reward.target === itemId
      );
      
      return hasObjectiveWithItem || hasRewardWithItem;
    });
  }
  
  /**
   * Find quests that involve a specific NPC
   */
  findQuestsInvolvingNPC(npcId: string): IQuest[] {
    return this.getAll().filter(quest => {
      // Check objectives for the NPC
      return quest.objectives.some(
        obj => obj.type === 'defeat' && obj.target === npcId
      );
    });
  }
  
  /**
   * Find quests with partially completed objectives
   */
  findPartiallyCompleted(): IQuest[] {
    return this.getAll().filter(quest => {
      // Has at least one completed objective but not all
      const hasCompletedObjective = quest.objectives.some(obj => obj.isCompleted);
      return hasCompletedObjective && !quest.isCompleted;
    });
  }
  
  /**
   * Create a Quest instance from plain object
   */
  createFromObject(obj: IQuest): Quest {
    return new Quest(obj);
  }
}
