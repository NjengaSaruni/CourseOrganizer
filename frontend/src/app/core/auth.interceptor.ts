import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // For logout requests, try to get token directly from localStorage
  // to avoid issues with token being cleared before the request
  let token = authService.getAuthToken();
  
  // If no token from service, try localStorage directly (for logout scenarios)
  if (!token && req.url.includes('/logout/')) {
    token = localStorage.getItem('authToken');
    console.log('Auth interceptor: Found token in localStorage for logout:', token ? 'Yes' : 'No');
  }
  
  if (token) {
    console.log('Auth interceptor: Adding Authorization header for', req.url);
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Token ${token}`)
    });
    return next(authReq).pipe(
      catchError((err: any) => {
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
    catchError((err: any) => {
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
};