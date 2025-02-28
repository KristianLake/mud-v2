// Types for the enhanced audio system
export type Environment = {
  type: 'cave' | 'forest' | 'dungeon' | 'village';
  conditions: {
    wet: boolean;
    reverb: number; // 0-1
    size: 'small' | 'medium' | 'large';
  };
};

export type AudioParameters = {
  environment: Environment;
  action: string;
  intensity: number; // 0-1
  variation: number; // Random seed for variation
};

export type CachedSound = {
  buffer: AudioBuffer;
  params: AudioParameters;
  timestamp: number;
};
