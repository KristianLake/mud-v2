import { IValidationRule } from './IValidationRule';
import { BaseGameService } from '../../BaseGameService';
import { logger } from '../../../../utils/logger';

export class ValidationRuleRegistry extends BaseGameService {
    private static instance: ValidationRuleRegistry;
    private rules: Map<string, IValidationRule[]> = new Map();

    private constructor() {super();}

    public static getInstance(): ValidationRuleRegistry {
        if (!ValidationRuleRegistry.instance) {
            ValidationRuleRegistry.instance = new ValidationRuleRegistry();
        }
        return ValidationRuleRegistry.instance;
    }

    registerRule(rule: IValidationRule, commandName?: string): void {
        const command = commandName ?? '*'; // '*' for rules that apply to all commands
        if (!this.rules.has(command)) {
            this.rules.set(command, []);
        }
        this.rules.get(command)!.push(rule);
        logger.info(`Registered validation rule ${rule.constructor.name} for command: ${command}`);
    }

    getRulesForCommand(commandName: string): IValidationRule[] {
        const specificRules = this.rules.get(commandName) || [];
        const globalRules = this.rules.get('*') || []; // Get rules that apply to all commands
        return [...specificRules, ...globalRules];
    }
}
