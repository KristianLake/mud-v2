import { IEventBus } from './IEventBus';
import { logger } from '../../../utils/logger';

/**
 * Simple event bus implementation
 */
export class EventBus implements IEventBus {
  private subscribers: Map<string, Array<(payload: any) => void>> = new Map();
  private allEventSubscribers: Array<(eventType: string, payload: any) => void> = [];

  /**
   * Emit an event to all subscribers
   */
  emit(eventType: string, payload: any): void {
    logger.debug(`Event emitted: ${eventType}`);
    
    // Notify type-specific subscribers
    const handlers = this.subscribers.get(eventType) || [];
    handlers.forEach(handler => {
      try {
        handler(payload);
      } catch (error) {
        logger.error(`Error in event handler for ${eventType}`, error);
      }
    });

    // Notify subscribers to all events
    this.allEventSubscribers.forEach(handler => {
      try {
        handler(eventType, payload);
      } catch (error) {
        logger.error(`Error in global event handler for ${eventType}`, error);
      }
    });
  }

  /**
   * Subscribe to a specific event type
   * Returns a function to unsubscribe
   */
  subscribe(eventType: string, callback: (payload: any) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    
    this.subscribers.get(eventType)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.subscribers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(callback);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to all events
   * Returns a function to unsubscribe
   */
  subscribeToAll(callback: (eventType: string, payload: any) => void): () => void {
    this.allEventSubscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.allEventSubscribers.indexOf(callback);
      if (index !== -1) {
        this.allEventSubscribers.splice(index, 1);
      }
    };
  }
}
