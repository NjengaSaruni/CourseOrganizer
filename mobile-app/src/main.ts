import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

console.log('🚀 [MAIN] Starting application bootstrap...');
console.log('🚀 [MAIN] Platform:', typeof window !== 'undefined' ? 'Browser' : 'Unknown');
console.log('🚀 [MAIN] Location:', typeof window !== 'undefined' ? window.location.href : 'N/A');
console.log('🚀 [MAIN] User Agent:', typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A');

// Check for Capacitor
if (typeof window !== 'undefined' && (window as any).Capacitor) {
  console.log('✅ [MAIN] Capacitor detected');
  console.log('✅ [MAIN] Capacitor platform:', (window as any).Capacitor.getPlatform());
  console.log('✅ [MAIN] Capacitor isNative:', (window as any).Capacitor.isNativePlatform());
} else {
  console.log('⚠️ [MAIN] Capacitor not detected - running in browser');
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    console.log('✅ [MAIN] Application bootstrap successful');
  })
  .catch(err => {
    console.error('❌ [MAIN] Bootstrap error:', err);
    console.error('❌ [MAIN] Error stack:', err.stack);
    throw err;
  });
