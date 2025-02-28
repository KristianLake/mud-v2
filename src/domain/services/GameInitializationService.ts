import { logger } from '../../utils/logger';
import { GameMasterAgent } from '../../agents/GameMasterAgent';
import { initialState } from '../../data/initialState';
import { Container } from '../services/di/Container';
import { ServiceTokens } from '../services/di/ServiceTokens';
import { GameStateValidator } from './state/GameStateValidator';
import { IMessageService } from './messaging/IMessageService';
import { container } from './di/container';

/**
 * Service responsible for initializing the game
 * Follows Single Responsibility Principle by focusing only on initialization
 */
export class GameInitializationService {
  private static instance: GameInitializationService | null = null;
  private gameMaster: GameMasterAgent | null = null;
  private messageService: IMessageService;
  private stateValidator: GameStateValidator;
  private hasShownWelcome: boolean = false;
  private initializationPromise: Promise<GameMasterAgent> | null = null;
  private cleanupPromise: Promise<void> | null = null;
  private instanceId: string;

  private constructor() {
    // Resolve message service from container instead of constructor injection
    try {
      this.messageService = container.resolve(ServiceTokens.MessageService);
      logger.debug('MessageService resolved successfully in GameInitializationService');
    } catch (error) {
      logger.error('Failed to resolve MessageService in GameInitializationService', error);
      // Create a fallback message service to prevent null errors
      this.messageService = {
        addMessage: (content: string, type: string) => {
          logger.info(`[Fallback Message] ${type}: ${content}`);
        },
        addSystemMessage: (content: string) => {
          logger.info(`[Fallback System Message]: ${content}`);
        },
        addErrorMessage: (content: string) => {
          logger.error(`[Fallback Error Message]: ${content}`);
        },
        getMessages: () => [],
        subscribe: () => () => {},
        clearMessages: () => {}
      };
    }
    
    this.stateValidator = new GameStateValidator();
    this.instanceId = `game-init-${Math.random().toString(36).slice(2)}`;
  }

  /**
   * Get a singleton instance of the service
   */
  public static getInstance(): GameInitializationService {
    if (!GameInitializationService.instance) {
      GameInitializationService.instance = new GameInitializationService();
    }
    return GameInitializationService.instance;
  }

  /**
   * Initialize the game
   * @returns GameMasterAgent instance
   */
  public async initialize(): Promise<GameMasterAgent> {
    // Return existing initialization if in progress
    if (this.initializationPromise) {
      logger.debug('Reusing existing initialization promise');
      return this.initializationPromise;
    }

    // Create new initialization promise
    logger.debug('Creating new initialization promise');
    this.initializationPromise = this.performInitialization();
    
    try {
      const result = await this.initializationPromise;
      return result;
    } finally {
      this.initializationPromise = null;
    }
  }

  /**
   * Perform the actual initialization
   * @returns GameMasterAgent instance
   */
  private async performInitialization(): Promise<GameMasterAgent> {
    try {
      // Wait for any cleanup to complete
      if (this.cleanupPromise) {
        await this.cleanupPromise;
      }

      logger.info('Starting game initialization');

      // Create deep copy and validate initial state
      const stateClone = this.validateAndCloneState(initialState);

      // Get game master instance
      logger.debug('Getting GameMasterAgent instance...');
      this.gameMaster = await GameMasterAgent.getInstance(stateClone);

      // Mount this instance
      this.gameMaster.mount(this.instanceId);

      // Show welcome message only once
      if (!this.hasShownWelcome) {
        // Add null check for messageService
        if (this.messageService) {
          this.messageService.addMessage(
            "Welcome to the adventure! The world lives and breathes - watch as time flows and the environment changes around you.",
            'system'
          );
          this.hasShownWelcome = true;

          // Perform initial look command
          const initialDescription = this.gameMaster.processCommand('look');
          this.messageService.addMessage(initialDescription, 'response');
        } else {
          logger.warn('MessageService not available for welcome message');
        }
      }

      logger.info('Game initialization completed successfully');
      return this.gameMaster;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to initialize game:', { error: errorMessage });
      this.gameMaster = null;
      throw new Error(`Game initialization failed: ${errorMessage}`);
    }
  }

  /**
   * Validate and clone the initial state
   * @param state Initial state to validate
   * @returns Deep copy of state
   */
  private validateAndCloneState(state: any): typeof initialState {
    logger.debug('Validating initial state properties...');
    
    // Check for required properties
    const validationErrors = this.stateValidator.getValidationErrors(state);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid initial state: ${validationErrors.join(', ')}`);
    }
    
    logger.debug('Initial state validation passed');
    return JSON.parse(JSON.stringify(state));
  }

  /**
   * Reset the service instance
   */
  public static async resetInstance(): Promise<void> {
    logger.debug('Resetting GameInitializationService instance');
    if (GameInitializationService.instance) {
      await GameInitializationService.instance.reset();
    }
    GameInitializationService.instance = null;
  }

  /**
   * Reset the service
   */
  private async reset(): Promise<void> {
    logger.debug('Resetting GameInitializationService');
    
    // Clean up game master
    if (this.gameMaster) {
      this.gameMaster.unmount(this.instanceId);
      this.gameMaster = null;
    }
    
    // Clear flags
    this.hasShownWelcome = false;
    this.initializationPromise = null;
  }
}
