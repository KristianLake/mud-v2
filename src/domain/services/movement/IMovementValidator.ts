import { GameState } from '../state/IStateService';

export interface IMovementValidator {
  validateMovement(gameState: GameState, direction: string): boolean;
}
