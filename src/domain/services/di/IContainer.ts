/**
 * Interface for dependency injection container
 */
export interface IContainer {
  /**
   * Initialize the container and all registered services
   */
  initialize(): Promise<void>;
  
  /**
   * Check if the container has been initialized
   */
  isInitialized(): boolean;
  
  /**
   * Register a factory function for a service
   * @param token Symbol identifying the service
   * @param factory Factory function that creates the service
   */
  registerFactory<T>(token: symbol, factory: (container: IContainer) => T): void;
  
  /**
   * Register an instance directly
   * @param token Symbol identifying the service
   * @param instance The service instance
   */
  registerInstance<T>(token: symbol, instance: T): void;
  
  /**
   * Register either a factory or an instance
   * @param token Symbol identifying the service
   * @param factoryOrInstance Factory function or instance
   */
  register<T>(token: symbol, factoryOrInstance: ((container: IContainer) => T) | T): void;
  
  /**
   * Resolve a service by its token
   * @param token Symbol identifying the service
   * @returns The service instance
   */
  resolve<T>(token: symbol): T;
  
  /**
   * Check if a service is registered
   * @param token Symbol identifying the service
   * @returns True if the service is registered
   */
  has(token: symbol): boolean;
  
  /**
   * Check if a service is registered
   * @param token Symbol identifying the service
   * @returns True if the service is registered
   */
  isRegistered(token: symbol): boolean;
  
  /**
   * Get the number of registered services
   * @returns Number of registered services
   */
  getRegistrationCount(): number;
  
  /**
   * Dispose the container and all services
   */
  dispose(): Promise<void>;
}
