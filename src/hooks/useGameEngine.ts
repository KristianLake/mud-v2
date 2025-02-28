import { useMemo } from 'react';
import { useServiceProvider } from './useServiceProvider';
import { ServiceTokens } from '../domain/services/di/ServiceTokens';
import { IStateService } from '../domain/services/state/IStateService';
import { IMovementService } from '../domain/services/movement/IMovementService';
import { IEntityService } from '../domain/services/entity/IEntityService';
import { IEventService } from '../domain/services/event/IEventService';
import { IMessageService } from '../domain/services/messaging/IMessageService';
import { logger } from '../utils/logger';

/**
 * Hook for accessing game engine services
 * Uses dependency injection to provide access to services
 */
export const useGameEngine = () => {
  const { getService } = useServiceProvider();
  
  // Resolve services through DI container
  const services = useMemo(() => {
    logger.debug('Resolving game engine services');
    
    return {
      stateService: getService<IStateService>(ServiceTokens.StateService),
      movementService: getService<IMovementService>(ServiceTokens.MovementService),
      entityService: getService<IEntityService>(ServiceTokens.EntityService),
      eventService: getService<IEventService>(ServiceTokens.EventService),
      messageService: getService<IMessageService>(ServiceTokens.MessageService)
    };
  }, [getService]);
  
  return services;
};
