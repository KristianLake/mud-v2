import { IMessageBus } from './IMessageBus';
import { MessageBus } from './MessageBus';
import { BaseGameService } from '../BaseGameService';

// NOTE: This factory is likely unnecessary as MessageBus can be instantiated directly.
//       Keeping it to avoid breaking the "continue" instruction, but it should be reviewed.

export class MessageBusFactory extends BaseGameService {
    createMessageBus(): IMessageBus {
        return new MessageBus();
    }
}
