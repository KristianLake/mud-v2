/**
 * Generic repository interface
 * Follows Interface Segregation Principle with focused methods
 */
export interface IRepository<T> {
  /**
   * Get an entity by ID
   */
  getById(id: string): T | undefined;
  
  /**
   * Get all entities
   */
  getAll(): T[];
  
  /**
   * Check if an entity exists
   */
  exists(id: string): boolean;
  
  /**
   * Add or update an entity
   */
  save(entity: T): void;
  
  /**
   * Remove an entity
   */
  remove(id: string): boolean;
  
  /**
   * Get the count of entities
   */
  count(): number;
}
