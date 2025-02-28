export interface IEventBus {
  /**
   * Emit an event to all subscribers
   */
  emit(eventType: string, payload: any): void;
  
  /**
   * Subscribe to a specific event type
   * Returns a function to unsubscribe
   */
  subscribe(eventType: string, callback: (payload: any) => void): () => void;
  
  /**
   * Subscribe to all events
   * Returns a function to unsubscribe
   */
  subscribeToAll(callback: (eventType: string, payload: any) => void): () => void;
}
