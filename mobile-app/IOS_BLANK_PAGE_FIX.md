# iOS Blank Page Fix

## Problem
iOS app shows blank page with Capacitor error: `⚡️ [error] - ERROR {"code":-203}`

## Solution 1: Hash Location Strategy (Applied)

Updated routing to use hash location strategy for better Capacitor compatibility:

```typescript
RouterModule.forRoot(routes, { 
  preloadingStrategy: PreloadAllModules,
  useHash: true  // Added for Capacitor compatibility
})
```

## Next Steps

1. **Rebuild and Sync**:
   ```bash
   cd mobile-app
   npm run build
   npx cap sync ios
   ```

2. **In Xcode**:
   - Clean build folder: Product → Clean Build Folder (Shift+Cmd+K)
   - Delete derived data (optional)
   - Build and run again

3. **If still blank**:
   - Check Xcode console for JavaScript errors
   - Verify `www` folder is copied to iOS project
   - Check that `index.html` loads correctly

## Alternative: Base Path Configuration

If hash routing doesn't work, try configuring base href:

In `angular.json`, add to build configuration:
```json
"baseHref": "./"
```

Or in `index.html`, change:
```html
<base href="./" />
```

## Debugging

1. **Check WebView Console**:
   - Connect device/simulator
   - In Xcode: Window → Devices and Simulators
   - Select device → View Device Logs
   - Look for JavaScript errors

2. **Verify Files Copied**:
   ```bash
   ls -la mobile-app/ios/App/App/public/
   ```
   Should contain `index.html` and other assets

3. **Test in Browser First**:
   ```bash
   npm start
   # Open http://localhost:8100
   # Verify routing works
   ```

## Common Causes

- **Missing build assets**: Run `npm run build` before `npx cap sync`
- **Routing issues**: Use hash location strategy for Capacitor
- **CORS/Network issues**: Check API URLs in environment files
- **JavaScript errors**: Check browser console or Xcode logs

---

**Status**: Hash location strategy applied. Rebuild and test.

