import { ICommand } from '../ICommand';
import { IValidationRule } from './IValidationRule';
import { logger } from '../../../../utils/logger';

export class ValidationEngine {
    private rules: IValidationRule[] = [];

    addRule(rule: IValidationRule): void {
        this.rules.push(rule);
        logger.debug(`Added validation rule: ${rule.constructor.name}`);
    }

    validate(command: ICommand): { isValid: boolean; errorMessage?: string } {
        for (const rule of this.rules) {
            const result = rule.validate(command);
            if (!result.isValid) {
                logger.warn(`Validation failed for command ${command.constructor.name} with rule ${rule.constructor.name}: ${result.errorMessage}`);
                return result;
            }
        }

        return { isValid: true };
    }

    clearRules(): void {
        this.rules = [];
        logger.debug('Cleared all validation rules.');
    }
}
