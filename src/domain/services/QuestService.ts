import { Quest } from '../entities/Quest';
import { IEventService } from './event/IEventService';
import { IStateService } from './state/IStateService';
import { ServiceTokens } from './di/ServiceTokens';
import { Container } from './di/Container';
import { BaseGameService } from './BaseGameService';
import { IQuestSystem } from './quest/IQuestSystem';
import { QuestSystem } from './quest/QuestSystem';
import { logger } from '../../utils/logger';

export class QuestService extends BaseGameService {
    private stateService: IStateService;
    private questSystem: IQuestSystem;

    constructor() {
        super();
        this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
        this.questSystem = this.container.resolve<IQuestSystem>(ServiceTokens.QuestSystem);
    }

    // Adds a new quest to the game.
    addQuest(quest: Quest): void {
        this.questSystem.addQuest(quest);
        logger.info(`Added quest: ${quest.name}`);
    }

    // Updates the status of an existing quest.
    updateQuestStatus(questId: string, updates: Partial<Quest>): void {
        this.questSystem.updateQuestStatus(questId, updates);
        logger.info(`Updated quest with ID: ${questId}`);
    }

    // Marks a quest as completed.
    completeQuest(questId: string): void {
        this.questSystem.completeQuest(questId);
        logger.info(`Completed quest with ID: ${questId}`);
    }

    // Retrieves a quest by its ID.
    getQuest(questId: string): Quest | undefined {
        return this.questSystem.getQuest(questId);
    }

    // Retrieves all quests in the game.
    getAllQuests(): { [key: string]: Quest } {
        return this.questSystem.getAllQuests();
    }
}
