import { Quest } from '../../entities/Quest';

export interface IQuestSystem {
    addQuest(quest: Quest): void;
    updateQuestStatus(questId: string, updates: Partial<Quest>): void;
    completeQuest(questId: string): void;
    getQuest(questId: string): Quest | undefined;
    getAllQuests(): { [key: string]: Quest };
}
