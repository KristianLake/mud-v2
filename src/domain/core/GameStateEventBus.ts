import { IEventBus } from '../services/events/IEventBus';
import { EventBus } from '../services/events/EventBus';
import { ServiceTokens } from '../services/di/ServiceTokens';
import { Container } from '../services/di/Container';

export class GameStateEventBus {
  private static instance: GameStateEventBus | null = null;
  private eventBus: IEventBus;
  private container: Container;

  private constructor() {
    this.container = Container.getInstance();
    this.container.register(ServiceTokens.GameStateEventBus, () => new EventBus());
    this.eventBus = this.container.resolve<IEventBus>(ServiceTokens.GameStateEventBus);
  }

  public static getInstance(): GameStateEventBus {
    if (!GameStateEventBus.instance) {
      GameStateEventBus.instance = new GameStateEventBus();
    }
    return GameStateEventBus.instance;
  }

    getEventBus(): IEventBus {
        return this.eventBus;
    }

  async reset(): Promise<void> {
    await this.container.dispose();
    GameStateEventBus.instance = null;
  }
}
