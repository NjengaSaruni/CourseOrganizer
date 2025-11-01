# Course Organizer Shared Library

Shared TypeScript/Angular library containing reusable services, models, guards, and interceptors for both the web frontend and mobile app.

## Structure

```
shared/
├── src/
│   └── lib/
│       ├── models/          # Shared data models and interfaces
│       ├── services/        # Shared services (Auth, Config, etc.)
│       ├── guards/         # Route guards
│       ├── interceptors/   # HTTP interceptors
│       ├── utils/          # Utility classes (Storage abstractions)
│       └── providers/      # Platform-specific providers
├── tsconfig.json
├── package.json
└── README.md
```

## Usage

### In Web Frontend

```typescript
// app.config.ts or app.module.ts
import { provideWebAuthServices } from '@course-organizer/shared';
import { environment } from './environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideWebAuthServices({
      apiUrl: environment.apiUrl,
      wsUrl: environment.wsUrl,
      production: environment.production
    }),
    // ... other providers
  ]
};

// In components/services
import { AuthService, User } from '@course-organizer/shared';

@Injectable()
export class MyService {
  constructor(private auth: AuthService) {}
  
  getUser(): User | null {
    return this.auth.getCurrentUser();
  }
}
```

### In Mobile App

```typescript
// app.config.ts or app.module.ts
import { provideMobileAuthServices } from '@course-organizer/shared';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMobileAuthServices({
      apiUrl: 'https://api.courseorganizer.com/api',
      production: true
    }),
    // ... other providers
  ]
};
```

## Services

### AuthService

Provides authentication functionality:
- `login(email, password)` - User login
- `register(data)` - User registration
- `logout()` - User logout
- `isAuthenticated()` - Check if user is authenticated
- `getCurrentUser()` - Get current user
- `isAdmin()`, `isClassRep()`, etc. - Role checks

### ConfigService

Abstract service for app configuration. Each platform provides its own implementation.

### StorageService

Abstract storage service. Implementations:
- `LocalStorageService` - For web (uses localStorage)
- `CapacitorStorageService` - For mobile (uses @capacitor/preferences)

## Guards

### authGuard

Route guard that protects routes requiring authentication.

## Interceptors

### authInterceptor

HTTP interceptor that adds Authorization headers to requests and handles token invalidation.

## Building

```bash
cd shared
npm install
npm run build
```

The compiled output will be in `dist/`.

## Development

Since this is a shared library in a monorepo, you typically don't need to build it separately. Both frontend and mobile-app can import directly from source using TypeScript path aliases.

## TypeScript Path Aliases

Both `frontend` and `mobile-app` should have this in their `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@course-organizer/shared": ["../shared/src/lib"],
      "@course-organizer/shared/*": ["../shared/src/lib/*"]
    }
  }
}
```

