// Types for environment-related data

// Example: Type for defining different times of day
export type TimeOfDay = 'day' | 'night' | 'dawn' | 'dusk';

// Example: Type for defining different weather conditions
export type WeatherCondition = 'sunny' | 'rainy' | 'cloudy' | 'foggy';

// Example: Type for defining environment-specific events
export type EnvironmentEvent = {
  type: string; // e.g., 'timeChange', 'weatherChange'
  data: any; // Specific data for the event
};
