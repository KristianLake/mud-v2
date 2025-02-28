import { ICommand } from './ICommand';
import { ICommandValidator } from './ICommandValidator';
import { ValidationRuleRegistry } from './validation/ValidationRuleRegistry';
import { ValidationEngine } from './validation/ValidationEngine';
import { IValidationRule } from './validation/IValidationRule';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

export class CommandValidator extends BaseGameService implements ICommandValidator {
  private validationEngine: ValidationEngine;

  constructor() {
    super();
    this.validationEngine = new ValidationEngine();
    this.registerDefaultRules();
  }

  private registerDefaultRules(): void {
      // Register default validation rules here
      // Example:
      // this.validationEngine.registerRule(new SomeValidationRule());
      logger.info('Default validation rules registered');
  }

  validate(command: ICommand): boolean {
    return this.validationEngine.validate(command);
  }

  addValidationRule(rule: IValidationRule): void {
    this.validationEngine.registerRule(rule);
    logger.info(`Added validation rule: ${rule.constructor.name}`);
}
}
