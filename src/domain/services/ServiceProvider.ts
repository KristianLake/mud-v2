import { Container } from './di/Container';
import { ServiceTokens } from './di/ServiceTokens';
import { IEventService } from './event/IEventService';
import { IStateService } from './state/IStateService';
import { ICommandService } from './command/ICommandService';
import { IEnvironmentService } from './environment/IEnvironmentService';
import { IMessageService } from './messaging/IMessageService';
import { IGameEngine } from '../core/IGameEngine';
import { logger } from '../../utils/logger';

/**
 * ServiceProvider as a facade to access the DI container
 * Following the Facade Pattern to simplify service access
 */
export class ServiceProvider {
  private container: Container;
  
  constructor() {
    this.container = Container.getInstance();
    logger.debug('ServiceProvider created');
  }

  /**
   * Get the event service
   */
  getEventService(): IEventService {
    return this.container.resolve<IEventService>(ServiceTokens.EventService);
  }

  /**
   * Get the state service
   */
  getStateService(): IStateService {
    return this.container.resolve<IStateService>(ServiceTokens.StateService);
  }

  /**
   * Get the command service
   */
  getCommandService(): ICommandService {
    return this.container.resolve<ICommandService>(ServiceTokens.CommandService);
  }

  /**
   * Get the environment service
   */
  getEnvironmentService(): IEnvironmentService {
    return this.container.resolve<IEnvironmentService>(ServiceTokens.EnvironmentService);
  }

  /**
   * Get the message service
   */
  getMessageService(): IMessageService {
    return this.container.resolve<IMessageService>(ServiceTokens.MessageService);
  }

  /**
   * Get the game engine
   */
  getGameEngine(): IGameEngine {
    return this.container.resolve<IGameEngine>(ServiceTokens.GameEngine);
  }

  /**
   * Check if a service is available
   * @param token Service token to check
   */
  hasService(token: symbol): boolean {
    return this.container.has(token);
  }
}
