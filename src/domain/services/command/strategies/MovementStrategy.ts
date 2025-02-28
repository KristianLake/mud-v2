import { ICommandStrategy } from './ICommandStrategy';
import { logger } from '../../../../utils/logger';

export class MovementStrategy implements ICommandStrategy {
  private direction: string;
  
  constructor(direction: string) {
    this.direction = direction;
  }
  
  execute(): string {
    // In a real implementation, this would interact with the game state
    // to move the player in the specified direction
    logger.info(`Moving in direction: ${this.direction}`);
    return `You move ${this.direction}.`;
  }
  
  getDirection(): string {
    return this.direction;
  }
}
