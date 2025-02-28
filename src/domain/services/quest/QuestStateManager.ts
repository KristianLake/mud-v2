import { QuestEntry } from '../../../types';
import { IQuestState } from './IQuestSystem';

export class QuestStateManager {
  private state: IQuestState = {
    activeQuests: [],
    completedQuests: []
  };

  addActiveQuest(entry: QuestEntry): void {
    this.state.activeQuests.push(entry);
  }

  moveToCompleted(entry: QuestEntry): void {
    this.state.activeQuests = this.state.activeQuests.filter(
      q => q.questId !== entry.questId
    );
    this.state.completedQuests.push(entry);
  }

  getQuestEntry(questId: string): QuestEntry | undefined {
    return this.state.activeQuests.find(q => q.questId === questId) ||
           this.state.completedQuests.find(q => q.questId === questId);
  }

  getActiveQuests(): QuestEntry[] {
    return [...this.state.activeQuests];
  }

  getCompletedQuests(): QuestEntry[] {
    return [...this.state.completedQuests];
  }

  clear(): void {
    this.state = {
      activeQuests: [],
      completedQuests: []
    };
  }
}
