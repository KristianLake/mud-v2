import { IGameEngine } from './IGameEngine';
import { IStateService } from '../services/state/IStateService';
import { ICommandService } from '../services/command/ICommandService';
import { IEventService } from '../services/event/IEventService';
import { IMessageService } from '../services/messaging/IMessageService';
import { logger } from '../../utils/logger';

/**
 * Main game engine
 * Coordinates game systems and services
 */
export class GameEngine implements IGameEngine {
  private initialized = false;
  private running = false;
  
  constructor(
    private stateService: IStateService,
    private commandService: ICommandService,
    private eventService: IEventService,
    private messageService: IMessageService
  ) {
    logger.debug('GameEngine created');
  }
  
  /**
   * Initialize the game engine
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    try {
      logger.debug('Initializing GameEngine');
      
      // Initialize state service
      await this.stateService.initialize();
      
      // Initialize command service
      await this.commandService.initialize();
      
      // Subscribe to events
      this.eventService.on('command:executed', this.handleCommandExecuted.bind(this));
      this.eventService.on('state:changed', this.handleStateChanged.bind(this));
      
      this.initialized = true;
      this.eventService.emit('game:initialized');
      
      logger.debug('GameEngine initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize GameEngine', error);
      throw error;
    }
  }
  
  /**
   * Start the game
   */
  async start(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (this.running) {
      return;
    }
    
    try {
      logger.debug('Starting GameEngine');
      
      // Load initial state if needed
      if (!this.stateService.hasState()) {
        await this.stateService.loadInitialState();
      }
      
      this.running = true;
      this.eventService.emit('game:started');
      
      // Add welcome message
      this.messageService.addSystemMessage('Welcome to the game! Type "help" for a list of commands.');
      
      logger.debug('GameEngine started successfully');
    } catch (error) {
      logger.error('Failed to start GameEngine', error);
      throw error;
    }
  }
  
  /**
   * Stop the game
   */
  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }
    
    try {
      logger.debug('Stopping GameEngine');
      
      // Save current state
      await this.stateService.saveState();
      
      this.running = false;
      this.eventService.emit('game:stopped');
      
      logger.debug('GameEngine stopped successfully');
    } catch (error) {
      logger.error('Failed to stop GameEngine', error);
      throw error;
    }
  }
  
  /**
   * Execute a command
   */
  async executeCommand(commandText: string): Promise<boolean> {
    if (!this.running) {
      logger.warn('Attempted to execute command while game is not running');
      return false;
    }
    
    try {
      return await this.commandService.executeCommand(commandText);
    } catch (error) {
      logger.error('Error executing command', error);
      this.messageService.addErrorMessage(`Error: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Check if the game is running
   */
  isRunning(): boolean {
    return this.running;
  }
  
  /**
   * Check if the game is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Reset the game
   */
  async reset(): Promise<void> {
    try {
      logger.debug('Resetting GameEngine');
      
      // Stop the game if running
      if (this.running) {
        await this.stop();
      }
      
      // Reset state
      await this.stateService.resetState();
      
      // Reset command service
      await this.commandService.reset();
      
      // Emit reset event
      this.eventService.emit('game:reset');
      
      // Restart the game
      await this.start();
      
      logger.debug('GameEngine reset successfully');
    } catch (error) {
      logger.error('Failed to reset GameEngine', error);
      throw error;
    }
  }
  
  /**
   * Save the game
   */
  async saveGame(): Promise<void> {
    try {
      logger.debug('Saving game');
      
      await this.stateService.saveState();
      
      this.messageService.addSystemMessage('Game saved successfully.');
      this.eventService.emit('game:saved');
      
      logger.debug('Game saved successfully');
    } catch (error) {
      logger.error('Failed to save game', error);
      this.messageService.addErrorMessage(`Failed to save game: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Load a saved game
   */
  async loadGame(): Promise<void> {
    try {
      logger.debug('Loading game');
      
      // Stop the game if running
      if (this.running) {
        await this.stop();
      }
      
      // Load state
      await this.stateService.loadState();
      
      // Restart the game
      await this.start();
      
      this.messageService.addSystemMessage('Game loaded successfully.');
      this.eventService.emit('game:loaded');
      
      logger.debug('Game loaded successfully');
    } catch (error) {
      logger.error('Failed to load game', error);
      this.messageService.addErrorMessage(`Failed to load game: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Handle command executed event
   */
  private handleCommandExecuted(data: { command: string, success: boolean }): void {
    // Nothing to do here yet
  }
  
  /**
   * Handle state changed event
   */
  private handleStateChanged(data: { state: any, changes: any }): void {
    // Nothing to do here yet
  }
}
