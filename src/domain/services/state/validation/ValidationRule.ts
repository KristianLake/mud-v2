import { logger } from '../../../../utils/logger';

/**
 * Interface for a validation rule
 */
export interface IValidationRule<T> {
  /**
   * Name of the validation rule
   */
  readonly name: string;
  
  /**
   * Validate a state object
   * @param state State to validate
   * @returns True if valid
   */
  validate(state: T): boolean;
  
  /**
   * Get the error message for this rule
   */
  getErrorMessage(): string;
}

/**
 * Base class for state validation rules
 * Following Open-Closed principle: Can extend with new rules
 */
export abstract class ValidationRule<T> implements IValidationRule<T> {
  constructor(
    public readonly name: string,
    protected readonly errorMessage: string
  ) {
    logger.debug(`Validation rule created: ${name}`);
  }
  
  /**
   * Validate a state object
   * @param state State to validate
   * @returns True if valid
   */
  abstract validate(state: T): boolean;
  
  /**
   * Get the error message for this rule
   */
  getErrorMessage(): string {
    return this.errorMessage;
  }
}

/**
 * Property existence validation rule
 */
export class PropertyExistsRule<T extends Record<string, any>> extends ValidationRule<T> {
  constructor(
    private readonly propertyPath: string,
    errorMessage?: string
  ) {
    super(
      `PropertyExists(${propertyPath})`,
      errorMessage || `Property '${propertyPath}' must exist`
    );
  }
  
  /**
   * Validate property exists in state
   * @param state State to validate
   * @returns True if property exists
   */
  validate(state: T): boolean {
    try {
      // Handle nested properties
      const parts = this.propertyPath.split('.');
      let current: any = state;
      
      for (const part of parts) {
        if (current === undefined || current === null) {
          return false;
        }
        current = current[part];
      }
      
      return current !== undefined;
    } catch (error) {
      logger.error(`Error in PropertyExistsRule for ${this.propertyPath}`, error);
      return false;
    }
  }
}

/**
 * Type validation rule
 */
export class PropertyTypeRule<T extends Record<string, any>> extends ValidationRule<T> {
  constructor(
    private readonly propertyPath: string,
    private readonly expectedType: string,
    errorMessage?: string
  ) {
    super(
      `PropertyType(${propertyPath}:${expectedType})`,
      errorMessage || `Property '${propertyPath}' must be of type '${expectedType}'`
    );
  }
  
  /**
   * Validate property type in state
   * @param state State to validate
   * @returns True if property is of expected type
   */
  validate(state: T): boolean {
    try {
      // Handle nested properties
      const parts = this.propertyPath.split('.');
      let current: any = state;
      
      for (const part of parts) {
        if (current === undefined || current === null) {
          return false;
        }
        current = current[part];
      }
      
      // Special case for arrays
      if (this.expectedType === 'array') {
        return Array.isArray(current);
      }
      
      // Handle null values
      if (current === null) {
        return this.expectedType === 'null';
      }
      
      return typeof current === this.expectedType;
    } catch (error) {
      logger.error(`Error in PropertyTypeRule for ${this.propertyPath}`, error);
      return false;
    }
  }
}

/**
 * Value range validation rule
 */
export class NumberRangeRule<T extends Record<string, any>> extends ValidationRule<T> {
  constructor(
    private readonly propertyPath: string,
    private readonly min: number,
    private readonly max: number,
    errorMessage?: string
  ) {
    super(
      `NumberRange(${propertyPath}:${min}-${max})`,
      errorMessage || `Property '${propertyPath}' must be between ${min} and ${max}`
    );
  }
  
  /**
   * Validate number is within range
   * @param state State to validate
   * @returns True if number is within range
   */
  validate(state: T): boolean {
    try {
      // Handle nested properties
      const parts = this.propertyPath.split('.');
      let current: any = state;
      
      for (const part of parts) {
        if (current === undefined || current === null) {
          return false;
        }
        current = current[part];
      }
      
      // Check if it's a number and in range
      return (
        typeof current === 'number' &&
        !isNaN(current) &&
        current >= this.min &&
        current <= this.max
      );
    } catch (error) {
      logger.error(`Error in NumberRangeRule for ${this.propertyPath}`, error);
      return false;
    }
  }
}

/**
 * Custom validation rule using a predicate function
 */
export class PredicateRule<T> extends ValidationRule<T> {
  constructor(
    name: string,
    private readonly predicate: (state: T) => boolean,
    errorMessage: string
  ) {
    super(name, errorMessage);
  }
  
  /**
   * Validate using predicate function
   * @param state State to validate
   * @returns Result of predicate function
   */
  validate(state: T): boolean {
    try {
      return this.predicate(state);
    } catch (error) {
      logger.error(`Error in PredicateRule ${this.name}`, error);
      return false;
    }
  }
}
