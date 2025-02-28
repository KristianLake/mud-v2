import { logger } from '../../../utils/logger';

/**
 * Handles persistence of state to local storage
 */
export class StatePersistence<T = any> {
  private storageKey: string = 'game_state';
  
  constructor(storageKey?: string) {
    if (storageKey) {
      this.storageKey = storageKey;
    }
    logger.debug('StatePersistence initialized', { storageKey: this.storageKey });
  }
  
  /**
   * Save state to local storage
   * @param state State to save
   */
  saveState(state: T): void {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem(this.storageKey, serializedState);
      logger.debug('State saved to local storage', { storageKey: this.storageKey });
    } catch (error) {
      logger.error('Failed to save state to local storage', error);
    }
  }
  
  /**
   * Load state from local storage
   * @returns Loaded state or null if not found
   */
  loadState(): T | null {
    try {
      const serializedState = localStorage.getItem(this.storageKey);
      
      if (!serializedState) {
        logger.debug('No saved state found in local storage', { storageKey: this.storageKey });
        return null;
      }
      
      const state = JSON.parse(serializedState) as T;
      logger.debug('State loaded from local storage', { storageKey: this.storageKey });
      
      return state;
    } catch (error) {
      logger.error('Failed to load state from local storage', error);
      return null;
    }
  }
  
  /**
   * Clear saved state from local storage
   */
  clearState(): void {
    try {
      localStorage.removeItem(this.storageKey);
      logger.debug('Cleared saved state from local storage', { storageKey: this.storageKey });
    } catch (error) {
      logger.error('Failed to clear state from local storage', error);
    }
  }
  
  /**
   * Check if state exists in local storage
   * @returns True if state exists
   */
  hasState(): boolean {
    return localStorage.getItem(this.storageKey) !== null;
  }
}
