/**
 * Generic event emitter class that mimics Node.js's EventEmitter API.
 */
export class EventEmitter<T extends Record<string, any> = Record<string, any>> {
  private listeners: {
    [K in keyof T]?: ((event: T[K]) => void)[];
  } = {};
  private maxListeners: number = 10;

  /**
   * Adds a listener for a specific event.
   * @param eventName The name of the event.
   * @param listener The listener function.
   */
  on<K extends keyof T>(eventName: K, listener: (event: T[K]) => void): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName]!.push(listener);
  }

  /**
   * Removes a listener for a specific event.
   * @param eventName The name of the event.
   * @param listener The listener function to remove.
   */
  off<K extends keyof T>(eventName: K, listener: (event: T[K]) => void): void {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName]!.filter(
        (l) => l !== listener
      );
    }
  }

  /**
   * Emits an event.
   * @param eventName The name of the event.
   * @param event The event data.
   */
  emit<K extends keyof T>(eventName: K, event: T[K]): void {
    if (this.listeners[eventName]) {
      this.listeners[eventName]!.forEach((listener) => listener(event));
    }
  }
  
  /**
   * Sets the maximum number of listeners.
   * @param n The maximum number of listeners.
   */
  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }
  
  /**
   * Adds a one-time listener for a specific event.
   * @param eventName The name of the event.
   * @param listener The listener function.
   */
  once<K extends keyof T>(eventName: K, listener: (event: T[K]) => void): void {
    const onceWrapper = (event: T[K]) => {
      this.off(eventName, onceWrapper);
      listener(event);
    };
    this.on(eventName, onceWrapper);
  }
  
  /**
   * Removes all listeners for a specific event or all events.
   * @param eventName Optional event name.
   */
  removeAllListeners<K extends keyof T>(eventName?: K): void {
    if (eventName) {
      this.listeners[eventName] = [];
    } else {
      this.listeners = {};
    }
  }
  
  /**
   * Returns the number of listeners for a specific event.
   * @param eventName The name of the event.
   */
  listenerCount<K extends keyof T>(eventName: K): number {
    return this.listeners[eventName]?.length || 0;
  }
}
