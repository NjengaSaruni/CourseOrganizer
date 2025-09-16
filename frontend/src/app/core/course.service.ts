import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface Course {
  id: number;
  name: string;
  code: string;
  description: string;
  year: number;
  semester: number;
  credits: number;
  is_core: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseMaterial {
  id: number;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  course: number;
  uploaded_by: number;
  uploaded_by_name: string;
  created_at: string;
}

export interface Meeting {
  id: number;
  title: string;
  description: string;
  meeting_url: string;
  meeting_id: string;
  platform: string;
  platform_display: string;
  status: string;
  status_display: string;
  scheduled_time: string;
  duration: string;
  is_recording_enabled: boolean;
  recording_url: string;
  course: number;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  is_live: boolean;
  can_join: boolean;
  
  // Daily.co specific fields
  daily_room_name?: string;
  daily_room_id?: string;
  daily_room_url?: string;
  max_participants?: number;
  video_join_url?: string;
}

export interface Recording {
  id: number;
  title: string;
  description: string;
  video_url: string;
  duration: string;
  course: number;
  uploaded_by: number;
  uploaded_by_name: string;
  created_at: string;
}

export interface TimetableEntry {
  id: number;
  day: string;
  subject: string;
  time: string;
  location: string;
  group: string;
  lecturer: string;
  course: number;
  has_video_call: boolean;
  has_meeting: boolean;
  meeting_id?: number;
  can_join_meeting: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  private handleAuthError(error: any): Observable<never> {
    // Just log the error and let the auth guard handle redirects
    console.error('API Error:', error);
    return throwError(() => error);
  }

  getCourses(): Observable<Course[]> {
    return this.http.get<PaginatedResponse<Course>>(`${this.apiUrl}/courses/`).pipe(
      map(response => response.results),
      catchError(this.handleAuthError.bind(this))
    );
  }

  getMaterials(): Observable<CourseMaterial[]> {
    return this.http.get<PaginatedResponse<CourseMaterial>>(`${this.apiUrl}/materials/`).pipe(
      map(response => response.results),
      catchError(this.handleAuthError.bind(this))
    );
  }

  getMeetings(): Observable<Meeting[]> {
    return this.http.get<PaginatedResponse<Meeting>>(`${this.apiUrl}/meetings/`).pipe(
      map(response => response.results),
      catchError(this.handleAuthError.bind(this))
    );
  }

  getRecordings(): Observable<Recording[]> {
    return this.http.get<PaginatedResponse<Recording>>(`${this.apiUrl}/recordings/`).pipe(
      map(response => response.results),
      catchError(this.handleAuthError.bind(this))
    );
  }

  getTimetable(): Observable<TimetableEntry[]> {
    return this.http.get<any>(`${this.apiUrl}/timetable/`).pipe(
      map(response => {
        // Handle both paginated and non-paginated responses
        if (response.results) {
          return response.results;
        }
        return response;
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  getMaterialsBySubject(subject: string): Observable<CourseMaterial[]> {
    return this.http.get<PaginatedResponse<CourseMaterial>>(`${this.apiUrl}/materials/?subject=${subject}`).pipe(
      map(response => response.results),
      catchError(this.handleAuthError.bind(this))
    );
  }

  getRecordingsBySubject(subject: string): Observable<Recording[]> {
    return this.http.get<PaginatedResponse<Recording>>(`${this.apiUrl}/recordings/?subject=${subject}`).pipe(
      map(response => response.results),
      catchError(this.handleAuthError.bind(this))
    );
  }

  getMeetingsBySubject(subject: string): Observable<Meeting[]> {
    return this.http.get<PaginatedResponse<Meeting>>(`${this.apiUrl}/meetings/?subject=${subject}`).pipe(
      map(response => response.results),
      catchError(this.handleAuthError.bind(this))
    );
  }

  getCoursesByYear(year: number): Observable<Course[]> {
    return this.http.get<PaginatedResponse<Course>>(`${this.apiUrl}/courses/?year=${year}`).pipe(
      map(response => response.results),
      catchError(this.handleAuthError.bind(this))
    );
  }

  getCoursesByYearAndSemester(year: number, semester: number): Observable<Course[]> {
    return this.http.get<PaginatedResponse<Course>>(`${this.apiUrl}/courses/?year=${year}&semester=${semester}`).pipe(
      map(response => response.results),
      catchError(this.handleAuthError.bind(this))
    );
  }

  getTimetableByYear(year: number): Observable<TimetableEntry[]> {
    return this.http.get<any>(`${this.apiUrl}/timetable/?year=${year}`).pipe(
      map(response => {
        // Handle both paginated and non-paginated responses
        if (response.results) {
          return response.results;
        }
        return response;
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  getTimetableByYearAndSemester(year: number, semester: number): Observable<TimetableEntry[]> {
    return this.http.get<any>(`${this.apiUrl}/timetable/?year=${year}&semester=${semester}`).pipe(
      map(response => {
        // Handle both paginated and non-paginated responses
        if (response.results) {
          return response.results;
        }
        return response;
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  // Jitsi Meeting Methods
  createJitsiMeeting(meetingData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/meetings/jitsi/create/`, meetingData).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  getJitsiMeeting(meetingId: number): Observable<Meeting> {
    return this.http.get<Meeting>(`${this.apiUrl}/meetings/jitsi/${meetingId}/`).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  // Jitsi JWT Authentication Methods
  generateJitsiToken(roomName: string, meetingId?: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/jitsi/token/`, {
      room_name: roomName,
      meeting_id: meetingId
    }).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  generateMeetingToken(meetingId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/jitsi/token/${meetingId}/`, {}).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  verifyJitsiToken(token: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/jitsi/verify/`, { token }).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  updateMeetingStatus(meetingId: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/meetings/${meetingId}/status/`, { status }).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  joinMeeting(meetingId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/meetings/${meetingId}/join/`, {}).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  startJitsiRecording(meetingId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/meetings/${meetingId}/recording/start/`, {}).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  stopJitsiRecording(meetingId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/meetings/${meetingId}/recording/stop/`, {}).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  getMeetingRecordings(meetingId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/meetings/${meetingId}/recordings/`).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  // Timetable-Meeting Integration Methods
  getTimetableWithMeetings(): Observable<TimetableEntry[]> {
    return this.http.get<any>(`${this.apiUrl}/timetable/with-meetings/`).pipe(
      map(response => {
        if (response.results) {
          return response.results;
        }
        return response;
      }),
      catchError(this.handleAuthError.bind(this))
    );
  }

  createMeetingForTimetableEntry(timetableEntryId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/timetable/${timetableEntryId}/create-meeting/`, {}).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  joinTimetableMeeting(timetableEntryId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/timetable/${timetableEntryId}/join-meeting/`, {}).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }

  deleteMeetingForTimetableEntry(timetableEntryId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/timetable/${timetableEntryId}/delete-meeting/`).pipe(
      catchError(this.handleAuthError.bind(this))
    );
  }
}