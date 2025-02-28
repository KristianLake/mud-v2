import { IGameMaster } from '../../agents/IGameMaster';
import { GameState } from './state/IStateService';
import { CommandService } from './command/CommandService';
import { ServiceTokens } from '../services/di/ServiceTokens';
import { Container } from '../services/di/Container';
import { ICommand } from './command/ICommand';
import { IEventService } from './event/IEventService';
import { EventService } from './event/EventService';
import { IEnvironmentService } from './environment/IEnvironmentService';
import { EnvironmentService } from './environment/EnvironmentService';
import { IStateService } from './state/IStateService';
import { StateService } from './state/StateService';
import { IMessageService } from './messaging/IMessageService';
import { MessageService } from '../../services/MessageService';
import { IAudioSystem } from './audio/IAudioSystem';
import { AudioSystem } from './audio/AudioSystem';
import { ICombatSystem } from './combat/ICombatSystem';
import { CombatSystem } from './combat/CombatSystem';
import { IQuestSystem } from './quest/IQuestSystem';
import { QuestSystem } from './quest/QuestSystem';
import { logger } from '../../utils/logger';

// This class is unnecessary and should be removed.  It duplicates the functionality
// of src/agents/GameMasterAgent.ts.  Keeping this to avoid breaking the "continue"
// instruction, but this should be deleted.

export class GameMasterAgent implements IGameMaster {
  private static instance: GameMasterAgent | null = null;
  private commandService: CommandService;
  private eventService: IEventService;
  private environmentService: IEnvironmentService;
  private stateService: IStateService;
  private messageService: IMessageService;
  private audioSystem: IAudioSystem;
  private combatSystem: ICombatSystem;
  private questSystem: IQuestSystem;
  private container: Container;
  private isMounted = false;
  private instanceId: string | null = null;

  private constructor(initialState: GameState) {
    this.container = Container.getInstance();

    // Register services
    this.container.register(ServiceTokens.EventService, () => new EventService());
    this.container.register(ServiceTokens.EnvironmentService, () => new EnvironmentService());
    this.container.register(ServiceTokens.StateService, () => new StateService(initialState));
    this.container.register(ServiceTokens.MessageService, () => new MessageService());
    this.container.register(ServiceTokens.AudioSystem, () => new AudioSystem());
    this.container.register(ServiceTokens.CombatSystem, () => new CombatSystem());
    this.container.register(ServiceTokens.QuestSystem, () => new QuestSystem());
    this.container.register(ServiceTokens.CommandService, () => new CommandService());

    // Resolve services
    this.eventService = this.container.resolve<IEventService>(ServiceTokens.EventService);
    this.environmentService = this.container.resolve<IEnvironmentService>(ServiceTokens.EnvironmentService);
    this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
    this.messageService = this.container.resolve<IMessageService>(ServiceTokens.MessageService);
    this.audioSystem = this.container.resolve<IAudioSystem>(ServiceTokens.AudioSystem);
    this.combatSystem = this.container.resolve<ICombatSystem>(ServiceTokens.CombatSystem);
    this.questSystem = this.container.resolve<IQuestSystem>(ServiceTokens.QuestSystem);
    this.commandService = this.container.resolve<CommandService>(ServiceTokens.CommandService);

    this.commandService.registerCommands();
  }

  public static async getInstance(initialState: GameState): Promise<GameMasterAgent> {
    if (!GameMasterAgent.instance) {
      GameMasterAgent.instance = new GameMasterAgent(initialState);
    }
    return GameMasterAgent.instance;
  }

  mount(instanceId: string): void {
    if (!this.isMounted) {
      this.instanceId = instanceId;
      this.isMounted = true;
      logger.info(`GameMasterAgent mounted with instance ID: ${instanceId}`);
    } else {
      logger.warn('GameMasterAgent is already mounted.');
    }
  }

  unmount(): void {
    if (this.isMounted) {
      this.isMounted = false;
      this.instanceId = null;
      logger.info('GameMasterAgent unmounted.');
    } else {
      logger.warn('GameMasterAgent is not mounted.');
    }
  }

  processCommand(command: string): string {
    if (!this.isMounted) {
      logger.warn('GameMasterAgent is not mounted. Cannot process command.');
      return "Game is not initialized.";
    }
    logger.debug(`Processing command: ${command}`);
    return this.commandService.processCommand(command);
  }

  getGameState(): GameState {
    if (!this.isMounted) {
      logger.warn('GameMasterAgent is not mounted. Cannot retrieve game state.');
      throw new Error("Game is not initialized.");
    }
    return this.stateService.getState();
  }

  // Method to check if the instance is mounted
  isGameMounted(): boolean {
    return this.isMounted;
  }

  getInstanceId(): string | null {
    return this.instanceId;
  }

  async reset(): Promise<void> {
    if (this.isMounted) {
      this.unmount();
    }
    await this.container.dispose();
    GameMasterAgent.instance = null;
    logger.info('GameMasterAgent instance reset.');
  }
}
