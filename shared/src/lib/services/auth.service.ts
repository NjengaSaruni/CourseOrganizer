/**
 * Shared Authentication Service
 * Platform-agnostic authentication service that works for both web and mobile
 */
import { Injectable, Inject, Optional, inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError, switchMap, mergeMap } from 'rxjs/operators';
import { User, LoginData, AuthResponse, RegistrationData, RegistrationResponse } from '../models/user.model';
import { StorageService } from '../utils/storage.abstract';
import { ConfigService, CONFIG_SERVICE } from './config.service';

@Injectable()
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private readonly USER_KEY = 'currentUser';
  private readonly TOKEN_KEY = 'authToken';

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    @Inject(CONFIG_SERVICE) private config: ConfigService
  ) {
    console.log('🔐 [AUTH] AuthService constructor called');
    console.log('🔐 [AUTH] StorageService provided:', !!storage);
    console.log('🔐 [AUTH] ConfigService provided:', !!config, config);
    console.log('🔐 [AUTH] HttpClient provided:', !!http);
    
    if (!config) {
      console.error('❌ [AUTH] ConfigService is null! This will cause errors.');
      console.error('❌ [AUTH] Make sure CONFIG_SERVICE is provided in AppModule');
    }
    
    // Check for existing session on service initialization
    this.checkExistingSession().catch(err => {
      console.error('❌ [AUTH] Error checking existing session:', err);
    });
  }

  private async checkExistingSession(): Promise<void> {
    const savedUser = await this.getStoredUser();
    if (savedUser) {
      try {
        const user = typeof savedUser === 'string' ? JSON.parse(savedUser) : savedUser;
        this.currentUserSubject.next(user);
        this.setAnalyticsUserId(user);
      } catch (error) {
        await this.storage.removeItem(this.USER_KEY);
      }
    }
  }

  private async getStoredUser(): Promise<string | null> {
    const user = await this.storage.getItem(this.USER_KEY);
    return user;
  }

  login(email: string, password: string): Observable<boolean> {
    const loginData: LoginData = { email, password };
    const apiUrl = this.config.getApiUrl();
    
    return this.http.post<AuthResponse>(`${apiUrl}/directory/auth/login/`, loginData).pipe(
      mergeMap(async (response: AuthResponse) => {
        // Store token and user data
        await this.storage.setItem(this.TOKEN_KEY, response.token);
        await this.storage.setItem(this.USER_KEY, JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        this.setAnalyticsUserId(response.user);
        return true;
      }),
      catchError((error: any) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(registrationData: RegistrationData): Observable<RegistrationResponse> {
    const apiUrl = this.config.getApiUrl();
    return this.http.post<RegistrationResponse>(`${apiUrl}/directory/register/student/`, registrationData).pipe(
      map((response: RegistrationResponse) => {
        console.log('Registration successful:', response);
        return response;
      }),
      catchError((error: any) => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    const apiUrl = this.config.getApiUrl();
    return this.http.post(`${apiUrl}/directory/auth/logout/`, {}).pipe(
      mergeMap(async (response: any) => {
        // Always clear local data regardless of server response
        await this.clearLocalAuth();
        console.log('Logout successful:', response.message || 'Logged out');
        return response;
      }),
      catchError(async (error: any) => {
        // Even if logout fails on server, clear local data
        console.warn('Logout request failed, but clearing local data:', error);
        await this.clearLocalAuth();
        return throwError(() => error);
      })
    );
  }

  // Force client-side logout without contacting the server
  async handleInvalidTokenLogout(): Promise<void> {
    await this.clearLocalAuth();
    
    // Platform-specific redirect
    if (typeof window !== 'undefined') {
      // For web, redirect to login
      window.location.href = '/login';
    }
    // For mobile, navigation will be handled by the app router
  }

  private async clearLocalAuth(): Promise<void> {
    this.currentUserSubject.next(null);
    await this.storage.removeItem(this.USER_KEY);
    await this.storage.removeItem(this.TOKEN_KEY);
    this.setAnalyticsUserId(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  async isAuthenticated(): Promise<boolean> {
    const user = this.currentUserSubject.value;
    const token = await this.getAuthToken();
    return user !== null && !!token;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.is_admin === true;
  }

  isClassRep(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.class_rep_role?.is_active === true;
  }

  canUploadContent(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.can_upload_content === true;
  }

  isAdminOrClassRep(): boolean {
    return this.isAdmin() || this.canUploadContent();
  }

  refreshUserData(): Observable<User> {
    const apiUrl = this.config.getApiUrl();
    return this.http.get<User>(`${apiUrl}/directory/auth/profile/`).pipe(
      mergeMap(async (user: User) => {
        // Update stored user data
        await this.storage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError((error: any) => {
        console.error('Error refreshing user data:', error);
        return throwError(() => error);
      })
    );
  }

  async getAuthToken(): Promise<string | null> {
    const token = await this.storage.getItem(this.TOKEN_KEY);
    return token;
  }

  getAuthTokenSync(): string | null {
    // Synchronous version for backward compatibility
    // Only works with localStorage implementation
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private setAnalyticsUserId(user: User | null): void {
    try {
      const w = typeof window !== 'undefined' ? (window as any) : null;
      if (w && typeof w.gtag === 'function') {
        if (user && user.id != null) {
          w.gtag('set', { user_id: String(user.id) });
        } else {
          w.gtag('set', { user_id: null });
        }
      }
    } catch (_) {
      // no-op if analytics not available
    }
  }

  // Admin methods
  getPendingRegistrations(): Observable<User[]> {
    const apiUrl = this.config.getApiUrl();
    console.log('Making API call to:', `${apiUrl}/admin/pending-registrations/`);
    return this.http.get<User[]>(`${apiUrl}/admin/pending-registrations/`);
  }

  getConfirmedRegistrations(): Observable<User[]> {
    const apiUrl = this.config.getApiUrl();
    return this.http.get<User[]>(`${apiUrl}/admin/confirmed-registrations/`);
  }

  approveUser(userId: number): Observable<any> {
    const apiUrl = this.config.getApiUrl();
    return this.http.post(`${apiUrl}/admin/approve-user/${userId}/`, {});
  }

  rejectUser(userId: number): Observable<any> {
    const apiUrl = this.config.getApiUrl();
    return this.http.post(`${apiUrl}/admin/reject-user/${userId}/`, {});
  }

  // Timetable management methods
  getTimetableEntries(year?: number, semester?: number): Observable<any[]> {
    const apiUrl = this.config.getApiUrl();
    let url = `${apiUrl}/timetable/`;
    const params = [];
    if (year) params.push(`year=${year}`);
    if (semester) params.push(`semester=${semester}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get<any>(url).pipe(
      map((response: any) => {
        // Handle both paginated and non-paginated responses
        if (response.results) {
          return response.results;
        }
        return response;
      })
    );
  }

  createTimetableEntry(entry: any): Observable<any> {
    const apiUrl = this.config.getApiUrl();
    return this.http.post(`${apiUrl}/timetable/create/`, entry);
  }

  updateTimetableEntry(id: number, entry: any): Observable<any> {
    const apiUrl = this.config.getApiUrl();
    return this.http.put(`${apiUrl}/timetable/${id}/update/`, entry);
  }

  deleteTimetableEntry(id: number): Observable<any> {
    const apiUrl = this.config.getApiUrl();
    return this.http.delete(`${apiUrl}/timetable/${id}/delete/`);
  }
}

