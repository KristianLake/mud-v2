import { Quest } from '../entities/Quest';
import { IEventService } from './event/IEventService';
import { IStateService } from './state/IStateService';
import { ServiceTokens } from './di/ServiceTokens';
import { Container } from './di/Container';
import { BaseGameService } from './BaseGameService';
import { logger } from '../../utils/logger';

export class QuestLog extends BaseGameService {
  private stateService: IStateService;

  constructor() {
    super();
    this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
  }

  addQuest(quest: Quest): void {
    const gameState = this.stateService.getState();
    const updatedQuestLog = { ...gameState.questLog, [quest.id]: quest };
    this.stateService.updateState({ questLog: updatedQuestLog });
    logger.info(`Added quest to log: ${quest.name}`);
    this.eventService.emit('questLogChange', { questLog: updatedQuestLog });
  }

  updateQuest(questId: string, updates: Partial<Quest>): void {
    const gameState = this.stateService.getState();
    const quest = gameState.questLog[questId];

    if (!quest) {
      logger.warn(`Quest not found: ${questId}`);
      return;
    }

    const updatedQuest = { ...quest, ...updates };
    const updatedQuestLog = { ...gameState.questLog, [questId]: updatedQuest };
    this.stateService.updateState({ questLog: updatedQuestLog });
    logger.info(`Updated quest: ${quest.name}`);
    this.eventService.emit('questLogChange', { questLog: updatedQuestLog });
  }

  removeQuest(questId: string): void {
    const gameState = this.stateService.getState();
    const { [questId]: removedQuest, ...updatedQuestLog } = gameState.questLog;

    if (!removedQuest) {
      logger.warn(`Quest not found: ${questId}`);
      return;
    }

    this.stateService.updateState({ questLog: updatedQuestLog });
    logger.info(`Removed quest from log: ${questId}`);
    this.eventService.emit('questLogChange', { questLog: updatedQuestLog });
  }

  getQuest(questId: string): Quest | undefined {
    const gameState = this.stateService.getState();
    return gameState.questLog[questId];
  }

  getAllQuests(): { [key: string]: Quest } {
    const gameState = this.stateService.getState();
    return gameState.questLog;
  }
}
