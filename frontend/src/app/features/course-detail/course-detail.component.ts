import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../core/course.service';
import { AuthService } from '../../core/auth.service';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';

interface CourseDetail {
  id: string;
  name: string;
  code: string;
  description: string;
  lecturer: string;
  credits: number;
  semester: string;
  academicYear: string;
}

interface Meeting {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  type: 'lecture' | 'tutorial' | 'practical' | 'seminar';
  status: 'completed' | 'upcoming' | 'cancelled';
  recordingUrl?: string;
  notes?: string;
}

interface CourseMaterial {
  id: string;
  title: string;
  type: 'document' | 'video' | 'presentation' | 'assignment' | 'exam';
  url: string;
  uploadDate: Date;
  description?: string;
  size?: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
  maxMarks: number;
  obtainedMarks?: number;
  submissionUrl?: string;
}

interface Examination {
  id: string;
  title: string;
  type: 'midterm' | 'final' | 'quiz' | 'test';
  date: Date;
  time: string;
  location: string;
  duration: number; // in minutes
  maxMarks: number;
  obtainedMarks?: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, PageLayoutComponent],
  templateUrl: './course-detail.component.html',
  styles: []
})
export class CourseDetailComponent implements OnInit {
  course: CourseDetail | null = null;
  meetings: Meeting[] = [];
  materials: CourseMaterial[] = [];
  assignments: Assignment[] = [];
  examinations: Examination[] = [];
  isLoading = true;
  isSidebarOpen = false;
  activeTab: 'overview' | 'meetings' | 'materials' | 'assignments' | 'examinations' = 'overview';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.route.params.subscribe(params => {
      const courseId = decodeURIComponent(params['id']);
      if (courseId) {
        this.loadCourseDetail(courseId);
      }
    });
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  private loadCourseDetail(courseId: string): void {
    this.isLoading = true;
    
    // Temporary dynamic placeholder using the ID as course name until backend endpoint is wired
    this.course = {
      id: courseId,
      name: courseId,
      code: '',
      description: '',
      lecturer: '',
      credits: 0,
      semester: '',
      academicYear: ''
    };

    // Clear placeholder arrays for now
    this.meetings = [];

    this.materials = [];

    this.assignments = [];

    this.examinations = [];

    this.isLoading = false;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab as 'overview' | 'meetings' | 'materials' | 'assignments' | 'examinations';
  }

  goBack(): void {
    this.router.navigate(['/timetable']);
  }

  downloadMaterial(material: CourseMaterial): void {
    // In a real app, this would trigger a download
    window.open(material.url, '_blank');
  }

  viewRecording(meeting: Meeting): void {
    if (meeting.recordingUrl) {
      window.open(meeting.recordingUrl, '_blank');
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'not_started': return 'text-gray-600 bg-gray-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'submitted': return 'text-purple-600 bg-purple-100';
      case 'graded': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'lecture': return '🎓';
      case 'tutorial': return '👥';
      case 'practical': return '🔬';
      case 'seminar': return '💬';
      case 'document': return '📄';
      case 'video': return '🎥';
      case 'presentation': return '📊';
      case 'assignment': return '📝';
      case 'exam': return '📋';
      case 'midterm': return '📝';
      case 'final': return '📚';
      case 'quiz': return '❓';
      case 'test': return '📋';
      default: return '📄';
    }
  }

  getUpcomingMeetings(): Meeting[] {
    return this.meetings.filter(m => m.status === 'upcoming').slice(0, 3);
  }

  navigateToCourseMaterials(): void {
    if (this.course) {
      this.router.navigate(['/course-materials', this.course.id]);
    }
  }
}
