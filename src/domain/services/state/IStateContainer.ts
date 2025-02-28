/**
 * Interface for state container
 */
export interface IStateContainer<T> {
  /**
   * Get the current state
   */
  getState(): T;
  
  /**
   * Set a new state
   * @param newState New state to set
   */
  setState(newState: T): void;
  
  /**
   * Reset state to initial value
   */
  reset(): void;
  
  /**
   * Create a deep clone of the current state
   */
  cloneState(): T;
}
