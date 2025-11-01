/**
 * Mobile Storage Implementation
 * For mobile apps - uses localStorage (works in Capacitor WebView)
 * 
 * Note: localStorage works perfectly in Capacitor apps since they run in a WebView.
 * For Capacitor 7+, you can optionally install @capacitor/preferences and it will
 * be used automatically if available. For now, localStorage is sufficient.
 */
import { Injectable } from '@angular/core';
import { StorageService } from './storage.abstract';

@Injectable({
  providedIn: 'root'
})
export class CapacitorStorageService extends StorageService {
  private preferences: any = null;
  private useCapacitorPreferences = false;

  constructor() {
    super();
    // Try to use Capacitor Preferences if available (Capacitor 7+)
    this.initializePreferences();
  }

  private async initializePreferences(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      // Try to import Capacitor Preferences (only available in Capacitor 7+)
      // Dynamic import with proper error handling - TypeScript will check this at runtime
      // @ts-expect-error - Module may not exist at compile time (Capacitor 5 doesn't have it)
      const preferencesModule = await import('@capacitor/preferences');
      
      if (preferencesModule && preferencesModule.Preferences) {
        this.preferences = preferencesModule.Preferences;
        this.useCapacitorPreferences = true;
        console.log('Using @capacitor/preferences for storage');
        return;
      }
    } catch (error) {
      // Capacitor Preferences not available (e.g., Capacitor 5)
      // This is fine - we'll use localStorage which works in WebView
      // Silently continue - no need to log as this is expected for Capacitor 5
    }
    
    // Use localStorage (works in all Capacitor versions via WebView)
    this.useCapacitorPreferences = false;
  }

  async getItem(key: string): Promise<string | null> {
    if (this.useCapacitorPreferences && this.preferences) {
      try {
        const result = await this.preferences.get({ key });
        return result.value;
      } catch (error) {
        console.error('Error getting item from Capacitor preferences:', error);
        // Fall through to localStorage
      }
    }
    
    // Use localStorage (works in Capacitor WebView)
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  }

  async setItem(key: string, value: string): Promise<void> {
    if (this.useCapacitorPreferences && this.preferences) {
      try {
        await this.preferences.set({ key, value });
        return;
      } catch (error) {
        console.error('Error setting item in Capacitor preferences:', error);
        // Fall through to localStorage
      }
    }
    
    // Use localStorage (works in Capacitor WebView)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (this.useCapacitorPreferences && this.preferences) {
      try {
        await this.preferences.remove({ key });
        return;
      } catch (error) {
        console.error('Error removing item from Capacitor preferences:', error);
        // Fall through to localStorage
      }
    }
    
    // Use localStorage (works in Capacitor WebView)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    if (this.useCapacitorPreferences && this.preferences) {
      try {
        await this.preferences.clear();
        return;
      } catch (error) {
        console.error('Error clearing Capacitor preferences:', error);
        // Fall through to localStorage
      }
    }
    
    // Use localStorage (works in Capacitor WebView)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
    }
  }
}

