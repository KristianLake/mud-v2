import { useState, useEffect, useCallback } from 'react';
import { GameState } from '../types';
import { container } from '../domain/services/di/container';
import { ServiceTokens } from '../domain/services/di/ServiceTokens';
import { IStateService } from '../domain/services/state/IStateService';
import { logger } from '../utils/logger';

/**
 * Hook for accessing and updating game state
 * @returns Game state and update functions
 */
export function useGameState() {
  // Get state service from container
  const stateService = container.resolve<IStateService>(ServiceTokens.StateService);
  
  // Local state
  const [state, setState] = useState<GameState>(stateService.getState());
  
  // Subscribe to state changes
  useEffect(() => {
    logger.debug('Subscribing to state changes');
    
    const unsubscribe = stateService.subscribe((newState) => {
      logger.debug('Game state updated', { newState });
      setState(newState);
    });
    
    return () => {
      logger.debug('Unsubscribing from state changes');
      unsubscribe();
    };
  }, [stateService]);
  
  // Update state function
  const updateState = useCallback((updater: Partial<GameState> | ((state: GameState) => Partial<GameState>)) => {
    try {
      logger.debug('Updating game state', { updater });
      return stateService.updateState(updater);
    } catch (error) {
      logger.error('Error updating game state', { error });
      throw error;
    }
  }, [stateService]);
  
  // Reset state function
  const resetState = useCallback(() => {
    try {
      logger.debug('Resetting game state');
      return stateService.resetState();
    } catch (error) {
      logger.error('Error resetting game state', { error });
      throw error;
    }
  }, [stateService]);
  
  return {
    state,
    updateState,
    resetState
  };
}
