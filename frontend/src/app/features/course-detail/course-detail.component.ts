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
      const courseId = params['id'];
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
    
    // For now, we'll create mock data. In a real app, this would come from the backend
    this.course = {
      id: courseId,
      name: 'Constitutional Law I',
      code: 'LAW 201',
      description: 'This course covers the fundamental principles of constitutional law, including the structure of government, separation of powers, and fundamental rights.',
      lecturer: 'Prof. Sarah Alosa',
      credits: 3,
      semester: 'First Semester',
      academicYear: '2025/2026'
    };

    // Mock meetings data
    this.meetings = [
      {
        id: '1',
        title: 'Introduction to Constitutional Law',
        date: new Date('2025-01-15'),
        time: '17:30 - 20:30',
        location: 'Online',
        type: 'lecture',
        status: 'completed',
        recordingUrl: 'https://example.com/recording1',
        notes: 'Overview of constitutional principles and historical development'
      },
      {
        id: '2',
        title: 'Separation of Powers',
        date: new Date('2025-01-22'),
        time: '17:30 - 20:30',
        location: 'Online',
        type: 'lecture',
        status: 'completed',
        recordingUrl: 'https://example.com/recording2',
        notes: 'Analysis of executive, legislative, and judicial powers'
      },
      {
        id: '3',
        title: 'Fundamental Rights and Freedoms',
        date: new Date('2025-01-29'),
        time: '17:30 - 20:30',
        location: 'Online',
        type: 'lecture',
        status: 'upcoming',
        notes: 'Discussion on human rights and constitutional protections'
      }
    ];

    // Mock materials data
    this.materials = [
      {
        id: '1',
        title: 'Constitutional Law Textbook - Chapter 1',
        type: 'document',
        url: 'https://example.com/textbook-ch1.pdf',
        uploadDate: new Date('2025-01-10'),
        description: 'Introduction to constitutional law principles',
        size: '2.5 MB'
      },
      {
        id: '2',
        title: 'Lecture Slides - Week 1',
        type: 'presentation',
        url: 'https://example.com/slides-week1.pptx',
        uploadDate: new Date('2025-01-12'),
        description: 'PowerPoint presentation for first lecture',
        size: '1.8 MB'
      },
      {
        id: '3',
        title: 'Constitutional History Video',
        type: 'video',
        url: 'https://example.com/history-video.mp4',
        uploadDate: new Date('2025-01-14'),
        description: 'Documentary on constitutional development',
        size: '45.2 MB'
      }
    ];

    // Mock assignments data
    this.assignments = [
      {
        id: '1',
        title: 'Constitutional Analysis Essay',
        description: 'Write a 2000-word essay analyzing the separation of powers in the Kenyan Constitution',
        dueDate: new Date('2025-02-15'),
        status: 'not_started',
        maxMarks: 100
      },
      {
        id: '2',
        title: 'Case Study: Marbury v. Madison',
        description: 'Analyze the landmark case and its impact on constitutional law',
        dueDate: new Date('2025-02-28'),
        status: 'not_started',
        maxMarks: 50
      }
    ];

    // Mock examinations data
    this.examinations = [
      {
        id: '1',
        title: 'Midterm Examination',
        type: 'midterm',
        date: new Date('2025-03-15'),
        time: '09:00 - 12:00',
        location: 'Main Campus - Room 101',
        duration: 180,
        maxMarks: 100,
        status: 'upcoming'
      },
      {
        id: '2',
        title: 'Final Examination',
        type: 'final',
        date: new Date('2025-05-20'),
        time: '09:00 - 12:00',
        location: 'Main Campus - Room 101',
        duration: 180,
        maxMarks: 100,
        status: 'upcoming'
      }
    ];

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
}
