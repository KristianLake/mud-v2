/**
 * Base interface for all game entities
 * Single Responsibility: Defines the common properties of entities
 */
export interface IEntity {
  id: string;
  name: string;
  description: string;
}
