/**
 * Mobile Platform Providers
 * Provides Capacitor preferences-based storage and config for mobile app
 */
import { Injectable, Provider } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CapacitorStorageService } from '../utils/storage.mobile';
import { StorageService } from '../utils/storage.abstract';
import { ConfigService, CONFIG_SERVICE, AppConfig } from '../services/config.service';
import { AuthService } from '../services/auth.service';

export class MobileConfigService extends ConfigService {
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

export function provideMobileAuthServices(config: AppConfig): Provider[] {
  console.log('🔧 [PROVIDERS] Setting up mobile auth services with config:', config);
  
  return [
    // Provide dependencies first (order matters!)
    { 
      provide: StorageService, 
      useClass: CapacitorStorageService,
      deps: []
    },
    { 
      provide: CONFIG_SERVICE, 
      useFactory: () => {
        console.log('🔧 [PROVIDERS] Creating MobileConfigService');
        const service = new MobileConfigService(config);
        console.log('🔧 [PROVIDERS] MobileConfigService created');
        return service;
      },
      deps: []
    },
    // Provide AuthService using factory to ensure dependencies are available
    // This prevents circular dependencies and ensures proper initialization order
    {
      provide: AuthService,
      useFactory: (http: HttpClient, storage: StorageService, configService: any) => {
        console.log('🔧 [PROVIDERS] Creating AuthService with dependencies');
        console.log('🔧 [PROVIDERS] Dependencies resolved:', {
          http: !!http,
          storage: !!storage,
          configService: !!configService
        });
        const service = new AuthService(http, storage, configService);
        console.log('🔧 [PROVIDERS] AuthService created successfully');
        return service;
      },
      deps: [HttpClient, StorageService, CONFIG_SERVICE]
    }
  ];
}

