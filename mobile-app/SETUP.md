# Mobile App Setup Instructions

## Initial Setup

Due to npm cache permission issues, follow these steps to set up the mobile app:

### Step 1: Fix npm cache permissions

```bash
sudo chown -R $(whoami) "/Users/ptah/.npm"
npm cache clean --force
```

### Step 2: Install dependencies

```bash
cd mobile-app
npm install
```

### Step 3: Initialize Capacitor

```bash
# Add iOS platform
npx cap add ios

# Add Android platform
npx cap add android

# Sync with native projects
npx cap sync
```

### Step 4: Verify setup

```bash
# Check that everything installed correctly
npm run lint
npm test
```

## Development Workflow

### Start Development Server

```bash
# Start Ionic dev server
npm start
# or
ionic serve

# App will open at http://localhost:8100
```

### Testing on Devices

#### iOS
```bash
# Build web assets
ionic build

# Sync with native project
npx cap sync

# Open in Xcode
npx cap open ios

# In Xcode: Build and Run on simulator or device
```

#### Android
```bash
# Build web assets
ionic build

# Sync with native project
npx cap sync

# Open in Android Studio
npx cap open android

# In Android Studio: Build and Run on emulator or device
```

### Common Commands

```bash
# Development
npm start                   # Start dev server
npm run build              # Build for production
npm test                   # Run unit tests
npm run lint              # Run linter

# Capacitor
npm run cap:sync          # Sync web code with native
npm run cap:open:ios      # Open iOS project
npm run cap:open:android  # Open Android project

# Ionic
ionic generate page home   # Generate new page
ionic generate service api # Generate new service
ionic generate component card # Generate new component
```

## Project Structure

```
mobile-app/
├── src/
│   ├── app/
│   │   ├── app.component.ts        # Root component
│   │   ├── app.module.ts           # Root module
│   │   ├── app-routing.module.ts   # Root routing
│   │   ├── tabs/                   # Tabs layout
│   │   ├── tab1/                   # Tab 1 feature
│   │   ├── tab2/                   # Tab 2 feature
│   │   ├── tab3/                   # Tab 3 feature
│   │   └── explore-container/      # Shared container
│   ├── theme/
│   │   ├── variables.scss          # Ionic theme variables
│   │   └── global.scss             # Global styles
│   ├── index.html                  # Entry HTML
│   └── main.ts                     # Entry TypeScript
├── www/                            # Build output
├── ios/                            # iOS native project
├── android/                        # Android native project
├── angular.json                    # Angular config
├── ionic.config.json               # Ionic config
├── capacitor.config.json           # Capacitor config
└── package.json                    # Dependencies
```

## Integration with Main App

### Sharing Code

To share business logic with the web frontend:

```typescript
// In mobile app
import { AuthService } from '../../../../../frontend/src/app/core/auth.service';
import { User } from '../../../../../frontend/src/app/core/auth.service';

// Or set up proper path aliases in tsconfig.json
```

### Environment Configuration

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  wsUrl: 'ws://localhost:8000/ws'
};
```

Create `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-domain.com/api',
  wsUrl: 'wss://your-domain.com/ws'
};
```

## Next Steps

1. ✅ Run `npm install`
2. ✅ Set up Capacitor platforms
3. 🔄 Configure environment files
4. 🔄 Set up API service integration
5. 🔄 Implement authentication
6. 🔄 Build dashboard feature
7. 🔄 Add other features (timetable, materials, etc.)

## Troubleshooting

### npm install fails with cache errors

```bash
sudo chown -R $(whoami) "/Users/ptah/.npm"
rm -rf /Users/ptah/.npm/_cacache
npm install
```

### Capacitor sync fails

```bash
rm -rf ios android
npx cap add ios
npx cap add android
npx cap sync
```

### Build fails

```bash
rm -rf node_modules www
npm install
ionic build
```

### iOS pod install issues

```bash
cd ios/App
pod deintegrate
pod install
cd ../..
```

---

**Note**: This setup assumes you have Xcode (for iOS) and Android Studio (for Android) installed. If not, install them first.

