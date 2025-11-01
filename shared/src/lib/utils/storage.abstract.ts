/**
 * Abstract Storage Interface
 * Provides a platform-agnostic storage abstraction
 * Implementations can use localStorage (web) or @capacitor/preferences (mobile)
 */
export abstract class StorageService {
  abstract getItem(key: string): Promise<string | null> | string | null;
  abstract setItem(key: string, value: string): Promise<void> | void;
  abstract removeItem(key: string): Promise<void> | void;
  abstract clear(): Promise<void> | void;
  
  // Synchronous version for backward compatibility
  getItemSync(key: string): string | null {
    // Default implementation - subclasses can override
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  }
}

