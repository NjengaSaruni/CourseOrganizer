# Course Organizer Mobile App

Native mobile application for iOS and Android built with Ionic 8 + Angular 20 + Capacitor.

## Setup Instructions

### Prerequisites

```bash
# Make sure npm cache doesn't have permission issues
sudo chown -R $(whoami) "/Users/ptah/.npm"

# Or if you prefer, use yarn or pnpm instead
```

### Installation

```bash
cd mobile-app

# Install dependencies
npm install

# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Add iOS and Android platforms
npx cap add ios
npx cap add android

# Initialize Capacitor
npx cap init "Course Organizer" "com.riverlearn.courseorganizer"
```

### Development

```bash
# Start development server
npm start
# or
ionic serve

# Build for production
npm run build

# Build and sync with native projects
ionic build
npx cap sync
```

### Running on Devices

#### iOS
```bash
# Open in Xcode
npx cap open ios

# Or build and run from command line
npx cap run ios
```

#### Android
```bash
# Open in Android Studio
npx cap open android

# Or build and run from command line
npx cap run android
```

## Project Structure

```
mobile-app/
├── src/
│   ├── app/               # Main app code
│   │   ├── core/         # Services, guards, models
│   │   ├── features/     # Feature modules
│   │   └── shared/       # Shared components
│   ├── theme/            # Styling and theming
│   └── main.ts           # App entry point
├── angular.json           # Angular configuration
├── ionic.config.json      # Ionic configuration
├── capacitor.config.json  # Capacitor configuration
└── package.json          # Dependencies
```

## Configuration

### Capacitor Configuration

Edit `capacitor.config.json` to customize:
- App name and ID
- Server configuration
- Plugins
- Permissions

### Ionic Configuration

Edit `ionic.config.json` to customize:
- App name
- Integrations
- Build settings

## Integration with Web App

This mobile app shares business logic with the web frontend:

- **Services**: Import from `../frontend/src/app/core`
- **Models**: Import from `../frontend/src/app/core`
- **Utilities**: Import from `../frontend/src/app/shared`

## Themes and Styling

The app uses the University of Nairobi color palette:
- Primary: #2A68AF (Cerulean Blue)
- Navy: #122B40 (Elephant)
- Accent: #FF492C (Red Orange)

Customize theme in `src/theme/variables.scss`.

## Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e

# Run linting
npm run lint
```

## Building for Production

```bash
# Build web assets
ionic build --prod

# Sync with native projects
npx cap sync

# Build native apps
# iOS: Open in Xcode and Archive
# Android: Open in Android Studio and Build Bundle/APK
```

## Troubleshooting

### npm Cache Issues

If you encounter npm cache permission errors:
```bash
sudo chown -R $(whoami) "/Users/ptah/.npm"
npm cache clean --force
```

### Capacitor Sync Issues

If native projects are out of sync:
```bash
npx cap sync
```

### iOS Build Issues

```bash
cd ios
pod install
cd ..
npx cap sync ios
```

---

**Status**: In Development  
**Framework**: Ionic 8 + Angular 20  
**Native Bridge**: Capacitor 5

