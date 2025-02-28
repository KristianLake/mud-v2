import { SoundEffectType } from '../../../types/audio';

export interface IAudioSystem {
  playSoundEffect(soundEffect: SoundEffectType): Promise<void>;
  stopSoundEffect(soundEffect: SoundEffectType): void;
  setVolume(soundEffect: SoundEffectType, volume: number): void;
}
