import { Container } from './Container';
import { ServiceTokens } from './ServiceTokens';
import { EntityService } from '../entity/EntityService';
import { CommandRegistry } from '../command/CommandRegistry';
import { CommandService } from '../command/CommandService';
import { MovementService } from '../movement/MovementService';
import { logger } from '../../../utils/logger';

/**
 * Register services with dependency injection container
 * @param container DI container
 */
export function registerServices(container: Container): void {
  logger.debug('Registering services with container');
  
  // Entity service
  container.register(ServiceTokens.EntityService, () => {
    return new EntityService();
  });
  logger.debug('Registered EntityService');
  
  // Command registry and service
  const commandRegistry = new CommandRegistry();
  container.register(ServiceTokens.CommandRegistry, () => commandRegistry);
  logger.debug('Registered CommandRegistry');
  
  // Command service
  container.register(ServiceTokens.CommandService, (c) => {
    const stateService = c.resolve(ServiceTokens.StateService);
    const messageService = c.resolve(ServiceTokens.MessageService);
    return new CommandService(commandRegistry, stateService, messageService);
  });
  logger.debug('Registered CommandService');
  
  // Movement service
  container.register(ServiceTokens.MovementService, (c) => {
    const stateService = c.resolve(ServiceTokens.StateService);
    const messageService = c.resolve(ServiceTokens.MessageService);
    return new MovementService(stateService, messageService);
  });
  logger.debug('Registered MovementService');
  
  // Count registered services
  const tokens = Object.values(ServiceTokens);
  let count = 0;
  
  tokens.forEach(token => {
    if (container.isRegistered(token)) {
      count++;
    }
  });
  
  logger.debug(`Total services registered: ${count}`);
}
