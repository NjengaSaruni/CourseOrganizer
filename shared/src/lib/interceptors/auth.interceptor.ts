/**
 * Shared Auth Interceptor
 * Adds Authorization header to HTTP requests
 */
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  
  // Get token synchronously (for backward compatibility)
  // In mobile app, this should use the sync method
  let token = authService.getAuthTokenSync();
  
  // If no token from service, try getting from storage directly (for logout scenarios)
  if (!token && req.url.includes('/logout/')) {
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('authToken');
    }
    console.log('Auth interceptor: Found token in storage for logout:', token ? 'Yes' : 'No');
  }
  
  if (token) {
    console.log('Auth interceptor: Adding Authorization header for', req.url);
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Token ${token}`)
    });
    return next(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        try {
          const message = err?.error?.detail || err?.error?.message || '';
          const status = err?.status;
          if (status === 401 && typeof message === 'string' && message.toLowerCase().includes('invalid token')) {
            authService.handleInvalidTokenLogout();
            return throwError(() => err);
          }
        } catch {}
        return throwError(() => err);
      })
    );
  } else {
    console.log('Auth interceptor: No token found for', req.url);
  }
  
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Handle 401 errors even without token
      if (err?.status === 401) {
        try {
          const message = err?.error?.detail || err?.error?.message || '';
          if (typeof message === 'string' && message.toLowerCase().includes('invalid token')) {
            authService.handleInvalidTokenLogout();
          }
        } catch {}
      }
      return throwError(() => err);
    })
  );
};

