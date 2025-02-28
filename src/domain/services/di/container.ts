import { Container } from './Container';
import { ServiceTokens } from './ServiceTokens';
import { GameStateValidator } from '../state/GameStateValidator';
import { StateServiceFactory } from '../state/StateServiceFactory';
import { ServiceFactory } from './ServiceFactory';
import { registerServices } from './ServiceProvider';
import { logger } from '../../../utils/logger';

/**
 * Configure the dependency injection container
 * @returns Configured container
 */
export function configureContainer(): Container {
  logger.debug('Configuring dependency injection container');
  
  const container = new Container();
  
  // Register validators
  container.register(ServiceTokens.StateValidator, () => new GameStateValidator());
  
  // Register factories
  container.register(ServiceTokens.StateServiceFactory, () => StateServiceFactory);
  
  // Register core services
  container.register(ServiceTokens.StateService, (c) => {
    const validator = c.resolve(ServiceTokens.StateValidator);
    return StateServiceFactory.createStateServiceWithValidator(validator);
  });
  
  // Register message service (crucial for game initialization)
  container.register(ServiceTokens.MessageService, () => {
    return ServiceFactory.createMessageService();
  });
  
  // Register event service
  container.register(ServiceTokens.EventService, () => {
    return ServiceFactory.createEventService();
  });
  
  // Register remaining services
  registerServices(container);
  
  logger.debug('Container configured successfully');
  return container;
}

// Export a singleton container instance
// Using a module-level variable ensures we have only one container instance
let containerInstance: Container | null = null;

export const container = (() => {
  if (!containerInstance) {
    containerInstance = configureContainer();
  }
  return containerInstance;
})();
