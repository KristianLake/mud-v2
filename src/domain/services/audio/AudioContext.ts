import { IAudioSystem } from './IAudioSystem';
import { AudioSystem } from './AudioSystem';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';

export class GameAudioContext {
  private static instance: GameAudioContext | null = null;
  private audioSystem: IAudioSystem;
  private container: Container;

  private constructor() {
    this.container = Container.getInstance();
    this.container.register(ServiceTokens.AudioSystem, () => new AudioSystem());
    this.audioSystem = this.container.resolve<IAudioSystem>(ServiceTokens.AudioSystem);
  }

  public static getInstance(): GameAudioContext {
    if (!GameAudioContext.instance) {
      GameAudioContext.instance = new GameAudioContext();
    }
    return GameAudioContext.instance;
  }

  getAudioSystem(): IAudioSystem {
      return this.audioSystem;
  }

  async reset(): Promise<void> {
    await this.container.dispose();
    GameAudioContext.instance = null;
  }
}
