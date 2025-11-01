# iOS Debugging Guide - Error -203

## Comprehensive Logging Added

I've added extensive logging throughout the app to help identify where the -203 error occurs.

### Log Categories

The logs use emoji prefixes for easy filtering in Xcode console:

- 🚀 `[MAIN]` - Application bootstrap and main entry point
- 📱 `[APP]` - AppComponent lifecycle and initialization
- 📦 `[MODULE]` - AppModule construction and providers
- 🔧 `[POLYFILLS]` - Polyfills and Zone.js loading
- ✅ Success messages
- ❌ Error messages
- ⚠️ Warning messages

## How to View Logs in Xcode

### Method 1: Xcode Console
1. Open Xcode
2. Run the app on simulator/device
3. Open the Debug Area: View → Debug Area → Show Debug Area (Cmd+Shift+Y)
4. Look for logs with emoji prefixes

### Method 2: Device Console (Safari)
1. Connect iOS device to Mac
2. Open Safari → Develop → [Your Device] → [Your App]
3. Open Web Inspector
4. Go to Console tab
5. Filter by typing emoji or log category

### Method 3: Xcode Device Logs
1. Window → Devices and Simulators
2. Select your device
3. Click "Open Console" button
4. Filter by your app name

## What to Look For

### Expected Log Sequence
```
🔧 [POLYFILLS] Loading polyfills...
🔧 [POLYFILLS] Zone flags loading...
🔧 [POLYFILLS] Zone.js loading...
✅ [POLYFILLS] Zone.js loaded
🚀 [MAIN] Starting application bootstrap...
🚀 [MAIN] Platform: Browser
🚀 [MAIN] Location: capacitor://localhost/...
🚀 [MAIN] User Agent: ...
✅ [MAIN] Capacitor detected
✅ [MAIN] Capacitor platform: ios
✅ [MAIN] Capacitor isNative: true
📦 [MODULE] AppModule constructed
📦 [MODULE] Environment: {...}
📱 [APP] AppComponent constructor called
📱 [APP] Current URL: capacitor://localhost/...
📱 [APP] Base href: /
📱 [APP] Capacitor available: {...}
📱 [APP] ngOnInit called
📱 [APP] Document ready state: complete
📱 [APP] app-root element found: true
✅ [MAIN] Application bootstrap successful
```

### If Error -203 Appears

Look for:
1. **Where the logs stop** - Last successful log shows where it fails
2. **JavaScript errors** - Look for `❌ [APP] Global error:` or `❌ [GLOBAL] Error caught:`
3. **Missing Capacitor** - If you don't see `✅ [MAIN] Capacitor detected`, Capacitor isn't initializing
4. **Module loading errors** - Check if polyfills or modules fail to load

## Common Issues and Solutions

### Issue: Logs stop at "Starting application bootstrap"
**Possible causes:**
- Zone.js failed to load
- Angular bootstrap failed
- Missing dependencies

**Check:**
- Look for errors after `🚀 [MAIN] Starting application bootstrap...`
- Check Xcode console for missing module errors
- Verify `www` folder has all files

### Issue: Logs show Capacitor not detected
**Possible causes:**
- Capacitor bridge not initialized
- iOS native code issue
- Wrong Capacitor version

**Solution:**
```bash
cd mobile-app
npm run build
npx cap sync ios
# In Xcode: Clean Build Folder (Shift+Cmd+K)
# Rebuild and run
```

### Issue: AppComponent never logs
**Possible causes:**
- Bootstrap failed before component initialization
- Routing error
- Module provider error

**Check:**
- Look for `❌ [MAIN] Bootstrap error:`
- Check for provider injection errors
- Verify environment configuration

## Next Steps After Getting Logs

1. **Copy all logs** from Xcode console
2. **Look for the last successful log** - this shows how far the app got
3. **Find the first error** - this is likely the root cause
4. **Check Capacitor status** - verify it's detected and platform is correct

## Additional Debugging

### Enable More Verbose Logging

If needed, you can add more logs:

```typescript
// In any component/service
console.log('🔍 [CUSTOM] Your debug message here');
```

### Check Network Requests

If the error relates to loading assets:
1. Safari Web Inspector → Network tab
2. Look for failed requests (red)
3. Check file paths and status codes

### Verify www Directory

```bash
cd mobile-app
ls -la www/
# Should see: index.html, main.*.js, styles.*.css, etc.

# Check if files are in iOS project
ls -la ios/App/App/public/
# Should match www/ contents
```

## Reporting Issues

When reporting the -203 error, include:
1. Complete log output from Xcode
2. Last successful log message
3. First error message after success
4. Device/simulator info
5. iOS version
6. Xcode version

---

**Status**: Comprehensive logging added. Rebuild, sync, and check Xcode console for detailed diagnostics.

