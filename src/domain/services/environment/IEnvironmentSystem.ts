// NOTE: This interface seems unnecessary as its methods are already defined in IEnvironmentService.
//       It should likely be removed.  Keeping it temporarily to satisfy the "continue" instruction.

export interface IEnvironmentSystem {
    start(): void;
    stop(): void;
}
