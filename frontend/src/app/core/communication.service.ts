import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ClassRepRole {
  id: number;
  user: number;
  user_name: string;
  user_registration_number: string;
  student_class: number;
  student_class_name: string;
  permissions: string[];
  permissions_display: string[];
  is_active: boolean;
  assigned_by: number;
  assigned_by_name: string;
  assigned_at: string;
  created_at: string;
  updated_at: string;
}

export interface ClassRepPermission {
  permissions: string[];
}

export interface Announcement {
  id?: number;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_pinned: boolean;
  expires_at: string | null;
  attachment?: string | null;
  student_class?: number | {
    id: number;
    display_name: string;
  };
  created_at?: string;
  updated_at?: string;
  sender?: {
    id: number;
    full_name: string;
    registration_number: string;
  };
  is_read?: boolean;
  read_count?: number;
  is_expired?: boolean;
}

export interface Class {
  id: number;
  name: string;
  program: string;
  graduation_year: number;
  display_name: string;
  student_count?: number;
  department?: {
    id: number;
    name: string;
    display_name: string;
    faculty: {
      id: number;
      name: string;
      school: {
        id: number;
        name: string;
        code: string;
      };
    };
  };
  is_default?: boolean;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  registration_number: string;
  phone_number: string;
  user_type: 'student' | 'teacher' | 'admin';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  student_class?: number | Class;
  class_display_name?: string;
  is_class_rep?: boolean;
}

export interface CommunicationStats {
  total_messages?: number;
  total_announcements?: number;
  total_polls?: number;
  active_polls?: number;
  class_reps_count?: number;
  class_messages?: number;
  private_messages_sent?: number;
  private_messages_received?: number;
  announcements?: number;
  polls?: number;
  is_class_rep?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Class Representative Management
  getClassReps(): Observable<ClassRepRole[]> {
    return this.http.get<ClassRepRole[]>(`${this.apiUrl}/communication/class-reps/`).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error fetching class reps:', error);
        return throwError(() => error);
      })
    );
  }

  createClassRep(classRepData: Partial<ClassRepRole>): Observable<ClassRepRole> {
    return this.http.post<ClassRepRole>(`${this.apiUrl}/communication/class-reps/`, classRepData).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error creating class rep:', error);
        return throwError(() => error);
      })
    );
  }

  updateClassRep(id: number, classRepData: Partial<ClassRepRole>): Observable<ClassRepRole> {
    return this.http.put<ClassRepRole>(`${this.apiUrl}/communication/class-reps/${id}/`, classRepData).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error updating class rep:', error);
        return throwError(() => error);
      })
    );
  }

  // Note: Class rep role is now included in user data, no separate endpoint needed

  deleteClassRep(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/communication/class-reps/${id}/`).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error deleting class rep:', error);
        return throwError(() => error);
      })
    );
  }

  updateClassRepPermissions(userId: number, permissions: string[]): Observable<ClassRepRole> {
    const permissionData: ClassRepPermission = { permissions };
    return this.http.post<ClassRepRole>(`${this.apiUrl}/communication/class-reps/${userId}/update-permissions/`, permissionData).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error updating class rep permissions:', error);
        return throwError(() => error);
      })
    );
  }

  getClassRepPermissions(userId: number): Observable<ClassRepRole> {
    return this.http.get<ClassRepRole>(`${this.apiUrl}/communication/class-reps/${userId}/permissions/`).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error fetching class rep permissions:', error);
        return throwError(() => error);
      })
    );
  }

  // Student Management (for admin to assign Class Reps)
  getStudents(status?: string): Observable<User[]> {
    const params: any = {};
    if (status) {
      params['status'] = status;
    }
    
    return this.http.get<any>(`${this.apiUrl}/directory/students/`, { params }).pipe(
      map(response => {
        // Handle different response formats
        if (Array.isArray(response)) {
          return response;
        }
        if (response && Array.isArray(response.results)) {
          return response.results;
        }
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching students:', error);
        return throwError(() => error);
      })
    );
  }

  getStudentsByClass(classId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/directory/students/?class_id=${classId}`).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error fetching students by class:', error);
        return throwError(() => error);
      })
    );
  }

  // Classes Management
  getClasses(): Observable<Class[]> {
    return this.http.get<any>(`${this.apiUrl}/school/classes/`).pipe(
      map(response => {
        // Handle different response formats
        if (Array.isArray(response)) {
          return response;
        }
        if (response && Array.isArray(response.results)) {
          return response.results;
        }
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching classes:', error);
        return throwError(() => error);
      })
    );
  }

  getDefaultClass(): Observable<Class> {
    return this.http.get<Class>(`${this.apiUrl}/school/classes/default/`).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error fetching default class:', error);
        return throwError(() => error);
      })
    );
  }

  // Communication Statistics
  getCommunicationStats(): Observable<CommunicationStats> {
    return this.http.get<CommunicationStats>(`${this.apiUrl}/communication/stats/`).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error fetching communication stats:', error);
        return throwError(() => error);
      })
    );
  }

  // Helper methods
  getAvailablePermissions(): string[] {
    return [
      'send_announcements',
      'moderate_messages',
      'view_all_messages',
      'manage_polls',
      'send_notifications'
    ];
  }

  getPermissionDisplayName(permission: string): string {
    const permissionNames: { [key: string]: string } = {
      'send_announcements': 'Send Announcements',
      'moderate_messages': 'Moderate Messages',
      'view_all_messages': 'View All Messages',
      'manage_polls': 'Manage Polls',
      'send_notifications': 'Send Notifications'
    };
    return permissionNames[permission] || permission;
  }

  getPermissionDescription(permission: string): string {
    const permissionDescriptions: { [key: string]: string } = {
      'send_announcements': 'Can send official announcements to the class',
      'moderate_messages': 'Can moderate and delete inappropriate messages',
      'view_all_messages': 'Can view private messages between students',
      'manage_polls': 'Can create and manage polls for class decisions',
      'send_notifications': 'Can send push notifications to class members'
    };
    return permissionDescriptions[permission] || 'No description available';
  }

  // Announcement methods
  getAnnouncements(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/communication/announcements/`).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error fetching announcements:', error);
        return throwError(() => error);
      })
    );
  }

  createAnnouncement(announcement: Announcement): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.apiUrl}/communication/announcements/`, announcement).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error creating announcement:', error);
        return throwError(() => error);
      })
    );
  }

  updateAnnouncement(id: number, announcement: Announcement): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.apiUrl}/communication/announcements/${id}/`, announcement).pipe(
      catchError(error => {
        console.error('Error updating announcement:', error);
        return throwError(() => error);
      })
    );
  }

  deleteAnnouncement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/communication/announcements/${id}/`).pipe(
      catchError(error => {
        console.error('Error deleting announcement:', error);
        return throwError(() => error);
      })
    );
  }

  // Announcement Read Status
  markAnnouncementAsRead(announcementId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/communication/announcements/${announcementId}/mark-read/`, {}).pipe(
      catchError(error => {
        console.error('Error marking announcement as read:', error);
        return throwError(() => error);
      })
    );
  }

  getUnreadAnnouncementsCount(): Observable<{unread_count: number, total_count: number, read_count: number}> {
    return this.http.get<{unread_count: number, total_count: number, read_count: number}>(`${this.apiUrl}/communication/announcements/unread-count/`).pipe(
      catchError(error => {
        console.error('Error getting unread announcements count:', error);
        return throwError(() => error);
      })
    );
  }
}
