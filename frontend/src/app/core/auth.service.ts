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
  date_joined: string;
  class_display_name?: string;
  passcode?: string;
  smsSent?: boolean;
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
      map(() => {
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }),
      catchError(error => {
        // Even if logout fails on server, clear local data
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        return throwError(() => error);
      })
    );
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

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Admin methods
  getPendingRegistrations(): Observable<User[]> {
    console.log('Making API call to:', `${this.apiUrl}/admin/pending-registrations/`);
    console.log('Auth token:', this.getAuthToken() ? 'Present' : 'Missing');
    return this.http.get<User[]>(`${this.apiUrl}/admin/pending-registrations/`);
  }

  approveUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/approve-user/${userId}/`, {});
  }

  rejectUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/reject-user/${userId}/`, {});
  }

  generatePasscode(userId: number): Observable<{passcode: string, message: string}> {
    return this.http.post<{passcode: string, message: string}>(`${this.apiUrl}/admin/generate-passcode/${userId}/`, {});
  }

  sendPasscodeSMS(userId: number, passcode: string): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.apiUrl}/admin/send-passcode-sms/${userId}/`, { passcode });
  }
}