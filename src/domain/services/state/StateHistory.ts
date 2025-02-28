import { logger } from '../../../utils/logger';

/**
 * Manages state history for undo/redo functionality
 */
export class StateHistory {
  private states: any[] = [];
  private currentIndex: number = -1;
  private maxHistory: number = 20; // Limit history size
  
  constructor() {
    logger.debug('StateHistory initialized');
  }
  
  /**
   * Add a state to history
   * @param state State to add
   */
  addState(state: any): void {
    // Clone the state to prevent mutations
    const stateCopy = this.cloneState(state);
    
    // If we're not at the end of history, remove future states
    if (this.currentIndex < this.states.length - 1) {
      this.states = this.states.slice(0, this.currentIndex + 1);
    }
    
    // Add new state
    this.states.push(stateCopy);
    this.currentIndex = this.states.length - 1;
    
    // Enforce history size limit
    if (this.states.length > this.maxHistory) {
      this.states.shift();
      this.currentIndex--;
    }
    
    logger.debug('Added state to history', { 
      historySize: this.states.length,
      currentIndex: this.currentIndex
    });
  }
  
  /**
   * Get a state from history by index
   * @param index Index of state to get
   * @returns State at index or null if out of bounds
   */
  getState(index: number): any | null {
    if (index < 0 || index >= this.states.length) {
      return null;
    }
    
    return this.cloneState(this.states[index]);
  }
  
  /**
   * Get the current state
   * @returns Current state or null if history is empty
   */
  getCurrentState(): any | null {
    return this.getState(this.currentIndex);
  }
  
  /**
   * Get the previous state (for undo)
   * @returns Previous state or null if at beginning of history
   */
  undo(): any | null {
    if (this.currentIndex <= 0) {
      logger.debug('Cannot undo: at beginning of history');
      return null;
    }
    
    this.currentIndex--;
    logger.debug('Undo: moved back in history', { 
      currentIndex: this.currentIndex 
    });
    
    return this.getCurrentState();
  }
  
  /**
   * Get the next state (for redo)
   * @returns Next state or null if at end of history
   */
  redo(): any | null {
    if (this.currentIndex >= this.states.length - 1) {
      logger.debug('Cannot redo: at end of history');
      return null;
    }
    
    this.currentIndex++;
    logger.debug('Redo: moved forward in history', { 
      currentIndex: this.currentIndex 
    });
    
    return this.getCurrentState();
  }
  
  /**
   * Get the size of the history
   * @returns Number of states in history
   */
  getHistorySize(): number {
    return this.states.length;
  }
  
  /**
   * Clear the history
   */
  clear(): void {
    this.states = [];
    this.currentIndex = -1;
    logger.debug('Cleared state history');
  }
  
  /**
   * Deep clone a state object
   * @param state State to clone
   * @returns Cloned state
   */
  private cloneState(state: any): any {
    return JSON.parse(JSON.stringify(state));
  }
}
