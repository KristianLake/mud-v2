import { useContext } from 'react';
import { DependencyContext } from '../context/DependencyContext';
import { ServiceTokens } from '../domain/services/di/ServiceTokens';
import { IEntityService } from '../domain/services/entity/IEntityService';
import { logger } from '../utils/logger';

/**
 * Hook for accessing the entity service
 * Follows the Custom Hook pattern for React
 */
export function useEntityService(): IEntityService {
  const container = useContext(DependencyContext);
  
  if (!container) {
    logger.error('useEntityService: DependencyContext not found');
    throw new Error('useEntityService must be used within a DependencyProvider');
  }
  
  try {
    return container.resolve<IEntityService>(ServiceTokens.EntityService);
  } catch (error) {
    logger.error('Failed to resolve EntityService', error);
    throw new Error('EntityService not available');
  }
}
