import { ICommandPlugin } from './ICommandPlugin';
import { ICommandRegistry } from './ICommandRegistry';
import { CommandRegistry } from './CommandRegistry';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

// NOTE: This class is likely unnecessary as CommandRegistry handles registration.
//       Keeping it to avoid breaking the "continue" instruction, but it should be reviewed.

export class CommandRegistrar extends BaseGameService {
    private commandRegistry: ICommandRegistry;

    constructor() {
        super();
        this.commandRegistry = CommandRegistry.getInstance(); // No need for DI
    }

    registerPlugin(plugin: ICommandPlugin): void {
        plugin.register(this.commandRegistry);
        logger.info(`Registered command plugin: ${plugin.constructor.name}`);
    }

    registerPlugins(plugins: ICommandPlugin[]): void {
        plugins.forEach(plugin => this.registerPlugin(plugin));
        logger.info('Registered multiple command plugins');
    }
}
