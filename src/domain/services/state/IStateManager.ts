import { StateChangeListener } from './types';

/**
 * Interface for state manager
 */
export interface IStateManager<T> {
  /**
   * Get the current state
   */
  getState(): T;
  
  /**
   * Update state with a partial state object
   * @param partialState Partial state to merge
   */
  updateState(partialState: Partial<T>): void;
  
  /**
   * Replace the entire state
   * @param newState New state
   */
  setState(newState: T): void;
  
  /**
   * Reset state to initial value
   */
  resetState(): void;
  
  /**
   * Add a state change listener
   * @param listener Function to call when state changes
   * @returns Function to remove the listener
   */
  addListener(listener: StateChangeListener<T>): () => void;
  
  /**
   * Remove a state change listener
   * @param listener Listener to remove
   */
  removeListener(listener: StateChangeListener<T>): void;
  
  /**
   * Get a snapshot of the current state
   */
  getSnapshot(): T;
}
