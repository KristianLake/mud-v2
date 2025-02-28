import { BaseCommand } from '../BaseCommand';
import { ICommandStrategy } from '../strategies/ICommandStrategy';

export class StatusCommand extends BaseCommand {
    constructor(strategy: ICommandStrategy) {
        super(strategy);
    }

    execute(): string {
        return this.strategy.execute();
    }
}
