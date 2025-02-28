import { GameState } from '../../types';
import { initialState } from '../../data/initialState';
import { logger } from '../../utils/logger';
import { GameStateValidator } from '../services/state/GameStateValidator';

/**
 * Factory for creating game state objects
 * Single Responsibility: Create valid game state instances
 */
export class GameStateFactory {
    private static validator = new GameStateValidator();

    /**
     * Create a new initial state
     * @returns Deep copy of the initial state
     */
    static createInitialState(): GameState {
        logger.debug('Creating initial game state');
        
        // Validate the initial state before returning it
        const errors = this.validator.getValidationErrors(initialState);
        if (errors.length > 0) {
            logger.error('Invalid initial state', { errors });
            throw new Error(`Invalid initial state: ${errors.join(', ')}`);
        }
        
        // Perform a deep copy to prevent modification of the original initialState
        return JSON.parse(JSON.stringify(initialState));
    }

    /**
     * Create state from a snapshot
     * @param snapshot State snapshot
     * @returns Game state from snapshot
     */
    static createFromSnapshot(snapshot: any): GameState {
        logger.debug('Creating game state from snapshot');
        
        // Validate the snapshot
        const errors = this.validator.getValidationErrors(snapshot);
        if (errors.length > 0) {
            logger.error('Invalid state snapshot', { errors });
            throw new Error(`Invalid state snapshot: ${errors.join(', ')}`);
        }
        
        return snapshot as GameState;
    }
    
    /**
     * Merge a partial state with the initial state
     * @param partialState Partial state to merge
     * @returns Merged game state
     */
    static createWithPartialState(partialState: Partial<GameState>): GameState {
        logger.debug('Creating game state with partial state override');
        
        // Get a fresh copy of initial state
        const baseState = JSON.parse(JSON.stringify(initialState));
        
        // Merge the partial state
        const mergedState = { ...baseState, ...partialState };
        
        // Validate the merged state
        const errors = this.validator.getValidationErrors(mergedState);
        if (errors.length > 0) {
            logger.error('Invalid merged state', { errors });
            throw new Error(`Invalid merged state: ${errors.join(', ')}`);
        }
        
        return mergedState;
    }
    
    /**
     * Create an empty state with required properties
     * @returns Minimal valid game state
     */
    static createEmptyState(): GameState {
        logger.debug('Creating empty game state with required properties');
        
        const emptyState: GameState = {
            playerLocation: '',
            playerInventory: [],
            playerGold: 0,
            playerHealth: 100,
            timeOfDay: 'morning',
            questLog: {},
            playerStats: {
                maxHealth: 100,
                level: 1,
                experience: 0,
                nextLevelExp: 100,
                strength: 10,
                agility: 10,
                intelligence: 10,
                baseAttack: 5,
                baseDefense: 5
            },
            rooms: {},
            items: {},
            npcs: {},
            gameFlags: {}
        };
        
        return emptyState;
    }
}
