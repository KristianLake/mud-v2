import { GameState } from '../../../types';

/**
 * Interface for state services
 * Interface Segregation Principle: Focused interface for state management
 */
export interface IStateService {
  /**
   * Get the current state
   * @returns Current game state
   */
  getState(): GameState;
  
  /**
   * Update the state
   * @param updater Function that takes current state and returns new state
   * @returns Updated state
   */
  updateState(updater: (state: GameState) => GameState): GameState;
  
  /**
   * Set the state directly
   * @param newState New state to set
   * @returns The new state
   */
  setState(newState: GameState): GameState;
  
  /**
   * Reset the state to initial
   * @returns The initial state
   */
  resetState(): GameState;
  
  /**
   * Subscribe to state changes
   * @param listener Function to call when state changes
   * @returns Unsubscribe function
   */
  subscribe(listener: (state: GameState) => void): () => void;
}

/**
 * Extended state service with history capabilities
 */
export interface IStateServiceWithHistory extends IStateService {
  /**
   * Undo the last state change
   * @returns The previous state or null if at beginning of history
   */
  undo(): GameState | null;
  
  /**
   * Redo a previously undone state change
   * @returns The next state or null if at end of history
   */
  redo(): GameState | null;
  
  /**
   * Check if undo is available
   * @returns True if undo is available
   */
  canUndo(): boolean;
  
  /**
   * Check if redo is available
   * @returns True if redo is available
   */
  canRedo(): boolean;
}
