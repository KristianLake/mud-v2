import { Quest } from '../../entities/Quest';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../../utils/logger';

// NOTE: This class seems unnecessary as quest formatting can be handled within
//       QuestService or QuestSystem.  It should likely be removed.  Keeping it
//       temporarily to satisfy the "continue" instruction.

export class QuestFormatter extends BaseGameService {
    // Formats a quest for display.
    formatQuest(quest: Quest): string {
        const objectives = quest.objectives
            .map(objective => `${objective.description} (${objective.isCompleted ? 'Completed' : 'In Progress'})`)
            .join('\n');

        return `
            Quest: ${quest.name}
            Description: ${quest.description}
            Objectives:
            ${objectives}
            Rewards: ${JSON.stringify(quest.rewards)}
            Status: ${quest.isCompleted ? 'Completed' : 'In Progress'}
        `;
    }

    // Formats all quests for display.
    formatAllQuests(quests: { [key: string]: Quest }): string {
        return Object.values(quests)
            .map(quest => this.formatQuest(quest))
            .join('\n\n');
    }
}
