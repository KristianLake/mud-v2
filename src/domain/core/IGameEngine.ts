import { ICommandService } from "../services/command/ICommandService";
import { IStateService } from "../services/state/IStateService";
import { IEventService } from "../services/event/IEventService";
import { IEnvironmentService } from "../services/environment/IEnvironmentService";

/**
 * Interface for the game engine
 * Follows Interface Segregation Principle by defining clear engine responsibilities
 */
export interface IGameEngine {
  /**
   * Initialize the game engine
   * @returns Promise that resolves when initialization is complete
   */
  initialize(): Promise<void>;
  
  /**
   * Start the game
   * @returns Promise that resolves when start is complete
   */
  start(): Promise<void>;
  
  /**
   * Pause the game
   */
  pause(): void;
  
  /**
   * Resume the game
   */
  resume(): void;
  
  /**
   * End the game
   */
  end(): void;
  
  /**
   * Execute a command
   * @param commandString The command to execute
   * @returns Promise that resolves when command execution is complete
   */
  executeCommand(commandString: string): Promise<void>;
  
  /**
   * Get access to the state service
   */
  getStateService(): IStateService;
  
  /**
   * Get access to the command service
   */
  getCommandService(): ICommandService;
  
  /**
   * Get access to the event service
   */
  getEventService(): IEventService;
  
  /**
   * Get access to the environment service
   */
  getEnvironmentService(): IEnvironmentService;
  
  /**
   * Check if the game is initialized
   */
  isInitialized(): boolean;
  
  /**
   * Check if the game is running
   */
  isRunning(): boolean;
  
  /**
   * Check if the game is paused
   */
  isPaused(): boolean;
}
