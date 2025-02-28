import { IStateService } from './IStateService';
import { initialState } from '../../../data/initialState';
import { logger } from '../../../utils/logger';

/**
 * Implementation of the state service that manages game state
 */
export class LegacyStateService implements IStateService {
  private state: any;
  private subscribers: ((state: any) => void)[] = [];

  constructor() {
    this.state = null;
  }

  /**
   * Initialize the state with default values
   */
  async initialize(): Promise<void> {
    logger.debug('Initializing game state');
    try {
      // Clone the initial state to avoid mutations to the original object
      this.state = JSON.parse(JSON.stringify(initialState));
      
      // Notify subscribers of the new state
      this.notifySubscribers();
      
      logger.debug('Game state initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize game state', error);
      throw new Error('Failed to initialize game state');
    }
  }

  /**
   * Get the current state
   */
  getState(): any {
    return this.state;
  }

  /**
   * Update the state with new values
   */
  updateState(newState: Partial<any>): void {
    this.state = {
      ...this.state,
      ...newState
    };
    
    this.notifySubscribers();
  }

  /**
   * Subscribe to state changes
   * Returns a function to unsubscribe
   */
  subscribe(callback: (state: any) => void): () => void {
    this.subscribers.push(callback);
    
    // Immediately notify the new subscriber of the current state
    if (this.state) {
      callback(this.state);
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Reset the state to initial values
   */
  resetState(): void {
    this.state = JSON.parse(JSON.stringify(initialState));
    this.notifySubscribers();
  }

  /**
   * Notify all subscribers of state changes
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        logger.error('Error in state subscriber', error);
      }
    });
  }
}
