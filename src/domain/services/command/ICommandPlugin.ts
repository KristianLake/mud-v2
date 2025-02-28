import { ICommandRegistry } from './ICommandRegistry';

export interface ICommandPlugin {
  register(registry: ICommandRegistry): void;
}
