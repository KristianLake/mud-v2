/**
 * Interface for environment service
 * Follows Interface Segregation with focused methods
 */
export interface IEnvironmentService {
  /**
   * Get current time of day
   */
  getTimeOfDay(): string;
  
  /**
   * Get current weather
   */
  getWeather(): string;
  
  /**
   * Get ambient sounds for current location
   */
  getAmbientSounds(): string[];
  
  /**
   * Get ambient messages for current location
   */
  getAmbientMessages(): string[];
  
  /**
   * Trigger an ambient message
   */
  triggerAmbientMessage(): void;
  
  /**
   * Advance game time
   */
  advanceTime(minutes: number): void;
  
  /**
   * Check if it's day or night
   */
  isDaytime(): boolean;
  
  /**
   * Get light level (0-100)
   */
  getLightLevel(): number;
  
  /**
   * Get temperature
   */
  getTemperature(): number;
  
  /**
   * Check if environment affects movement
   */
  doesEnvironmentAffectMovement(): boolean;
  
  /**
   * Get environment effects
   */
  getEnvironmentEffects(): Array<{
    type: string;
    strength: number;
    description: string;
  }>;
}
