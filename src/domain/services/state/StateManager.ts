import { IStateManager } from './IStateManager';
import { IStateContainer } from './IStateContainer';
import { IStateValidator } from './IStateValidator';
import { StateChangeListener } from './types';
import { logger } from '../../../utils/logger';

/**
 * Manages state and notifies listeners of changes
 * Implements IStateManager interface
 * Single Responsibility: Coordinate state operations and notify listeners
 */
export class StateManager<T = any> implements IStateManager<T> {
  private listeners: StateChangeListener<T>[] = [];
  
  constructor(
    private stateContainer: IStateContainer<T>,
    private stateValidator: IStateValidator<T>
  ) {
    logger.debug('StateManager initialized');
  }
  
  /**
   * Get the current state
   */
  getState(): T {
    return this.stateContainer.getState();
  }
  
  /**
   * Update state with a partial state object
   * @param partialState Partial state to merge
   */
  updateState(partialState: Partial<T>): void {
    const currentState = this.stateContainer.getState();
    const newState = this.mergeState(currentState, partialState);
    
    // Validate state change
    if (this.stateValidator && !this.stateValidator.isValidChange(currentState, newState)) {
      const errors = this.stateValidator.getValidationErrors(newState);
      logger.error('Invalid state change', { errors });
      throw new Error(`Invalid state change: ${errors.join(', ')}`);
    }
    
    // Update state
    this.stateContainer.setState(newState);
    
    // Notify listeners
    this.notifyListeners(newState);
    
    logger.debug('State updated', { 
      changedKeys: Object.keys(partialState),
      listenerCount: this.listeners.length
    });
  }
  
  /**
   * Replace the entire state
   * @param newState New state
   */
  setState(newState: T): void {
    const currentState = this.stateContainer.getState();
    
    // Validate state change
    if (this.stateValidator && !this.stateValidator.isValidChange(currentState, newState)) {
      const errors = this.stateValidator.getValidationErrors(newState);
      logger.error('Invalid state change', { errors });
      throw new Error(`Invalid state change: ${errors.join(', ')}`);
        }
    
    // Update state
    this.stateContainer.setState(newState);
    
    // Notify listeners
    this.notifyListeners(newState);
    
    logger.debug('State replaced');
  }
  
  /**
   * Reset state to initial value
   */
  resetState(): void {
    this.stateContainer.reset();
    
    // Notify listeners
    const newState = this.stateContainer.getState();
    this.notifyListeners(newState);
    
    logger.debug('State reset to initial value');
  }
  
  /**
   * Add a state change listener
   * @param listener Function to call when state changes
   * @returns Function to remove the listener
   */
  addListener(listener: StateChangeListener<T>): () => void {
    this.listeners.push(listener);
    
    logger.debug('Added state listener', { 
      listenerCount: this.listeners.length 
    });
    
    // Return function to remove the listener
    return () => {
      this.removeListener(listener);
    };
  }
  
  /**
   * Remove a state change listener
   * @param listener Listener to remove
   */
  removeListener(listener: StateChangeListener<T>): void {
    const index = this.listeners.indexOf(listener);
    
    if (index !== -1) {
      this.listeners.splice(index, 1);
      logger.debug('Removed state listener', { 
        listenerCount: this.listeners.length 
      });
    }
  }
  
  /**
   * Get a snapshot of the current state
   */
  getSnapshot(): T {
    return this.stateContainer.cloneState();
  }
  
  /**
   * Notify all listeners of state change
   * @param state Current state
   */
  private notifyListeners(state: T): void {
    if (this.listeners.length === 0) {
      return;
    }
    
    const stateCopy = this.stateContainer.cloneState();
    
    // Call all listeners with state copy
    this.listeners.forEach(listener => {
      try {
        listener(stateCopy);
      } catch (error) {
        logger.error('Error in state change listener', error);
      }
    });
  }
  
  /**
   * Merge partial state with current state
   * @param currentState Current state
   * @param partialState Partial state to merge
   * @returns New state
   */
  private mergeState(currentState: T, partialState: Partial<T>): T {
    if (typeof currentState !== 'object' || currentState === null) {
      return partialState as T;
    }
    
    const result = { ...currentState } as any;
    
    // Merge top-level properties
    for (const key in partialState) {
      if (Object.prototype.hasOwnProperty.call(partialState, key)) {
        const value = partialState[key];
        
        // Deep merge for objects that aren't arrays
        if (
          key in currentState &&
          typeof currentState[key] === 'object' &&
          typeof value === 'object' &&
          !Array.isArray(currentState[key]) &&
          !Array.isArray(value) &&
          value !== null &&
          currentState[key] !== null
        ) {
          result[key] = this.mergeState(currentState[key], value);
        } else {
          // Simple assignment for non-objects or arrays
          result[key] = value;
        }
      }
    }
    
    return result;
  }
}
