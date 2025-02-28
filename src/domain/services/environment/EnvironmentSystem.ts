import { TimeManager } from './TimeManager';
import { RoomEnvironment } from './RoomEnvironment';
import { EnvironmentEffects } from './EnvironmentEffects';
import { EnvironmentEventEmitter } from './EnvironmentEventEmitter';
import { EnvironmentValidator } from './EnvironmentValidator';
import { AmbientMessageManager } from './AmbientMessageManager';
import { EffectManager } from './EffectManager';
import { EnvironmentStateManager } from './EnvironmentStateManager';
import { IEventService } from '../../event/IEventService';
import { IEnvironmentService } from './IEnvironmentService';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { logger } from '../../../utils/logger';

export class EnvironmentSystem {
  private timeManager: TimeManager;
  private roomEnvironment: RoomEnvironment;
  private environmentEffects: EnvironmentEffects;
  private eventEmitter: EnvironmentEventEmitter;
  private validator: EnvironmentValidator;
  private ambientMessageManager: AmbientMessageManager;
  private effectManager: EffectManager;
  private stateManager: EnvironmentStateManager;
  private isInitialized: boolean = false;
  private timeOfDay: string;
  private container: Container;
  private environmentService: IEnvironmentService;

  constructor(timeOfDay: string) {
    this.timeOfDay = timeOfDay;
    this.container = Container.getInstance();
    logger.debug('EnvironmentSystem: Resolving dependencies...');
    this.timeManager = this.container.resolve<TimeManager>(ServiceTokens.TimeManager);
    this.roomEnvironment = this.container.resolve<RoomEnvironment>(ServiceTokens.RoomEnvironment);
    this.environmentEffects = this.container.resolve<EnvironmentEffects>(ServiceTokens.EnvironmentEffects);
    this.eventEmitter = this.container.resolve<EnvironmentEventEmitter>(ServiceTokens.EnvironmentEventEmitter);
    this.validator = this.container.resolve<EnvironmentValidator>(ServiceTokens.EnvironmentValidator);
    this.ambientMessageManager = this.container.resolve<AmbientMessageManager>(ServiceTokens.AmbientMessageManager);
    this.effectManager = this.container.resolve<EffectManager>(ServiceTokens.EffectManager);
    logger.debug('EnvironmentSystem: Resolved EffectManager:', this.effectManager);
    this.stateManager = this.container.resolve<EnvironmentStateManager>(ServiceTokens.EnvironmentStateManager);
    logger.debug('EnvironmentSystem: Resolved StateManager:', this.stateManager);
    this.environmentService = this.container.resolve<IEnvironmentService>(ServiceTokens.EnvironmentService);
  }

  async initialize(eventService: IEventService): Promise<void> {
    try {
      logger.info('Initializing EnvironmentSystem');
      await this.timeManager.initialize();
      await this.roomEnvironment.initialize();
      await this.environmentEffects.initialize();
      await this.eventEmitter.initialize(eventService);
      await this.ambientMessageManager.initialize();
      logger.debug('EnvironmentSystem: Initializing EffectManager...');
      if (this.effectManager && typeof this.effectManager.initialize === 'function') {
        await this.effectManager.initialize();
        logger.info('EnvironmentSystem: EffectManager initialized successfully.');
      } else {
        logger.error('EnvironmentSystem: EffectManager does not have an initialize function.');
      }
      logger.debug('EnvironmentSystem: Initializing StateManager...');
      if (this.stateManager && typeof this.stateManager.initialize === 'function') {
        await this.stateManager.initialize();
        logger.info('EnvironmentSystem: StateManager initialized successfully.');
      } else {
        logger.error('EnvironmentSystem: StateManager does not have an initialize function.');
      }
      this.isInitialized = true;
      logger.info('EnvironmentSystem initialized successfully.');
    } catch (error) {
      logger.error('Failed to initialize EnvironmentSystem:', error);
      throw error;
    }
  }

  getTimeManager(): TimeManager {
    return this.timeManager;
  }

  getRoomEnvironment(): RoomEnvironment {
    return this.roomEnvironment;
  }

  getEnvironmentEffects(): EnvironmentEffects {
    return this.environmentEffects;
  }

  getEventEmitter(): EnvironmentEventEmitter {
    return this.eventEmitter;
  }

  getValidator(): EnvironmentValidator {
    return this.validator;
  }

  getAmbientMessageManager(): AmbientMessageManager {
    return this.ambientMessageManager;
  }

  getEffectManager(): EffectManager {
    return this.effectManager;
  }

  getStateManager(): EnvironmentStateManager {
    return this.stateManager;
  }

  isInitializedCheck(): boolean {
    return this.isInitialized;
  }

  async cleanup(): Promise<void> {
    logger.debug('Cleaning up EnvironmentSystem');
    await this.timeManager.cleanup();
    await this.roomEnvironment.cleanup();
    await this.environmentEffects.cleanup();
    await this.eventEmitter.cleanup();
    await this.ambientMessageManager.cleanup();
    await this.effectManager.cleanup();
    await this.stateManager.cleanup();
    this.isInitialized = false;
    logger.info('EnvironmentSystem cleanup complete.');
  }
}
