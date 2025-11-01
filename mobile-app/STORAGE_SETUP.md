# Storage Setup for Mobile App

## Storage Solution

The mobile app uses **localStorage** for storage, which works perfectly in Capacitor apps since they run in a WebView environment.

### Why localStorage?

1. **Capacitor WebView Support**: Capacitor apps run in a native WebView, which fully supports the localStorage API
2. **No Additional Dependencies**: Works out of the box without installing extra packages
3. **Compatibility**: Works with Capacitor 5 (current version) and all future versions
4. **Performance**: Fast and reliable for key-value storage
5. **Persistence**: Data persists between app sessions

### Future: Capacitor Preferences (Optional)

If you upgrade to **Capacitor 7+** in the future, the storage service will automatically detect and use `@capacitor/preferences` if installed. The code already supports this upgrade path.

### Current Setup

- **Storage Service**: `CapacitorStorageService` uses localStorage
- **No Installation Required**: Works immediately
- **Shared Library**: Platform-agnostic storage abstraction handles everything

### Benefits

✅ No dependency conflicts  
✅ Immediate functionality  
✅ Works in all Capacitor versions  
✅ Easy to upgrade later if needed  
✅ Synchronous API (faster for simple operations)

### Usage

The storage service is automatically configured when you use `provideMobileAuthServices`. You don't need to do anything - it just works!

```typescript
// Already configured in app.module.ts
...provideMobileAuthServices({
  apiUrl: environment.apiUrl,
  wsUrl: environment.wsUrl,
  production: environment.production
})
```

### Testing

Storage works immediately:
- Login tokens are stored
- User data persists
- Session survives app restarts
- No additional setup needed

---

**Note**: If you later upgrade to Capacitor 7+, you can optionally install `@capacitor/preferences` and it will be used automatically. The code already supports this!

