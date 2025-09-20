import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CourseContent {
  id: number;
  title: string;
  description: string;
  content_type: 'recording' | 'material' | 'assignment' | 'announcement' | 'past_papers';
  content_type_display: string;
  course: number;
  timetable_entry?: number;
  lesson_date: string;
  lesson_date_display: string;
  lesson_order: number;
  topic: string;
  file_url: string;
  file_path: string;
  file_size: number;
  file_size_display: string;
  file_extension: string;
  recording_platform?: string;
  recording_platform_display?: string;
  duration?: string;
  duration_display?: string;
  audio_only: boolean;
  material_type?: string;
  material_type_display?: string;
  uploaded_by: number;
  uploaded_by_name: string;
  is_published: boolean;
  download_count: number;
  view_count: number;
  is_audio_recording: boolean;
  is_video_recording: boolean;
  created_at: string;
  updated_at: string;
}

// Base interface for all content types
export interface BaseContentCreate {
  title: string;
  description?: string;
  course: number;
  academic_year: number;
  semester: number;
  file_url?: string;
  file_path?: string;
  is_published?: boolean;
}

// Course Outline specific interface
export interface CourseOutlineCreate extends BaseContentCreate {
  material_type: string;
}

// Past Paper specific interface
export interface PastPaperCreate extends BaseContentCreate {
  exam_type?: string;
  exam_date?: string;
}

// Recording specific interface
export interface RecordingCreate extends BaseContentCreate {
  recording_platform: string;
  lesson_date: string;
  lesson_order?: number;
  topic?: string;
  duration?: string;
  audio_only?: boolean;
}

// Material specific interface
export interface MaterialCreate extends BaseContentCreate {
  material_type: string;
  lesson_date?: string;
  lesson_order?: number;
  topic?: string;
}

// Assignment specific interface
export interface AssignmentCreate extends BaseContentCreate {
  assignment_type?: string;
  lesson_date: string;
  due_date: string;
  lesson_order?: number;
  topic?: string;
  max_marks?: number;
  instructions?: string;
}

// Announcement specific interface
export interface AnnouncementCreate extends BaseContentCreate {
  announcement_type?: string;
  priority?: string;
  expires_at?: string;
}

// Legacy interface for backward compatibility (will be removed)
export interface CourseContentCreate {
  title: string;
  description?: string;
  content_type: 'recording' | 'material' | 'assignment' | 'announcement' | 'past_papers';
  course: number;
  timetable_entry?: number;
  lesson_date?: string;
  lesson_order?: number;
  topic?: string;
  file_url?: string;
  file_path?: string;
  recording_platform?: string;
  duration?: string;
  audio_only?: boolean;
  material_type?: string;
  academic_year?: number;
  semester?: number;
  is_published?: boolean;
}

export interface CourseTimeline {
  lesson_date: string;
  lesson_date_display: string;
  content: CourseContent[];
  total_content: number;
}

export interface CourseTimelineResponse {
  course: any;
  timeline: CourseTimeline[];
  total_lessons: number;
  total_content: number;
}

export interface LessonContentResponse {
  course: any;
  lesson_date: string;
  lesson_date_display: string;
  content: CourseContent[];
  total_content: number;
}

export interface FileUploadResponse {
  message: string;
  file_url: string;
  file_path: string;
  file_size: number;
  content_type: string;
  filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseContentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get course content with optional filtering
   */
  getCourseContent(filters?: {
    course_id?: number;
    content_type?: string;
    start_date?: string;
    end_date?: string;
  }): Observable<CourseContent[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.course_id) params = params.set('course_id', filters.course_id.toString());
      if (filters.content_type) params = params.set('content_type', filters.content_type);
      if (filters.start_date) params = params.set('start_date', filters.start_date);
      if (filters.end_date) params = params.set('end_date', filters.end_date);
    }

    return this.http.get<CourseContent[]>(`${this.apiUrl}/content/`, { params });
  }

  /**
   * Get course timeline grouped by lesson date
   */
  getCourseTimeline(courseId: number, filters?: {
    start_date?: string;
    end_date?: string;
  }): Observable<CourseTimelineResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.start_date) params = params.set('start_date', filters.start_date);
      if (filters.end_date) params = params.set('end_date', filters.end_date);
    }

    return this.http.get<CourseTimelineResponse>(`${this.apiUrl}/courses/${courseId}/timeline/`, { params });
  }

  /**
   * Get content for a specific lesson date
   */
  getLessonContent(courseId: number, lessonDate: string): Observable<LessonContentResponse> {
    return this.http.get<LessonContentResponse>(`${this.apiUrl}/courses/${courseId}/lessons/${lessonDate}/`);
  }

  /**
   * Get course content for the current user's courses
   */
  getUserCourseContent(): Observable<{
    user_courses: Array<{
      course: any;
      recent_content: CourseContent[];
      total_content: number;
    }>;
    total_courses: number;
  }> {
    return this.http.get<any>(`${this.apiUrl}/courses/my-content/`);
  }

  /**
   * Create new course content
   */
  createCourseContent(content: CourseContentCreate): Observable<CourseContent> {
    return this.http.post<CourseContent>(`${this.apiUrl}/content/create/`, content);
  }

  /**
   * Update course content
   */
  updateCourseContent(contentId: number, content: Partial<CourseContentCreate>): Observable<CourseContent> {
    return this.http.put<CourseContent>(`${this.apiUrl}/content/${contentId}/update/`, content);
  }

  /**
   * Delete course content
   */
  deleteCourseContent(contentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/content/${contentId}/delete/`);
  }

  /**
   * Upload file for course content
   */
  uploadFile(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileUploadResponse>(`${this.apiUrl}/content/upload-file/`, formData);
  }

  /**
   * Increment view count for content
   */
  incrementViewCount(contentId: number): Observable<{ message: string; view_count: number }> {
    return this.http.post<{ message: string; view_count: number }>(`${this.apiUrl}/content/${contentId}/increment-view/`, {});
  }

  /**
   * Increment download count for content
   */
  incrementDownloadCount(contentId: number): Observable<{ message: string; download_count: number }> {
    return this.http.post<{ message: string; download_count: number }>(`${this.apiUrl}/content/${contentId}/increment-download/`, {});
  }

  /**
   * Get content type display options
   */
  getContentTypeOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'recording', label: 'Recording' },
      { value: 'material', label: 'Material' },
      { value: 'assignment', label: 'Assignment' },
      { value: 'announcement', label: 'Announcement' },
      { value: 'past_papers', label: 'Past Papers' }
    ];
  }

  /**
   * Get recording platform options
   */
  getRecordingPlatformOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'zoom', label: 'Zoom' },
      { value: 'google_meet', label: 'Google Meet' },
      { value: 'teams', label: 'Microsoft Teams' },
      { value: 'physical', label: 'Physical Meeting' },
      { value: 'other', label: 'Other' }
    ];
  }

  /**
   * Get material type options
   */
  getMaterialTypeOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'pdf', label: 'PDF Document' },
      { value: 'doc', label: 'Word Document' },
      { value: 'ppt', label: 'PowerPoint' },
      { value: 'video', label: 'Video File' },
      { value: 'audio', label: 'Audio File' },
      { value: 'image', label: 'Image' },
      { value: 'link', label: 'External Link' },
      { value: 'other', label: 'Other' }
    ];
  }

  /**
   * Get academic year options
   */
  getAcademicYearOptions(): Array<{ value: number; label: string }> {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Generate years from 5 years ago to 2 years in the future
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      years.push({ value: i, label: `${i}/${i + 1}` });
    }
    
    return years;
  }

  /**
   * Get semester options
   */
  getSemesterOptions(): Array<{ value: number; label: string }> {
    return [
      { value: 1, label: 'Semester 1' },
      { value: 2, label: 'Semester 2' },
      { value: 3, label: 'Summer Semester' }
    ];
  }

  /**
   * Get academic years from the backend
   */
  getAcademicYears(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/directory/academic-years/`).pipe(
      map(response => response.results || response)
    );
  }

  /**
   * Get semesters from the backend
   */
  getSemesters(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/directory/semesters/`).pipe(
      map(response => response.results || response)
    );
  }

  /**
   * Get semesters for a specific academic year
   */
  getSemestersForYear(academicYearId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/directory/semesters/?academic_year=${academicYearId}`).pipe(
      map(response => response.results || response)
    );
  }

  /**
   * Get current active semester
   */
  getCurrentSemester(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/directory/semesters/?is_active=true`).pipe(
      map(response => {
        const semesters = response.results || response;
        return semesters.length > 0 ? semesters[0] : null;
      })
    );
  }

  /**
   * Create a new course outline
   */
  createCourseOutline(data: CourseOutlineCreate): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/course-content/outlines/create/`, data);
  }

  /**
   * Create a new past paper
   */
  createPastPaper(data: PastPaperCreate): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/course-content/past-papers/create/`, data);
  }

  /**
   * Create a new material
   */
  createMaterial(data: MaterialCreate): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/course-content/materials/create/`, data);
  }

  /**
   * Create a new assignment
   */
  createAssignment(data: AssignmentCreate): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/course-content/assignments/create/`, data);
  }

  /**
   * Upload file for course content
   */
  uploadCourseContentFile(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<FileUploadResponse>(`${this.apiUrl}/course-content/upload-file/`, formData);
  }

  /**
   * Get course outlines for a specific course
   */
  getCourseOutlines(courseId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/course-content/outlines/?course_id=${courseId}`).pipe(
      map(response => response.results || response)
    );
  }

  /**
   * Get past papers for a specific course
   */
  getPastPapers(courseId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/course-content/past-papers/?course_id=${courseId}`).pipe(
      map(response => response.results || response)
    );
  }

  /**
   * Get materials for a specific course
   */
  getMaterials(courseId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/course-content/materials/?course_id=${courseId}`).pipe(
      map(response => response.results || response)
    );
  }

  /**
   * Get assignments for a specific course
   */
  getAssignments(courseId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/course-content/assignments/?course_id=${courseId}`).pipe(
      map(response => response.results || response)
    );
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  /**
   * Get file icon based on content type and file extension
   */
  getFileIcon(content: CourseContent): string {
    if (content.content_type === 'recording') {
      return content.audio_only ? '🎵' : '🎥';
    }

    const extension = content.file_extension?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'ppt':
      case 'pptx':
        return '📊';
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎥';
      case 'mp3':
      case 'wav':
      case 'm4a':
        return '🎵';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📎';
    }
  }

  /**
   * Check if user can manage content (admin or class rep)
   */
  canManageContent(): boolean {
    // This would typically check user permissions
    // For now, we'll assume this is handled by the backend
    return true;
  }
}
