import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UserProfile {
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
  date_joined_formatted?: string;
  last_login?: string;
  last_login_formatted: string;
  class_display_name?: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  course_updates: boolean;
  schedule_changes: boolean;
}

export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/auth/profile/`, {
      headers: this.getHeaders()
    }).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  /**
   * Update user profile
   */
  updateProfile(profileData: ProfileUpdateRequest): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/auth/profile/update/`, profileData, {
      headers: this.getHeaders()
    }).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  /**
   * Change user password
   * Note: This endpoint may not be implemented yet
   */
  changePassword(passwordData: PasswordChangeRequest): Observable<{ message: string }> {
    // For now, return an error since the endpoint doesn't exist
    return new Observable(observer => {
      observer.error({
        error: {
          message: 'Password change functionality is not yet implemented. Please contact an administrator.'
        }
      });
    });
  }

  /**
   * Get notification settings
   * Note: This endpoint may not be implemented yet
   */
  getNotificationSettings(): Observable<NotificationSettings> {
    // For now, return default settings since the endpoint doesn't exist
    return new Observable(observer => {
      observer.next({
        email_notifications: true,
        sms_notifications: true,
        course_updates: true,
        schedule_changes: true
      });
      observer.complete();
    });
  }

  /**
   * Update notification settings
   * Note: This endpoint may not be implemented yet
   */
  updateNotificationSettings(settings: NotificationSettings): Observable<NotificationSettings> {
    // For now, return the settings as if they were saved
    return new Observable(observer => {
      observer.next(settings);
      observer.complete();
    });
  }

  /**
   * Export user data
   * Note: This endpoint may not be implemented yet
   */
  exportUserData(): Observable<{ message: string; download_url?: string }> {
    // For now, return a message indicating the feature is not available
    return new Observable(observer => {
      observer.next({
        message: 'Data export functionality is not yet implemented. Please contact an administrator.'
      });
      observer.complete();
    });
  }

  /**
   * Request account deletion
   * Note: This endpoint may not be implemented yet
   */
  requestAccountDeletion(): Observable<{ message: string }> {
    // For now, return a message indicating the feature is not available
    return new Observable(observer => {
      observer.next({
        message: 'Account deletion functionality is not yet implemented. Please contact an administrator.'
      });
      observer.complete();
    });
  }

  /**
   * Upload profile picture
   * Note: This endpoint may not be implemented yet
   */
  uploadProfilePicture(file: File): Observable<{ profile_picture_url: string }> {
    // For now, return an error since the endpoint doesn't exist
    return new Observable(observer => {
      observer.error({
        error: {
          message: 'Profile picture upload functionality is not yet implemented.'
        }
      });
    });
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get current user from subject
   */
  getCurrentUserValue(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  /**
   * Update current user in subject
   */
  updateCurrentUser(user: UserProfile): void {
    this.currentUserSubject.next(user);
  }
}
