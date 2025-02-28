import { IContainer } from './IContainer';
import { ServiceTokens } from './ServiceTokens';
import { IStateService } from '../state/IStateService';
import { StateServiceFactory } from '../state/StateServiceFactory';
import { IEventService } from '../event/IEventService';
import { EventService } from '../event/EventService';
import { MessageService } from '../messaging/MessageService';
import { IMessageService } from '../messaging/IMessageService';
import { IEntityService } from '../entity/IEntityService';
import { EntityService } from '../entity/EntityService';
import { IMovementService } from '../movement/IMovementService';
import { MovementService } from '../movement/MovementService';
import { CommandRegistry } from '../command/CommandRegistry';
import { CommandService } from '../command/CommandService';
import { logger } from '../../../utils/logger';

/**
 * Factory for creating service instances
 * Follows Factory pattern to centralize service creation
 */
export class ServiceFactory {
  /**
   * Create a state service
   * @param eventService Optional event service for state events
   * @returns State service instance
   */
  static createStateService(eventService?: IEventService): IStateService {
    logger.debug('Creating state service');
    return StateServiceFactory.createStateService();
  }
  
  /**
   * Create an event service
   * @returns Event service instance
   */
  static createEventService(): IEventService {
    logger.debug('Creating event service');
    return new EventService();
  }
  
  /**
   * Create a message service
   * @returns Message service instance
   */
  static createMessageService(): IMessageService {
    logger.debug('Creating message service');
    return new MessageService();
  }
  
  /**
   * Create an entity service
   * @param stateService State service for entity data
   * @returns Entity service instance
   */
  static createEntityService(stateService: IStateService): IEntityService {
    logger.debug('Creating entity service');
    return new EntityService(stateService);
  }
  
  /**
   * Create a command registry
   * @returns Command registry instance
   */
  static createCommandRegistry(): CommandRegistry {
    logger.debug('Creating command registry');
    return new CommandRegistry();
  }
  
  /**
   * Create a command service
   * @param container DI container for resolving dependencies
   * @returns Command service instance
   */
  static createCommandService(container: IContainer): CommandService {
    logger.debug('Creating command service');
    const registry = container.resolve(ServiceTokens.CommandRegistry);
    const messageService = container.resolve(ServiceTokens.MessageService);
    const stateService = container.resolve(ServiceTokens.StateService);
    
    return new CommandService(registry, messageService, stateService);
  }
  
  /**
   * Create a movement service
   * @param container DI container for resolving dependencies
   * @returns Movement service instance
   */
  static createMovementService(container: IContainer): IMovementService {
    logger.debug('Creating movement service');
    const stateService = container.resolve(ServiceTokens.StateService);
    const entityService = container.resolve(ServiceTokens.EntityService);
    const eventService = container.resolve(ServiceTokens.EventService);
    const messageService = container.resolve(ServiceTokens.MessageService);
    
    return new MovementService(stateService, entityService, eventService, messageService);
  }
}
