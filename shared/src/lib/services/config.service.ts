/**
 * Configuration Service
 * Provides API URL and other configuration
 * Each app (web/mobile) should provide its own implementation
 */
import { Injectable, InjectionToken } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  wsUrl?: string;
  production: boolean;
}

export const CONFIG_SERVICE = new InjectionToken<ConfigService>('ConfigService');

@Injectable()
export abstract class ConfigService {
  abstract getConfig(): AppConfig;
  abstract getApiUrl(): string;
  abstract getWsUrl(): string | null;
}

