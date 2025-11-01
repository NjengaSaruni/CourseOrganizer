# Fix npm Cache Permission Issues

## Problem
npm install fails due to permission issues in the cache directory:
```
npm error errno EEXIST
npm error Invalid response body while trying to fetch https://registry.npmjs.org/@eslint%2fobject-schema: EACCES: permission denied
```

## Solutions

### Option 1: Fix npm Cache Permissions (Recommended)

Run this command in your terminal:
```bash
sudo chown -R $(whoami) "/Users/ptah/.npm"
npm cache clean --force
cd mobile-app
npm install
```

### Option 2: Use a Different Cache Location

Temporarily use a different cache location:
```bash
npm config set cache ~/npm-cache
npm cache clean --force
cd mobile-app
npm install
```

### Option 3: Use npm with --legacy-peer-deps

Try installing with legacy peer deps flag:
```bash
cd mobile-app
npm install --legacy-peer-deps
```

### Option 4: Use Homebrew to Install Dependencies

If you have Homebrew:
```bash
# Install using brew if available
brew install node
npm config set cache ~/.npm
cd mobile-app
npm install
```

### Option 5: Nuclear Option - Complete Clean Slate

```bash
# Remove all npm cache
sudo rm -rf /Users/ptah/.npm

# Remove any existing node_modules
cd mobile-app
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## After Installation

Once npm install succeeds, proceed with Capacitor setup:

```bash
# Build the app
npm run build

# Add Capacitor platforms
npx cap add ios
npx cap add android

# Sync with native projects
npx cap sync

# Run on simulator/device
npx cap run ios      # for iOS
npx cap run android  # for Android
```

## Quick Start After Fixing

```bash
# Terminal 1: Fix cache
sudo chown -R $(whoami) "/Users/ptah/.npm"
npm cache clean --force

# Terminal 2: Install
cd /Users/ptah/course-organizer/mobile-app
npm install

# Terminal 3: Build and run
npm run build
npx cap add ios
npx cap add android
npx cap sync
npx cap run ios
```

