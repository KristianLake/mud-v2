import { IEventBus } from '../services/events/IEventBus';
import { EventBus } from '../services/events/EventBus';
import { ServiceTokens } from '../services/di/ServiceTokens';
import { Container } from '../services/di/Container';

export class GameEventBus {
  private static instance: GameEventBus | null = null;
  private eventBus: IEventBus;
  private container: Container;

  private constructor() {
    this.container = Container.getInstance();
    this.container.register(ServiceTokens.EventBus, () => new EventBus());
    this.eventBus = this.container.resolve<IEventBus>(ServiceTokens.EventBus);
  }

  public static getInstance(): GameEventBus {
    if (!GameEventBus.instance) {
      GameEventBus.instance = new GameEventBus();
    }
    return GameEventBus.instance;
  }

  getEventBus(): IEventBus {
    return this.eventBus;
  }

  async reset(): Promise<void> {
      await this.container.dispose();
      GameEventBus.instance = null;
  }
}
