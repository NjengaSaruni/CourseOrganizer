import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  registration_number: string;
  phone_number: string;
  status: 'pending' | 'approved' | 'rejected';
  is_admin: boolean;
  user_type: 'student' | 'teacher' | 'admin';
  date_joined: string;
  date_joined_formatted?: string;
  last_login?: string;
  last_login_formatted: string;
  class_display_name?: string;
  profile_picture?: string;
  passcode?: string;
  smsSent?: boolean;
  class_rep_role?: {
    id: number;
    is_active: boolean;
    permissions: string[];
    student_class: number;
    student_class_name: string;
  };
}

export interface RegistrationData {
  first_name: string;
  last_name: string;
  email: string;
  registration_number: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegistrationResponse {
  user_id: number;
  message: string;
  status: string;
  program: string;
  class: string;
  graduation_year: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    // Check for existing session on service initialization
    this.checkExistingSession();
  }

  private checkExistingSession(): void {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
        // Ensure analytics user id is set if session exists
        this.setAnalyticsUserId(user);
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(email: string, password: string): Observable<boolean> {
    const loginData: LoginData = { email, password };
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/directory/auth/login/`, loginData).pipe(
      map(response => {
        // Store token and user data
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
        // Set analytics user id after successful login
        this.setAnalyticsUserId(response.user);
        return true;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(registrationData: RegistrationData): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.apiUrl}/directory/register/student/`, registrationData).pipe(
      map((response: RegistrationResponse) => {
        console.log('Registration successful:', response);
        return response;
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }


  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/directory/auth/logout/`, {}).pipe(
      map((response: any) => {
        // Always clear local data regardless of server response
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        // Clear analytics user id on logout
        this.setAnalyticsUserId(null);
        console.log('Logout successful:', response.message || 'Logged out');
        return response;
      }),
      catchError(error => {
        // Even if logout fails on server, clear local data
        console.warn('Logout request failed, but clearing local data:', error);
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        // Clear analytics user id even if server logout fails
        this.setAnalyticsUserId(null);
        // Don't throw error - we want logout to always succeed locally
        return throwError(() => error);
      })
    );
  }

  // Force client-side logout without contacting the server
  handleInvalidTokenLogout(): void {
    try {
      this.currentUserSubject.next(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    } finally {
      // Hard redirect to clear app state/routes
      window.location.href = '/login';
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null && !!localStorage.getItem('authToken');
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.is_admin === true;
  }

  refreshUserData(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/directory/auth/profile/`).pipe(
      map(user => {
        // Update stored user data
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError(error => {
        console.error('Error refreshing user data:', error);
        return throwError(() => error);
      })
    );
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private setAnalyticsUserId(user: User | null): void {
    try {
      const w = window as any;
      if (w && typeof w.gtag === 'function') {
        if (user && user.id != null) {
          // Apply to all measurement IDs
          w.gtag('set', { user_id: String(user.id) });
        } else {
          // Clear user_id
          w.gtag('set', { user_id: null });
        }
      }
    } catch (_) {
      // no-op if analytics not available
    }
  }

  // Admin methods
  getPendingRegistrations(): Observable<User[]> {
    console.log('Making API call to:', `${this.apiUrl}/admin/pending-registrations/`);
    console.log('Auth token:', this.getAuthToken() ? 'Present' : 'Missing');
    return this.http.get<User[]>(`${this.apiUrl}/admin/pending-registrations/`);
  }

  getConfirmedRegistrations(): Observable<User[]> {
    console.log('Making API call to:', `${this.apiUrl}/admin/confirmed-registrations/`);
    return this.http.get<User[]>(`${this.apiUrl}/admin/confirmed-registrations/`);
  }

  approveUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/approve-user/${userId}/`, {});
  }

  rejectUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/reject-user/${userId}/`, {});
  }

  // Timetable management methods
  getTimetableEntries(year?: number, semester?: number): Observable<any[]> {
    let url = `${this.apiUrl}/timetable/`;
    const params = [];
    if (year) params.push(`year=${year}`);
    if (semester) params.push(`semester=${semester}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        // Handle both paginated and non-paginated responses
        if (response.results) {
          return response.results;
        }
        return response;
      })
    );
  }

  createTimetableEntry(entry: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/timetable/create/`, entry);
  }

  updateTimetableEntry(id: number, entry: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/timetable/${id}/update/`, entry);
  }

  deleteTimetableEntry(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/timetable/${id}/delete/`);
  }

  // TODO: Passcode methods disabled until SMS service is properly configured
  // generatePasscode(userId: number): Observable<{passcode: string, message: string}> {
  //   return this.http.post<{passcode: string, message: string}>(`${this.apiUrl}/admin/generate-passcode/${userId}/`, {});
  // }

  // sendPasscodeSMS(userId: number, passcode: string): Observable<{message: string}> {
  //   return this.http.post<{message: string}>(`${this.apiUrl}/admin/send-passcode-sms/${userId}/`, { passcode });
  // }
}