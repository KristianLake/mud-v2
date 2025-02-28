import { 
  IQuestSystem, 
  QuestResult, 
  IQuestState, 
  IQuestValidator 
} from './IQuestSystem';
import { Quest, QuestEntry, NPC, Item } from '../../../types';
import { QuestValidator } from './QuestValidator';
import { QuestRewardService } from './QuestRewardService';
import { QuestStateManager } from './QuestStateManager';

export class QuestSystem implements IQuestSystem {
  private validator: IQuestValidator;
  private rewardService: QuestRewardService;
  private stateManager: QuestStateManager;

  constructor() {
    this.validator = new QuestValidator();
    this.rewardService = new QuestRewardService();
    this.stateManager = new QuestStateManager();
  }

  acceptQuest(quest: Quest): QuestEntry {
    if (!this.validator.canAcceptQuest(quest)) {
      throw new Error('Cannot accept this quest');
    }

    const entry: QuestEntry = {
      questId: quest.id,
      isComplete: false,
      dateStarted: new Date()
    };

    this.stateManager.addActiveQuest(entry);
    return entry;
  }

  completeQuest(quest: Quest, npc: NPC): QuestResult {
    if (!this.validator.canCompleteQuest(quest, npc.inventory)) {
      return {
        success: false,
        message: `Cannot complete quest: ${quest.name}`
      };
    }

    const rewards = this.rewardService.calculateRewards(quest, npc);
    const entry = this.stateManager.getQuestEntry(quest.id);

    if (entry) {
      entry.isComplete = true;
      entry.dateCompleted = new Date();
      this.stateManager.moveToCompleted(entry);
    }

    return {
      success: true,
      message: `Completed quest: ${quest.name}`,
      rewards
    };
  }

  failQuest(questId: string): void {
    const entry = this.stateManager.getQuestEntry(questId);
    if (entry) {
      entry.isComplete = true;
      entry.dateCompleted = new Date();
      entry.failed = true;
      this.stateManager.moveToCompleted(entry);
    }
  }

  getActiveQuests(): QuestEntry[] {
    return this.stateManager.getActiveQuests();
  }

  getCompletedQuests(): QuestEntry[] {
    return this.stateManager.getCompletedQuests();
  }

  isQuestAvailable(npc: NPC): boolean {
    return npc.quest !== undefined && 
           !npc.quest.isActive && 
           !npc.quest.isComplete;
  }

  canCompleteQuest(quest: Quest, items: Item[]): boolean {
    return this.validator.canCompleteQuest(quest, items);
  }
}
