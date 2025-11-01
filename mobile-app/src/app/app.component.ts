import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  appName = 'Course Organizer';
  
  constructor(private router: Router) {
    console.log('📱 [APP] AppComponent constructor called');
    console.log('📱 [APP] Current URL:', window.location.href);
    console.log('📱 [APP] Base href:', document.querySelector('base')?.getAttribute('href') || 'not set');
    
    // Check Capacitor status
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      const Capacitor = (window as any).Capacitor;
      console.log('📱 [APP] Capacitor available:', {
        platform: Capacitor.getPlatform(),
        isNative: Capacitor.isNativePlatform(),
        isPluginAvailable: typeof Capacitor.Plugins !== 'undefined'
      });
    }
    
    // Monitor routing
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        console.log('📱 [APP] Navigation ended:', event.url);
      });
  }
  
  ngOnInit() {
    console.log('📱 [APP] ngOnInit called');
    console.log('📱 [APP] Document ready state:', document.readyState);
    
    // Log any unhandled errors
    window.addEventListener('error', (event) => {
      console.error('❌ [APP] Global error:', event.error);
      console.error('❌ [APP] Error message:', event.message);
      console.error('❌ [APP] Error source:', event.filename, 'line', event.lineno);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('❌ [APP] Unhandled promise rejection:', event.reason);
    });
    
    // Check if app-root is in DOM
    const appRoot = document.querySelector('app-root');
    console.log('📱 [APP] app-root element found:', !!appRoot);
    
    // Log all script and link tags
    const scripts = Array.from(document.querySelectorAll('script')).map((s) => (s as HTMLScriptElement).src || 'inline');
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((l) => (l as HTMLLinkElement).href);
    console.log('📱 [APP] Scripts loaded:', scripts);
    console.log('📱 [APP] Stylesheets loaded:', stylesheets);
  }
}
