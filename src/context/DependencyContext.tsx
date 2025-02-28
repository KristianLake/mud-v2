import React, { createContext, useEffect, useState } from 'react';
import { Container } from '../domain/services/di/Container';
import { getContainer, initializeContainer } from '../domain/services/container';
import { logger } from '../utils/logger';

// Create context for dependency injection container
export const DependencyContext = createContext<Container | null>(null);

interface DependencyProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for dependency injection
 * Makes the DI container available to all child components
 */
export const DependencyProvider: React.FC<DependencyProviderProps> = ({ children }) => {
  const [container, setContainer] = useState<Container | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const setupContainer = async () => {
      try {
        logger.debug('Setting up DI container');
        
        // Get or initialize the container - using the singleton approach
        const initializedContainer = await initializeContainer();
        
        if (mounted) {
          setContainer(initializedContainer);
          setLoading(false);
        }
      } catch (err) {
        logger.error('Failed to initialize DI container', err);
        
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize container'));
          setLoading(false);
        }
      }
    };

    setupContainer();

    return () => {
      mounted = false;
      
      // We don't want to dispose the container on unmount anymore
      // since it's a singleton that might be used elsewhere
    };
  }, []);

  if (loading) {
    return <div>Loading game services...</div>;
  }

  if (error) {
    return (
      <div>
        <h2>Error initializing game</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <DependencyContext.Provider value={container}>
      {children}
    </DependencyContext.Provider>
  );
};
