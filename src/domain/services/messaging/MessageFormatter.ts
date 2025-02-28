import { Message } from '../../../types';
import { BaseGameService } from '../BaseGameService';

// NOTE: This class seems unnecessary as message formatting can be handled within
//       MessageService.  It should likely be removed.  Keeping it temporarily
//       to satisfy the "continue" instruction.

export class MessageFormatter extends BaseGameService {
    formatMessage(message: Message): string {
        // Basic formatting (you can expand on this)
        return `[${message.type}] ${message.sender ? message.sender + ': ' : ''}${message.text}`;
    }

    formatMessages(messages: Message[]): string[] {
        return messages.map(this.formatMessage);
    }
}
