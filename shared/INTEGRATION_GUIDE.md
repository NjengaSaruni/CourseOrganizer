# Shared Library Integration Guide

This guide explains how to integrate the shared library into both the web frontend and mobile app.

## Overview

The shared library provides:
- **AuthService** - Authentication with platform-agnostic storage
- **Models** - User, RegistrationData, etc.
- **Guards** - Route protection
- **Interceptors** - HTTP request handling
- **Storage Abstraction** - Works with localStorage (web) or Capacitor (mobile)

## Web Frontend Integration

### Step 1: Update app.config.ts or app.module.ts

Replace the old auth service setup with the shared library providers:

```typescript
// app.config.ts (Standalone Angular)
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideWebAuthServices } from '@course-organizer/shared';
import { authInterceptor } from '@course-organizer/shared';
import { environment } from './environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Add shared library providers
    provideWebAuthServices({
      apiUrl: environment.apiUrl,
      wsUrl: environment.wsUrl,
      production: environment.production
    }),
  ],
};
```

### Step 2: Update Imports

Replace imports in your components/services:

```typescript
// Old
import { AuthService, User } from '../../core/auth.service';

// New
import { AuthService, User } from '@course-organizer/shared';
```

### Step 3: Update AuthService Usage

The API is mostly the same, but some methods are now async:

```typescript
// Before (synchronous)
const isAuth = this.authService.isAuthenticated();

// After (asynchronous)
const isAuth = await this.authService.isAuthenticated();

// Token access
// Before
const token = this.authService.getAuthToken();

// After (async)
const token = await this.authService.getAuthToken();

// Or use sync version if needed
const token = this.authService.getAuthTokenSync();
```

### Step 4: Update Guards

```typescript
// app.routes.ts
import { authGuard } from '@course-organizer/shared';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component'),
    canActivate: [authGuard]
  },
  // ... other routes
];
```

## Mobile App Integration

### Step 1: Install Capacitor Preferences (if not already installed)

```bash
cd mobile-app
npm install @capacitor/preferences
npx cap sync
```

### Step 2: Create Environment Configuration

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  wsUrl: 'ws://localhost:8000/ws'
};
```

### Step 3: Update app.module.ts or app.config.ts

```typescript
// app.config.ts or app.module.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideMobileAuthServices } from '@course-organizer/shared';
import { authInterceptor } from '@course-organizer/shared';
import { environment } from './environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Add shared library providers for mobile
    provideMobileAuthServices({
      apiUrl: environment.apiUrl,
      wsUrl: environment.wsUrl,
      production: environment.production
    }),
  ],
};
```

### Step 4: Use in Components

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '@course-organizer/shared';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html'
})
export class LoginPage implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    this.user = this.authService.getCurrentUser();
    const isAuth = await this.authService.isAuthenticated();
    if (isAuth) {
      // Navigate to dashboard
    }
  }

  login(email: string, password: string) {
    this.authService.login(email, password).subscribe({
      next: (success) => {
        if (success) {
          // Navigate to dashboard
        }
      },
      error: (err) => {
        console.error('Login failed:', err);
      }
    });
  }
}
```

## Migration Checklist

### For Web Frontend

- [ ] Update `app.config.ts` with `provideWebAuthServices`
- [ ] Replace all `import { AuthService } from './core/auth.service'` with `import { AuthService } from '@course-organizer/shared'`
- [ ] Update `app.routes.ts` to use shared `authGuard`
- [ ] Update HTTP client to use shared `authInterceptor`
- [ ] Update async method calls (`isAuthenticated()`, `getAuthToken()`)
- [ ] Remove old `frontend/src/app/core/auth.service.ts` (after migration)
- [ ] Test authentication flow

### For Mobile App

- [ ] Install `@capacitor/preferences`
- [ ] Create environment configuration
- [ ] Update `app.config.ts` with `provideMobileAuthServices`
- [ ] Add HTTP interceptor configuration
- [ ] Create login component using shared AuthService
- [ ] Test authentication flow on device/simulator

## Key Differences

### Storage

- **Web**: Uses `localStorage` (synchronous)
- **Mobile**: Uses `@capacitor/preferences` (asynchronous)

### Configuration

- **Web**: Uses environment files from `src/environments/`
- **Mobile**: Create your own environment configuration

### Async Methods

Some methods are now async in the shared library:
- `isAuthenticated()` - Returns `Promise<boolean>`
- `getAuthToken()` - Returns `Promise<string | null>`

Use `getAuthTokenSync()` for synchronous access (web only).

## Testing

After integration, test:

1. **Login Flow**
   - User can log in with email/password
   - Token is stored correctly
   - User data is available

2. **Session Persistence**
   - Close and reopen app
   - User should remain logged in (web)
   - User should remain logged in (mobile)

3. **Logout Flow**
   - User can log out
   - Token is cleared
   - User is redirected to login

4. **Protected Routes**
   - Unauthenticated users are redirected
   - Authenticated users can access protected routes

5. **Token Refresh**
   - Invalid tokens trigger logout
   - User is redirected to login

## Troubleshooting

### Import Errors

If you see "Cannot find module '@course-organizer/shared'":
1. Check `tsconfig.json` has the path alias
2. Restart TypeScript server in your IDE
3. Ensure the shared directory exists at `../shared/src/lib`

### Storage Not Working (Mobile)

- Ensure `@capacitor/preferences` is installed
- Run `npx cap sync` after installing
- Check that `provideMobileAuthServices` is used (not `provideWebAuthServices`)

### Authentication Not Persisting

- Check that storage provider is correctly configured
- For mobile, verify Capacitor preferences plugin is working
- Check browser console/device logs for errors

## Next Steps

After successful integration:
1. Gradually migrate other services (CourseService, CommunicationService, etc.)
2. Extract shared models and interfaces
3. Create shared utilities as needed
4. Consider creating an Angular library build for better IDE support

