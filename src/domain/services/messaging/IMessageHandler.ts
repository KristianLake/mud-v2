// NOTE: This interface seems to be a generic event handler and could be replaced
//       with a more general-purpose event handling interface.  Keeping it
//       temporarily to satisfy the "continue" instruction.

export interface IMessageHandler {
    handle(payload: any): void;
}
