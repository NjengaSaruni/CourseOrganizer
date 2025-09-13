import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';

interface Course {
  id: number;
  name: string;
  code: string;
  description: string;
  year: number;
  semester: number;
  academic_year: string;
  credits: number;
  timetable_entries: TimetableEntry[];
  recent_recordings: Recording[];
  recent_materials: CourseMaterial[];
}

interface TimetableEntry {
  id: number;
  day: string;
  subject: string;
  time: string;
  location: string;
  lecturer: string;
  recordings: Recording[];
  materials: CourseMaterial[];
  has_recording: boolean;
  has_materials: boolean;
}

interface Recording {
  id: number;
  title: string;
  description: string;
  video_url: string;
  platform: string;
  duration: string;
  uploaded_by_name: string;
  created_at: string;
}

interface CourseMaterial {
  id: number;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  material_type: string;
  topic: string;
  uploaded_by_name: string;
  created_at: string;
}

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PageLayoutComponent],
  templateUrl: './course-management.component.html',
  styles: []
})
export class CourseManagementComponent implements OnInit {
  courses: Course[] = [];
  selectedCourse: Course | null = null;
  selectedTimetableEntry: TimetableEntry | null = null;
  isLoading = true;
  isSidebarOpen = false;
  activeTab: 'courses' | 'recordings' | 'materials' = 'courses';
  
  // Recording form
  showRecordingModal = false;
  recordingForm = {
    title: '',
    description: '',
    video_url: '',
    platform: 'zoom',
    timetable_entry_id: null as number | null
  };
  
  // Material form
  showMaterialModal = false;
  materialForm = {
    title: '',
    description: '',
    file_url: '',
    file_type: '',
    material_type: 'course_wide',
    topic: '',
    timetable_entry_id: null as number | null
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated() || !this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
      return;
    }
    
    this.loadCourses();
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  private loadCourses(): void {
    this.isLoading = true;
    // Mock data for now - in real app, this would call the API
    this.courses = [
      {
        id: 1,
        name: 'Constitutional Law I',
        code: 'LAW 201',
        description: 'This course covers the fundamental principles of constitutional law.',
        year: 1,
        semester: 1,
        academic_year: '2025/2026',
        credits: 3,
        timetable_entries: [
          {
            id: 1,
            day: 'monday',
            subject: 'Constitutional Law I',
            time: '17:30 - 20:30',
            location: 'Online',
            lecturer: 'Prof. Sarah Alosa',
            recordings: [],
            materials: [],
            has_recording: false,
            has_materials: false
          },
          {
            id: 2,
            day: 'wednesday',
            subject: 'Constitutional Law I',
            time: '17:30 - 20:30',
            location: 'Online',
            lecturer: 'Prof. Sarah Alosa',
            recordings: [
              {
                id: 1,
                title: 'Introduction to Constitutional Law',
                description: 'Overview of constitutional principles',
                video_url: 'https://example.com/recording1',
                platform: 'zoom',
                duration: '2:30:00',
                uploaded_by_name: 'Prof. Sarah Alosa',
                created_at: '2025-01-15T17:30:00Z'
              }
            ],
            materials: [],
            has_recording: true,
            has_materials: false
          }
        ],
        recent_recordings: [],
        recent_materials: []
      }
    ];
    this.isLoading = false;
  }

  selectCourse(course: Course): void {
    this.selectedCourse = course;
    this.activeTab = 'recordings';
  }

  selectTimetableEntry(entry: TimetableEntry): void {
    this.selectedTimetableEntry = entry;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab as 'courses' | 'recordings' | 'materials';
  }

  goBack(): void {
    if (this.selectedTimetableEntry) {
      this.selectedTimetableEntry = null;
    } else if (this.selectedCourse) {
      this.selectedCourse = null;
      this.activeTab = 'courses';
    } else {
      this.router.navigate(['/admin']);
    }
  }

  // Recording methods
  openRecordingModal(timetableEntry?: TimetableEntry): void {
    this.recordingForm = {
      title: '',
      description: '',
      video_url: '',
      platform: 'zoom',
      timetable_entry_id: timetableEntry?.id || null
    };
    this.showRecordingModal = true;
  }

  closeRecordingModal(): void {
    this.showRecordingModal = false;
    this.recordingForm = {
      title: '',
      description: '',
      video_url: '',
      platform: 'zoom',
      timetable_entry_id: null
    };
  }

  saveRecording(): void {
    // In a real app, this would call the API
    console.log('Saving recording:', this.recordingForm);
    this.closeRecordingModal();
    // Refresh the data
  }

  // Material methods
  openMaterialModal(timetableEntry?: TimetableEntry): void {
    this.materialForm = {
      title: '',
      description: '',
      file_url: '',
      file_type: '',
      material_type: 'course_wide',
      topic: '',
      timetable_entry_id: timetableEntry?.id || null
    };
    this.showMaterialModal = true;
  }

  closeMaterialModal(): void {
    this.showMaterialModal = false;
    this.materialForm = {
      title: '',
      description: '',
      file_url: '',
      file_type: '',
      material_type: 'course_wide',
      topic: '',
      timetable_entry_id: null
    };
  }

  saveMaterial(): void {
    // In a real app, this would call the API
    console.log('Saving material:', this.materialForm);
    this.closeMaterialModal();
    // Refresh the data
  }

  getPlatformIcon(platform: string): string {
    switch (platform) {
      case 'zoom': return '🔵';
      case 'google_meet': return '🟢';
      case 'teams': return '🔷';
      case 'physical': return '🏢';
      default: return '📹';
    }
  }

  getMaterialTypeIcon(type: string): string {
    switch (type) {
      case 'course_wide': return '📚';
      case 'topic_wise': return '📖';
      case 'lesson_specific': return '📄';
      default: return '📄';
    }
  }

  getFileTypeIcon(type: string): string {
    switch (type) {
      case 'pdf': return '📄';
      case 'doc': case 'docx': return '📝';
      case 'ppt': case 'pptx': return '📊';
      case 'mp4': case 'avi': return '🎥';
      case 'mp3': case 'wav': return '🎵';
      default: return '📄';
    }
  }
}
