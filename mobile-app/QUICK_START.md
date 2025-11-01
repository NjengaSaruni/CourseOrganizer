# Quick Start Guide

## ⚠️ npm Cache Permission Issue

The npm cache has permission issues that require manual fix. Choose one of these options:

### Option 1: Run the Setup Script (Easiest)

```bash
cd mobile-app
./setup.sh
```

This script will:
1. Fix npm cache permissions
2. Clean the cache
3. Install dependencies
4. Build the app
5. Set up Capacitor
6. Sync native projects

### Option 2: Manual Steps

```bash
# 1. Fix npm cache (requires password)
sudo chown -R $(whoami) "/Users/ptah/.npm"

# 2. Clean cache
npm cache clean --force

# 3. Install dependencies
cd mobile-app
npm install

# 4. Build app
npm run build

# 5. Setup Capacitor
npx cap add ios
npx cap add android
npx cap sync

# 6. Run on device
npx cap run ios      # iOS simulator/device
# OR
npx cap run android  # Android emulator/device
```

### Option 3: Alternative Cache Location

If you can't fix permissions:

```bash
cd mobile-app
npm config set cache ~/npm-cache
npm cache clean --force
npm install
npm run build
npx cap add ios && npx cap add android
npx cap sync
npx cap run ios
```

## After Setup

Once dependencies are installed, you can:

### Development
```bash
npm start           # Start dev server at http://localhost:8100
npm run build       # Build for production
npm test           # Run tests
```

### Capacitor Commands
```bash
npm run cap:sync         # Sync web code to native
npm run cap:open:ios     # Open in Xcode
npm run cap:open:android # Open in Android Studio
```

### Running on Devices
```bash
# iOS
npx cap run ios

# Android  
npx cap run android
```

## Troubleshooting

### npm install still fails
- Try: `npm install --legacy-peer-deps`
- Or: Use `yarn install` (if you have yarn installed)
- Or: Delete `package-lock.json` and try again

### Capacitor sync fails
- Make sure you ran `npm run build` first
- Check that `www` directory exists
- Try: `rm -rf ios android && npx cap add ios && npx cap add android`

### iOS build fails
```bash
cd ios/App
pod install
cd ../..
npx cap sync ios
```

### Android build fails
- Open in Android Studio
- Let it sync Gradle files
- Build from Android Studio

---

**Note**: The setup script (`setup.sh`) handles all of this automatically once you run it with sudo permissions.

