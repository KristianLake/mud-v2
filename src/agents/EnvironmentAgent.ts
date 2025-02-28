import { IEnvironmentEngine } from '../domain/core/IEnvironmentEngine';
import { EnvironmentEngine } from '../domain/core/EnvironmentEngine';
import { ServiceTokens } from '../domain/services/di/ServiceTokens';
import { Container } from '../domain/services/di/Container';
import { logger } from '../utils/logger';

export class EnvironmentAgent {
  private static instance: EnvironmentAgent | null = null;
  private environmentEngine: IEnvironmentEngine;
  private container: Container;
  private isMounted = false;
  private instanceId: string | null = null;

  private constructor() {
    this.container = Container.getInstance();
    this.container.register(ServiceTokens.EnvironmentEngine, () => new EnvironmentEngine());
    this.environmentEngine = this.container.resolve<IEnvironmentEngine>(ServiceTokens.EnvironmentEngine);
  }

  public static getInstance(): EnvironmentAgent {
    if (!EnvironmentAgent.instance) {
      EnvironmentAgent.instance = new EnvironmentAgent();
    }
    return EnvironmentAgent.instance;
  }

  mount(instanceId: string): void {
    if (!this.isMounted) {
      this.instanceId = instanceId;
      this.isMounted = true;
      logger.info(`EnvironmentAgent mounted with ID: ${instanceId}`);
    }
  }

  unmount(): void {
    if (this.isMounted) {
      this.isMounted = false;
      this.instanceId = null;
      logger.info('EnvironmentAgent unmounted');
    }
  }

  // Method to check if the instance is mounted
  isEnvironmentMounted(): boolean {
      return this.isMounted;
  }

  getInstanceId(): string | null {
      return this.instanceId;
  }

  async reset(): Promise<void> {
    if (this.isMounted) {
      this.unmount();
    }
    await this.container.dispose();
    EnvironmentAgent.instance = null;
    logger.info('EnvironmentAgent instance reset.');
  }
}
