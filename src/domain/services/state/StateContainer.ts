import { IStateContainer } from './IStateContainer';
import { logger } from '../../../utils/logger';

/**
 * Container for state data
 * Implements IStateContainer interface
 * Single Responsibility: Store and manage raw state data
 */
export class StateContainer<T> implements IStateContainer<T> {
  private state: T;
  private initialState: T;
  
  constructor(initialState: T) {
    this.state = this.cloneObject(initialState);
    this.initialState = this.cloneObject(initialState);
    logger.debug('StateContainer initialized');
  }
  
  /**
   * Get the current state
   */
  getState(): T {
    return this.state;
  }
  
  /**
   * Set a new state
   * @param newState New state to set
   */
  setState(newState: T): void {
    this.state = this.cloneObject(newState);
  }
  
  /**
   * Reset state to initial value
   */
  reset(): void {
    this.state = this.cloneObject(this.initialState);
    logger.debug('State container reset to initial state');
  }
  
  /**
   * Create a deep clone of the current state
   */
  cloneState(): T {
    return this.cloneObject(this.state);
  }
  
  /**
   * Create a deep clone of an object
   * @param obj Object to clone
   */
  private cloneObject<U>(obj: U): U {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cloneObject(item)) as unknown as U;
    }
    
    const clone = {} as U;
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clone[key] = this.cloneObject(obj[key]);
      }
    }
    
    return clone;
  }
}
