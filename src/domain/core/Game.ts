import { IGameEngine } from './IGameEngine';
import { GameEngine } from './GameEngine';
import { IEnvironmentEngine } from './IEnvironmentEngine';
import { EnvironmentEngine } from './EnvironmentEngine';
import { ServiceTokens } from '../services/di/ServiceTokens';
import { Container } from '../services/di/Container';
import { ServiceFactory } from '../services/di/ServiceFactory';
import { logger } from '../../utils/logger';

export class Game {
  private static instance: Game | null = null;
  private gameEngine: IGameEngine;
  private environmentEngine: IEnvironmentEngine;
  private container: Container;
  private isRunning = false;

  private constructor() {
    this.container = Container.getInstance();
    
    // Register all required services first
    const serviceFactory = new ServiceFactory(this.container);
    serviceFactory.registerAllServices();

    // Register core engines
    this.container.register(ServiceTokens.GameEngine, () => new GameEngine());
    this.container.register(ServiceTokens.EnvironmentEngine, () => new EnvironmentEngine());

    // Resolve instances
    this.gameEngine = this.container.resolve<IGameEngine>(ServiceTokens.GameEngine);
    this.environmentEngine = this.container.resolve<IEnvironmentEngine>(ServiceTokens.EnvironmentEngine);
  }

  public static getInstance(): Game {
    if (!Game.instance) {
      Game.instance = new Game();
    }
    return Game.instance;
  }

  start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.gameEngine.start();
      this.environmentEngine.start();
      logger.info('Game started');
    }
  }

  stop(): void {
    if (this.isRunning) {
      this.isRunning = false;
      this.gameEngine.stop();
      this.environmentEngine.stop();
      logger.info('Game stopped');
    }
  }

  // Method to check if the game is running
  isGameRunning(): boolean {
      return this.isRunning;
  }

  async reset(): Promise<void> {
    if (this.isRunning) {
      this.stop();
    }
    await this.container.dispose();
    Game.instance = null;
    logger.info('Game instance reset.');
  }
}
