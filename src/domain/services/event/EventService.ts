import { IEventService } from './IEventService';
import { logger } from '../../../utils/logger';

type EventCallback = (data?: any) => void;

/**
 * Service for event management
 * Implements IEventService interface
 */
export class EventService implements IEventService {
  private eventListeners: Map<string, EventCallback[]> = new Map();
  
  constructor() {
    logger.debug('EventService initialized');
  }
  
  /**
   * Subscribe to an event
   * @param eventName Name of the event
   * @param callback Function to call when event is emitted
   * @returns Function to unsubscribe
   */
  subscribe(eventName: string, callback: (data?: any) => void): () => void {
    if (!eventName) {
      logger.warn('Attempted to subscribe to event with empty name');
      return () => {};
    }
    
    // Get or create listeners array for this event
    const listeners = this.eventListeners.get(eventName) || [];
    
    // Add callback to listeners
    listeners.push(callback);
    
    // Update listeners in map
    this.eventListeners.set(eventName, listeners);
    
    logger.debug(`Subscribed to event: ${eventName}`, { 
      listenerCount: listeners.length 
    });
    
    // Return unsubscribe function
    return () => {
      this.unsubscribe(eventName, callback);
    };
  }
  
  /**
   * Unsubscribe from an event
   * @param eventName Name of the event
   * @param callback Function to remove
   */
  unsubscribe(eventName: string, callback: (data?: any) => void): void {
    if (!eventName) {
      logger.warn('Attempted to unsubscribe from event with empty name');
      return;
    }
    
    // Get listeners array for this event
    const listeners = this.eventListeners.get(eventName);
    
    if (!listeners) {
      return;
    }
    
    // Remove callback from listeners
    const index = listeners.indexOf(callback);
    
    if (index !== -1) {
      listeners.splice(index, 1);
      
      // Update listeners in map
      if (listeners.length === 0) {
        this.eventListeners.delete(eventName);
      } else {
        this.eventListeners.set(eventName, listeners);
      }
      
      logger.debug(`Unsubscribed from event: ${eventName}`, { 
        listenerCount: listeners.length 
      });
    }
  }
  
  /**
   * Emit an event
   * @param eventName Name of the event
   * @param data Optional data to pass to callbacks
   */
  emit(eventName: string, data?: any): void {
    if (!eventName) {
      logger.warn('Attempted to emit event with empty name');
      return;
    }
    
    // Get listeners array for this event
    const listeners = this.eventListeners.get(eventName);
    
    if (!listeners || listeners.length === 0) {
      return;
    }
    
    // Call all listeners
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        logger.error(`Error in event listener for ${eventName}`, error);
      }
    });
    
    logger.debug(`Emitted event: ${eventName}`, { 
      listenerCount: listeners.length 
    });
  }
  
  /**
   * Register an event listener
   * @param eventName Name of the event
   * @param callback Function to call when event is emitted
   * @returns Function to remove the listener
   */
  on(eventName: string, callback: (data?: any) => void): () => void {
    return this.subscribe(eventName, callback);
  }
  
  /**
   * Remove an event listener
   * @param eventName Name of the event
   * @param callback Function to remove
   */
  off(eventName: string, callback: (data?: any) => void): void {
    this.unsubscribe(eventName, callback);
  }
  
  /**
   * Register a one-time event listener
   * @param eventName Name of the event
   * @param callback Function to call when event is emitted
   * @returns Function to remove the listener
   */
  once(eventName: string, callback: (data?: any) => void): () => void {
    // Create a wrapper that will call the callback and then unsubscribe
    const onceWrapper = (data?: any) => {
      // Unsubscribe first to prevent infinite loops if callback emits same event
      unsubscribe();
      callback(data);
    };
    
    // Subscribe with the wrapper
    const unsubscribe = this.subscribe(eventName, onceWrapper);
    
    return unsubscribe;
  }
  
  /**
   * Get count of listeners for an event
   * @param eventName Name of the event
   * @returns Number of listeners
   */
  listenerCount(eventName: string): number {
    const listeners = this.eventListeners.get(eventName);
    return listeners ? listeners.length : 0;
  }
  
  /**
   * Remove all listeners for an event
   * @param eventName Optional name of the event, if not provided, all events are cleared
   */
  removeAllListeners(eventName?: string): void {
    if (eventName) {
      this.eventListeners.delete(eventName);
      logger.debug(`Removed all listeners for event: ${eventName}`);
    } else {
      this.eventListeners.clear();
      logger.debug('Removed all event listeners');
    }
  }
}
