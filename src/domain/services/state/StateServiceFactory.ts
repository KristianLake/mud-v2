import { GameState } from '../../../types';
import { IStateService } from './IStateService';
import { IStateValidator } from './IStateValidator';
import { StateService } from './StateService';
import { GameStateValidator } from './GameStateValidator';
import { logger } from '../../../utils/logger';

/**
 * Factory for creating state services
 * Single Responsibility: Create state service instances
 */
export class StateServiceFactory {
  /**
   * Create a new state service with default validator
   * @param initialState Optional initial state
   * @returns New state service
   */
  static createStateService(initialState?: GameState): IStateService {
    logger.debug('Creating state service with default validator');
    const validator = new GameStateValidator();
    return new StateService(validator, initialState);
  }

  /**
   * Create a new state service with custom validator
   * @param validator Custom state validator
   * @param initialState Optional initial state
   * @returns New state service
   */
  static createStateServiceWithValidator(
    validator: IStateValidator,
    initialState?: GameState
  ): IStateService {
    logger.debug('Creating state service with custom validator');
    return new StateService(validator, initialState);
  }
}
