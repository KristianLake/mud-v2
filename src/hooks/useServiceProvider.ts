import { useContext } from 'react';
import { DependencyContext } from '../context/DependencyContext';
import { logger } from '../utils/logger';
import { IContainer } from '../domain/services/di/IContainer';

/**
 * Hook for accessing the service provider
 * Provides a type-safe way to access services from the DI container
 */
export function useServiceProvider() {
  const container = useContext(DependencyContext);
  
  if (!container) {
    logger.error('useServiceProvider: DependencyContext not found');
    throw new Error('useServiceProvider must be used within a DependencyProvider');
  }
  
  /**
   * Get a service by token
   * @param token The service token
   * @returns The service instance
   */
  const getService = <T>(token: symbol): T => {
    if (!token) {
      logger.error('getService called with undefined token');
      throw new Error('Cannot resolve service with undefined token');
    }
    
    try {
      return container.resolve<T>(token);
    } catch (error) {
      logger.error(`Failed to resolve service: ${String(token)}`, error);
      throw new Error(`Service not available: ${String(token)}`);
    }
  };
  
  return { getService, container };
}
