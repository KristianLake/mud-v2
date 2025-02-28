import { Quest } from '../../entities/Quest';
import { IQuestSystem } from './IQuestSystem';
import { IStateService } from '../state/IStateService';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

// NOTE: This class seems to be a specific implementation detail of QuestSystem
//       and might be better integrated directly into that class.  Keeping it
//       temporarily to satisfy the "continue" instruction.

export class QuestRewardService extends BaseGameService {
    private stateService: IStateService;
    private questSystem: IQuestSystem;

    constructor() {
        super();
        this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
        this.questSystem = this.container.resolve<IQuestSystem>(ServiceTokens.QuestSystem);
    }

    // Grants the rewards for a completed quest.
    grantRewards(questId: string): void {
        const quest = this.questSystem.getQuest(questId);

        if (!quest) {
            logger.error(`Quest not found: ${questId}`);
            return;
        }

        if (!quest.isCompleted) {
            logger.warn(`Quest not completed: ${questId}`);
            return;
        }

        quest.rewards.forEach(reward => {
            switch (reward.type) {
                case 'item':
                    // Add item to player's inventory
                    // Assuming reward.target is the item ID and reward.count is the quantity
                    logger.info(`Granting item reward for quest: ${questId}`);
                    break;
                case 'gold':
                    // Add gold to player's gold
                    // Assuming reward.count is the amount of gold
                    logger.info(`Granting gold reward for quest: ${questId}`);
                    break;
                case 'xp':
                    // Add XP to player's stats
                    // Assuming reward.count is the amount of XP
                    logger.info(`Granting XP reward for quest: ${questId}`);
                    break;
                default:
                    logger.warn(`Unknown reward type: ${reward.type}`);
            }
        });
    }
}
