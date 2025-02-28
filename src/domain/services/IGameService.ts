/**
 * Base interface for all game services
 * Defines common methods that every service should implement
 */
export interface IGameService {
  /**
   * Unique identifier for the service instance
   */
  readonly serviceId: string;
  
  /**
   * Initialize the service
   * @returns Promise that resolves when initialization is complete
   */
  initialize(): Promise<void>;
  
  /**
   * Check if the service is initialized
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean;
  
  /**
   * Reset the service to its initial state
   * @returns Promise that resolves when reset is complete
   */
  reset(): Promise<void>;
}
