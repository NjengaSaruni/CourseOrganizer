/**
 * Web Platform Providers
 * Provides localStorage-based storage and environment-based config for web frontend
 */
import { Provider } from '@angular/core';
import { LocalStorageService } from '../utils/storage.local';
import { StorageService } from '../utils/storage.abstract';
import { ConfigService } from '../services/config.service';
import { AppConfig } from '../services/config.service';

export class WebConfigService extends ConfigService {
  constructor(private config: AppConfig) {
    super();
  }

  getConfig(): AppConfig {
    return this.config;
  }

  getApiUrl(): string {
    return this.config.apiUrl;
  }

  getWsUrl(): string | null {
    return this.config.wsUrl || null;
  }
}

export function provideWebAuthServices(config: AppConfig): Provider[] {
  return [
    { provide: StorageService, useClass: LocalStorageService },
    { provide: ConfigService, useFactory: () => new WebConfigService(config) }
  ];
}

