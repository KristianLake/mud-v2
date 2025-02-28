import { Container } from './di/Container';
import { registerServices } from './di/ServiceProvider';
import { logger } from '../../utils/logger';

let containerInstance: Container | null = null;

/**
 * Get the singleton container instance
 * Creates and initializes it if it doesn't exist
 */
export async function getContainer(): Promise<Container> {
  if (!containerInstance) {
    containerInstance = Container.getInstance();
    
    // Register all services
    registerServices(containerInstance);
    
    // Initialize the container if not already initialized
    if (!containerInstance.isInitialized()) {
      await containerInstance.initialize();
    }
  }
  
  return containerInstance;
}

/**
 * Initialize the container
 * This ensures all services are registered and initialized
 */
export async function initializeContainer(): Promise<Container> {
  try {
    logger.debug('Initializing container');
    const container = await getContainer();
    return container;
  } catch (error) {
    logger.error('Failed to initialize container', error);
    throw error;
  }
}

/**
 * Reset the container
 * Useful for testing or restarting the application
 */
export async function resetContainer(): Promise<void> {
  if (containerInstance) {
    await containerInstance.dispose();
    containerInstance = null;
  }
}
