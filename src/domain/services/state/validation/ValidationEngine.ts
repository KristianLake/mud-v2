import { IValidationRule } from './ValidationRule';
import { StateValidationResult } from '../types';
import { logger } from '../../../../utils/logger';

/**
 * Engine for validating state against a set of rules
 * Single Responsibility: Only handles validation logic
 */
export class ValidationEngine<T> {
  private rules: IValidationRule<T>[] = [];
  
  constructor() {
    logger.debug('ValidationEngine initialized');
  }
  
  /**
   * Add a validation rule
   * @param rule Rule to add
   */
  addRule(rule: IValidationRule<T>): void {
    this.rules.push(rule);
    logger.debug(`Added validation rule: ${rule.name}`);
  }
  
  /**
   * Add multiple validation rules
   * @param rules Rules to add
   */
  addRules(rules: IValidationRule<T>[]): void {
    rules.forEach(rule => this.addRule(rule));
  }
  
  /**
   * Remove a validation rule by name
   * @param ruleName Name of rule to remove
   */
  removeRule(ruleName: string): void {
    const initialCount = this.rules.length;
    this.rules = this.rules.filter(rule => rule.name !== ruleName);
    
    if (initialCount !== this.rules.length) {
      logger.debug(`Removed validation rule: ${ruleName}`);
    }
  }
  
  /**
   * Clear all validation rules
   */
  clearRules(): void {
    this.rules = [];
    logger.debug('All validation rules cleared');
  }
  
  /**
   * Get all validation rules
   * @returns Array of validation rules
   */
  getRules(): IValidationRule<T>[] {
    return [...this.rules];
  }
  
  /**
   * Validate a state object against all rules
   * @param state State to validate
   * @returns Validation result with errors
   */
  validate(state: T): StateValidationResult {
    logger.debug('Running validation engine');
    
    const errors: string[] = [];
    
    for (const rule of this.rules) {
      try {
        if (!rule.validate(state)) {
          errors.push(rule.getErrorMessage());
          logger.debug(`Validation failed for rule: ${rule.name}`);
        }
      } catch (error) {
        const errorMessage = `Error in validation rule ${rule.name}: ${error}`;
        errors.push(errorMessage);
        logger.error(errorMessage, error);
      }
    }
    
    const isValid = errors.length === 0;
    
    logger.debug('Validation completed', { 
      isValid, 
      errorCount: errors.length 
    });
    
    return { isValid, errors };
  }
  
  /**
   * Check if a state is valid
   * @param state State to validate
   * @returns True if state is valid
   */
  isValid(state: T): boolean {
    return this.validate(state).isValid;
  }
  
  /**
   * Get the count of validation rules
   */
  getRuleCount(): number {
    return this.rules.length;
  }
}
