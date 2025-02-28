import { GameState } from '../../../types';
import { IStateService } from './IStateService';
import { IStateValidator } from './IStateValidator';
import { GameStateFactory } from '../../core/GameStateFactory';
import { GameStateHistory } from '../../core/GameStateHistory';
import { logger } from '../../../utils/logger';

/**
 * Service for managing game state
 * Single Responsibility: Manage game state
 */
export class StateService implements IStateService {
  private state: GameState;
  private history: GameStateHistory;
  private validator: IStateValidator;
  private listeners: ((state: GameState) => void)[] = [];

  /**
   * Create a new state service
   * @param validator Validator for state changes
   * @param initialState Optional initial state
   */
  constructor(validator: IStateValidator, initialState?: GameState) {
    this.validator = validator;
    this.history = new GameStateHistory();
    
    // Initialize state
    try {
      if (initialState) {
        const errors = this.validator.getValidationErrors(initialState);
        if (errors.length > 0) {
          logger.error('Invalid initial state provided', { errors });
          throw new Error(`Invalid initial state: ${errors.join(', ')}`);
        }
        this.state = JSON.parse(JSON.stringify(initialState));
      } else {
        this.state = GameStateFactory.createInitialState();
      }
      
      // Add initial state to history
      this.history.addSnapshot(this.state);
      
    } catch (error) {
      logger.error('Failed to initialize state service', { error });
      throw new Error(`Failed to initialize state service: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get the current state
   * @returns Deep copy of current state
   */
  getState(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Update the state using an updater function
   * @param updater Function that takes current state and returns new state
   * @returns Updated state
   */
  updateState(updater: (state: GameState) => GameState): GameState {
    try {
      // Create a deep copy of current state for the updater
      const stateCopy = JSON.parse(JSON.stringify(this.state));
      
      // Get new state from updater
      const newState = updater(stateCopy);
      
      // Validate the new state
      const errors = this.validator.getValidationErrors(newState);
      if (errors.length > 0) {
        logger.error('Invalid state update', { errors });
        throw new Error(`Invalid state update: ${errors.join(', ')}`);
      }
      
      // Update state and notify listeners
      this.state = newState;
      this.history.addSnapshot(this.state);
      this.notifyListeners();
      
      return this.getState();
      
    } catch (error) {
      logger.error('Error updating state', { error });
      throw new Error(`Error updating state: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Set the state directly
   * @param newState New state to set
   * @returns The new state
   */
  setState(newState: GameState): GameState {
    try {
      // Validate the new state
      const errors = this.validator.getValidationErrors(newState);
      if (errors.length > 0) {
        logger.error('Invalid state', { errors });
        throw new Error(`Invalid state: ${errors.join(', ')}`);
      }
      
      // Update state and notify listeners
      this.state = JSON.parse(JSON.stringify(newState));
      this.history.addSnapshot(this.state);
      this.notifyListeners();
      
      return this.getState();
      
    } catch (error) {
      logger.error('Error setting state', { error });
      throw new Error(`Error setting state: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Reset the state to initial
   * @returns The initial state
   */
  resetState(): GameState {
    try {
      // Get fresh initial state
      this.state = GameStateFactory.createInitialState();
      this.history.clear();
      this.history.addSnapshot(this.state);
      this.notifyListeners();
      
      return this.getState();
      
    } catch (error) {
      logger.error('Error resetting state', { error });
      throw new Error(`Error resetting state: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Subscribe to state changes
   * @param listener Function to call when state changes
   * @returns Unsubscribe function
   */
  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const stateCopy = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(stateCopy);
      } catch (error) {
        logger.error('Error in state listener', { error });
      }
    }
  }

  /**
   * Undo the last state change
   * @returns The previous state or null if at beginning of history
   */
  undo(): GameState | null {
    const previousState = this.history.undo();
    if (previousState) {
      this.state = previousState;
      this.notifyListeners();
      return this.getState();
    }
    return null;
  }

  /**
   * Redo a previously undone state change
   * @returns The next state or null if at end of history
   */
  redo(): GameState | null {
    const nextState = this.history.redo();
    if (nextState) {
      this.state = nextState;
      this.notifyListeners();
      return this.getState();
    }
    return null;
  }

  /**
   * Check if undo is available
   * @returns True if undo is available
   */
  canUndo(): boolean {
    return this.history.canUndo();
  }

  /**
   * Check if redo is available
   * @returns True if redo is available
   */
  canRedo(): boolean {
    return this.history.canRedo();
  }
}
