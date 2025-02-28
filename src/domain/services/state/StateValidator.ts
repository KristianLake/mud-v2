import { IStateValidator } from './IStateValidator';
import { logger } from '../../../utils/logger';

/**
 * Validator for state changes
 * Implements IStateValidator interface
 * Single Responsibility: Validate state changes
 */
export class StateValidator<T = any> implements IStateValidator<T> {
  private validationRules: Array<(state: T) => string | null> = [];
  
  constructor() {
    logger.debug('StateValidator initialized');
  }
  
  /**
   * Add a validation rule
   * @param rule Function that validates state and returns error message or null if valid
   */
  addRule(rule: (state: T) => string | null): void {
    this.validationRules.push(rule);
    logger.debug('Added validation rule', { ruleCount: this.validationRules.length });
  }
  
  /**
   * Validate if a state is valid
   * @param state State to validate
   * @returns True if the state is valid
   */
  isValid(state: T): boolean {
    // If no validation rules, consider valid
    if (this.validationRules.length === 0) {
      return true;
    }
    
    for (const rule of this.validationRules) {
      const error = rule(state);
      if (error !== null) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Validate if a state change is valid
   * @param oldState Current state
   * @param newState New state
   * @returns True if the state change is valid
   */
  isValidChange(oldState: T, newState: T): boolean {
    return this.isValid(newState);
  }
  
  /**
   * Get validation errors for a state
   * @param state State to validate
   * @returns Array of error messages
   */
  getValidationErrors(state: T): string[] {
    const errors: string[] = [];
    
    for (const rule of this.validationRules) {
      const error = rule(state);
      if (error !== null) {
        errors.push(error);
      }
    }
    
    return errors;
  }
}
