import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpInterceptorFn } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { provideMobileAuthServices, authInterceptor } from '@course-organizer/shared';

// For Angular modules, we need to provide the functional interceptor directly
// The HTTP_INTERCEPTORS token accepts functional interceptors in Angular 15+

// Global error handler for better logging
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('❌ [GLOBAL] Error caught:', error);
    console.error('❌ [GLOBAL] Error message:', error?.message);
    console.error('❌ [GLOBAL] Error stack:', error?.stack);
    
    // Log to Capacitor if available
    if (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins?.Device) {
      (window as any).Capacitor.Plugins.Device.getInfo().then((info: any) => {
        console.error('❌ [GLOBAL] Device info:', info);
      }).catch(() => {});
    }
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'ios', // Use iOS mode for consistent look
    }),
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    // Shared library providers - MUST be provided BEFORE AuthService is used
    // AuthService (providedIn: 'root') depends on StorageService and ConfigService
    ...provideMobileAuthServices({
      apiUrl: environment.apiUrl,
      wsUrl: environment.wsUrl,
      production: environment.production
    }),
    // Auth interceptor (functional interceptor)
    {
      provide: HTTP_INTERCEPTORS,
      useValue: authInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    console.log('📦 [MODULE] AppModule constructed');
    console.log('📦 [MODULE] Environment:', environment);
  }
}
