import { GameState } from '../../../types';
import { IGameStateService } from '../IGameMasterService';
import { StateService } from './StateService';
import { IStateValidator } from './IStateValidator';
import { logger } from '../../../utils/logger';

/**
 * Service responsible for state management only
 * Single Responsibility: Manage game state
 */
export class GameStateService implements IGameStateService {
  private stateService: StateService<GameState>;
  private initialized: boolean = false;

  constructor(
    private readonly validator: IStateValidator,
    private readonly initialState: GameState
  ) {
    logger.debug('GameStateService constructor called', {
      hasValidator: !!validator,
      hasInitialState: !!initialState,
      initialStateKeys: initialState ? Object.keys(initialState) : []
    });

    if (!validator) {
      throw new Error('Validator cannot be null or undefined');
    }
    if (!initialState) {
      throw new Error('Initial state cannot be null or undefined');
    }

    // Create state service with validated state
    this.stateService = new StateService<GameState>(initialState, validator);
    this.initialized = true;

    logger.info('GameStateService constructed', {
      hasValidator: !!validator,
      hasInitialState: !!initialState
    });
  }

  async initialize(): Promise<void> {
    logger.debug('GameStateService.initialize called', {
      isInitialized: this.initialized
    });

    if (this.initialized) {
      return;
    }

    try {
      this.initialized = true;

      logger.info('GameStateService initialized', {
        location: this.initialState.playerLocation,
        health: this.initialState.playerHealth,
        gold: this.initialState.playerGold
      });
    } catch (error) {
      logger.error('Failed to initialize GameStateService:', error);
      throw error;
    }
  }

  getState(): GameState {
    this.ensureInitialized();
    return this.stateService.getState();
  }

  setState(newState: GameState): void {
    this.ensureInitialized();
    this.stateService.setState(newState);
    logger.debug('State updated successfully');
  }

  updateState(partialState: Partial<GameState>): void {
    this.ensureInitialized();
    this.stateService.updateState(partialState);
    logger.debug('State partially updated', { partialState });
  }

  addListener(listener: () => void): void {
    this.ensureInitialized();
    this.stateService.addListener(listener);
    logger.debug('State listener added');
  }

  removeListener(listener: () => void): void {
    this.ensureInitialized();
    this.stateService.removeListener(listener);
    logger.debug('State listener removed');
  }

  isInitialized(): boolean {
    return this.initialized && this.stateService.isInitialized();
  }

  private ensureInitialized(): void {
    if (!this.isInitialized()) {
      logger.error('GameStateService not initialized');
      throw new Error('GameStateService not initialized');
    }
  }

  async cleanup(): Promise<void> {
    try {
      this.initialized = false;
      logger.debug('GameStateService cleaned up');
    } catch (error) {
      logger.error('Error during GameStateService cleanup:', error);
      throw error;
    }
  }
}
