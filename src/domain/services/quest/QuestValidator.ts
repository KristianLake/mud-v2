import { IQuestValidator } from './IQuestSystem';
import { Quest, Item } from '../../../types';

export class QuestValidator implements IQuestValidator {
  canAcceptQuest(quest: Quest): boolean {
    return !quest.isActive && !quest.isComplete;
  }

  canCompleteQuest(quest: Quest, items: Item[]): boolean {
    if (!quest.isActive || quest.isComplete) {
      return false;
    }

    if (!quest.requiredItem) {
      return true;
    }

    return items.some(item => item.id === quest.requiredItem);
  }

  isQuestActive(questId: string): boolean {
    // Implementation would check against quest state
    return false;
  }

  isQuestComplete(questId: string): boolean {
    // Implementation would check against quest state
    return false;
  }
}
