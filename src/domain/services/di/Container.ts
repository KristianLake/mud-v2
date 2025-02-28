import { logger } from '../../../utils/logger';
import { IContainer } from './IContainer';

/**
 * Type definition for a factory function
 * @param c Container instance for dependency resolution
 * @returns T The created instance
 */
export type Factory<T> = (c: IContainer) => T;

/**
 * Container for dependency injection
 * Manages service registration and resolution
 */
export class Container implements IContainer {
  private readonly factories: Map<Symbol, Factory<any>> = new Map();
  private readonly instances: Map<Symbol, any> = new Map();
  
  constructor() {
    logger.debug('DI Container created');
  }

  /**
   * Register a factory for a service
   * @param token Unique token for the service
   * @param factory Factory function to create the service
   */
  register<T>(token: Symbol, factory: Factory<T>): void {
    if (!token) {
      logger.warn('Attempted to register factory with undefined token');
      return;
    }
    
    this.factories.set(token, factory);
    logger.debug(`Registered factory for token: ${token.description || token.toString()}`);
  }

  /**
   * Resolve a service by token
   * @param token Token for the service
   * @returns Service instance
   */
  resolve<T>(token: Symbol): T {
    if (!token) {
      throw new Error('Cannot resolve service with undefined token');
    }
    
    // Check if already instantiated
    if (this.instances.has(token)) {
      return this.instances.get(token);
    }
    
    // Check if factory exists
    const factory = this.factories.get(token);
    if (!factory) {
      throw new Error(`No factory registered for token: ${token.description || token.toString()}`);
    }
    
    // Create instance and cache it
    const instance = factory(this);
    this.instances.set(token, instance);
    
    return instance;
  }

  /**
   * Check if a service is registered
   * @param token Token for the service
   * @returns True if registered, false otherwise
   */
  isRegistered(token: Symbol): boolean {
    return this.factories.has(token) || this.instances.has(token);
  }

  /**
   * Reset the container by clearing all instances
   * Factories are retained
   */
  reset(): void {
    this.instances.clear();
    logger.debug('DI Container reset - all instances cleared');
  }
}
