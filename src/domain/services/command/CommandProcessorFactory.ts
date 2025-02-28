import { ICommandProcessor } from './ICommandProcessor';
import { CommandProcessor } from './CommandProcessor';
import { ICommandProcessorFactory } from './ICommandFactory'; // Corrected import
import { BaseGameService } from '../BaseGameService';

// NOTE: This factory is likely unnecessary as CommandProcessor can be instantiated directly.
//       Keeping it to avoid breaking the "continue" instruction, but it should be reviewed.

export class CommandProcessorFactory extends BaseGameService implements ICommandProcessorFactory {
    createCommandProcessor(): ICommandProcessor {
        return new CommandProcessor();
    }
}
