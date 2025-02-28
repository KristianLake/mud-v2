export interface ICommandStrategy {
  getName(): string;
  getArgs(): string[];
  execute(): string;
}
