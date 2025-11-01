/**
 * Shared Auth Guard
 * Protects routes requiring authentication
 */
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route: any, state: any) => {
  console.log('🔒 [GUARD] authGuard called for route:', route.path || route.url || 'unknown');
  console.log('🔒 [GUARD] State URL:', state?.url);
  
  try {
    const authService = inject(AuthService);
    console.log('🔒 [GUARD] AuthService injected successfully');
    const router = inject(Router);
    console.log('🔒 [GUARD] Router injected successfully');

    // Convert Promise to Observable for proper async handling
    return from(authService.isAuthenticated()).pipe(
      map((isAuth: boolean) => {
        console.log('🔒 [GUARD] isAuthenticated result:', isAuth);
        if (isAuth) {
          console.log('🔒 [GUARD] User authenticated, allowing access');
          return true;
        } else {
          console.log('🔒 [GUARD] User not authenticated, redirecting to login');
          // Redirect to login page
          router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
          return false;
        }
      }),
      catchError((error: any) => {
        console.error('❌ [GUARD] Error checking authentication:', error);
        router.navigate(['/login']);
        return of(false);
      })
    );
  } catch (error: any) {
    console.error('❌ [GUARD] Failed to inject dependencies:', error);
    console.error('❌ [GUARD] Error code:', error?.code);
    console.error('❌ [GUARD] Error message:', error?.message);
    // Return false to block access if we can't check auth
    return of(false);
  }
};

