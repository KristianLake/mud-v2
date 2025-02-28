/**
 * Interface for event service
 */
export interface IEventService {
  /**
   * Subscribe to an event
   * @param eventName Name of the event
   * @param callback Function to call when event is emitted
   * @returns Function to unsubscribe
   */
  subscribe(eventName: string, callback: (data?: any) => void): () => void;
  
  /**
   * Unsubscribe from an event
   * @param eventName Name of the event
   * @param callback Function to remove
   */
  unsubscribe(eventName: string, callback: (data?: any) => void): void;
  
  /**
   * Emit an event
   * @param eventName Name of the event
   * @param data Optional data to pass to callbacks
   */
  emit(eventName: string, data?: any): void;
  
  /**
   * Register an event listener
   * @param eventName Name of the event
   * @param callback Function to call when event is emitted
   * @returns Function to remove the listener
   */
  on(eventName: string, callback: (data?: any) => void): () => void;
  
  /**
   * Remove an event listener
   * @param eventName Name of the event
   * @param callback Function to remove
   */
  off(eventName: string, callback: (data?: any) => void): void;
  
  /**
   * Register a one-time event listener
   * @param eventName Name of the event
   * @param callback Function to call when event is emitted
   * @```
   * Register a one-time event listener
   * @param eventName Name of the event
   * @param callback Function to call when event is emitted
   * @returns Function to remove the listener
   */
  once(eventName: string, callback: (data?: any) => void): () => void;
  
  /**
   * Get count of listeners for an event
   * @param eventName Name of the event
   * @returns Number of listeners
   */
  listenerCount(eventName: string): number;
  
  /**
   * Remove all listeners for an event
   * @param eventName Optional name of the event, if not provided, all events are cleared
   */
  removeAllListeners(eventName?: string): void;
}
