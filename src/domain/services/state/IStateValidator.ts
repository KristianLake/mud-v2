/**
 * Interface for state validators
 * Interface Segregation Principle: Focused interface for validation
 */
export interface IStateValidator {
  /**
   * Get validation errors for a state
   * @param state State to validate
   * @returns Array of error messages
   */
  getValidationErrors(state: any): string[];
  
  /**
   * Check if a state change is valid
   * @param currentState Current state
   * @param newState New state
   * @returns True if the change is valid
   */
  isValidChange(currentState: any, newState: any): boolean;
}
