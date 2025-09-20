import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CourseContentService, CourseContent, CourseTimelineResponse, CourseTimeline } from '../../core/course-content.service';
import { CourseService } from '../../core/course.service';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';

@Component({
  selector: 'app-course-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageLayoutComponent],
  template: `
    <app-page-layout 
      [pageTitle]="pageTitle" 
      [pageSubtitle]="pageSubtitle"
      [isSidebarOpen]="isSidebarOpen"
      [unreadCount]="0"
      (sidebarToggle)="onSidebarToggle($event)">
      
      <!-- Date Range Filter -->
      <div class="mb-6 flex items-center justify-end space-x-4">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">From:</label>
          <input type="date" 
                 [(ngModel)]="startDate" 
                 (change)="onDateFilterChange()"
                 class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">To:</label>
          <input type="date" 
                 [(ngModel)]="endDate" 
                 (change)="onDateFilterChange()"
                 class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <button (click)="goBack()" 
                class="flex items-center text-gray-600 hover:text-gray-900 transition-colors px-3 py-1 border border-gray-300 rounded-md text-sm">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Loading timeline...</span>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <svg class="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div>
            <h3 class="text-sm font-medium text-red-800">Error loading timeline</h3>
            <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Course Selection -->
      <div *ngIf="!loading && !error && showCourseSelection">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Select a Course</h2>
          <p class="text-gray-600 mb-8">Choose a course to view its timeline and content.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let course of userCourses" 
                 (click)="selectCourse(course)"
                 class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900">{{ course.code }}</h3>
                  <p class="text-gray-600 mt-1">{{ course.name }}</p>
                  <div class="mt-3 flex items-center space-x-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Year {{ course.year }}
                    </span>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Semester 1
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Timeline
              </div>
            </div>
          </div>
          
          <div *ngIf="userCourses.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No courses available</h3>
            <p class="mt-1 text-sm text-gray-500">You don't have access to any courses yet.</p>
          </div>
        </div>
      </div>

      <!-- Timeline Content -->
      <div *ngIf="!loading && !error && timelineData && !showCourseSelection">
        <!-- Course Info -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ timelineData.course.name }}</h2>
              <p class="text-gray-600 mt-1">{{ timelineData.course.code }} - {{ timelineData.course.description }}</p>
              <div class="mt-3 flex items-center space-x-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Year {{ timelineData.course.year }}
                </span>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Semester 1
                </span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-blue-600">{{ timelineData.total_lessons }}</div>
              <div class="text-sm text-gray-600">Lessons</div>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div *ngIf="timelineData.timeline.length > 0" class="space-y-8">
          <div *ngFor="let lesson of timelineData.timeline; let i = index" 
               class="relative">
            
            <!-- Timeline Line -->
            <div *ngIf="i < timelineData.timeline.length - 1" 
                 class="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-300"></div>
            
            <!-- Lesson Date Header -->
            <div class="flex items-center mb-4">
              <div class="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-semibold">{{ i + 1 }}</span>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">{{ lesson.lesson_date_display }}</h3>
                <p class="text-sm text-gray-600">{{ lesson.total_content }} content item(s)</p>
              </div>
            </div>

            <!-- Content Grid -->
            <div class="ml-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let content of lesson.content" 
                   class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                   (click)="viewContent(content)">
                
                <!-- Content Header -->
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center space-x-2">
                    <span class="text-2xl">{{ getFileIcon(content) }}</span>
                    <div>
                      <h4 class="font-medium text-gray-900 text-sm">{{ getContentTitle(content) }}</h4>
                      <p class="text-xs text-gray-500">{{ getContentTypeDisplay(content) }}</p>
                    </div>
                  </div>
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        [ngClass]="getContentTypeBadgeClass(content)">
                    {{ getContentTypeDisplay(content) }}
                  </span>
                </div>

                <!-- Content Details -->
                <div class="space-y-2 text-xs text-gray-600">
                  <div *ngIf="content.topic" class="flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
                    </svg>
                    {{ content.topic }}
                  </div>
                  
                  <div *ngIf="content.duration_display" class="flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                    </svg>
                    {{ content.duration_display }}
                  </div>
                  
                  <div *ngIf="content.file_size_display" class="flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                    {{ content.file_size_display }}
                  </div>
                </div>

                <!-- Content Actions -->
                <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div class="flex items-center space-x-3 text-xs text-gray-500">
                    <span class="flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                      </svg>
                      {{ content.view_count }}
                    </span>
                    <span class="flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                      </svg>
                      {{ content.download_count }}
                    </span>
                  </div>
                  
                  <button (click)="downloadContent(content, $event)" 
                          class="text-blue-600 hover:text-blue-800 text-xs font-medium">
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="timelineData.timeline.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No content available</h3>
          <p class="mt-1 text-sm text-gray-500">No course content has been uploaded yet.</p>
        </div>
      </div>
    </app-page-layout>
  `,
  styles: []
})
export class CourseTimelineComponent implements OnInit {
  @Input() courseId?: number;
  
  course: any = null;
  timelineData: CourseTimelineResponse | null = null;
  loading = false;
  error: string | null = null;
  
  startDate: string = '';
  endDate: string = '';
  
  // Course selection
  userCourses: any[] = [];
  showCourseSelection = false;
  
  // Page layout properties
  pageTitle = 'Course Timeline';
  pageSubtitle = 'View course content timeline';
  isSidebarOpen = false;

  constructor(
    private courseContentService: CourseContentService,
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get course ID from route params if not provided as input
    if (!this.courseId) {
      this.route.params.subscribe(params => {
        this.courseId = +params['id'];
        if (this.courseId) {
          this.loadTimeline();
        } else {
          // If no course ID in route, load user's courses for selection
          this.loadUserCourses();
        }
      });
    } else {
      this.loadTimeline();
    }
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  loadTimeline(): void {
    if (!this.courseId) return;

    this.loading = true;
    this.error = null;

    const filters: any = {};
    if (this.startDate) filters.start_date = this.startDate;
    if (this.endDate) filters.end_date = this.endDate;

    this.courseContentService.getCourseTimeline(this.courseId, filters).subscribe({
      next: (data) => {
        this.timelineData = data;
        this.course = data.course;
        this.pageTitle = `${data.course.name} - Timeline`;
        this.pageSubtitle = `${data.course.code} - ${data.total_lessons} lessons, ${data.total_content} content items`;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load course timeline';
        this.loading = false;
        console.error('Error loading timeline:', error);
        this.cdr.detectChanges();
      }
    });
  }

  onDateFilterChange(): void {
    this.loadTimeline();
  }

  viewContent(content: any): void {
    // Handle new content structure
    if (content.type && content.data) {
      // For new content types, open the file_url from the data
      if (content.data.file_url) {
        window.open(content.data.file_url, '_blank');
      }
      return;
    }
    
    // Handle old content structure
    // Increment view count
    this.courseContentService.incrementViewCount(content.id).subscribe();
    
    // Open content in new tab or handle based on type
    if (content.file_url) {
      window.open(content.file_url, '_blank');
    }
  }

  downloadContent(content: CourseContent, event: Event): void {
    event.stopPropagation();
    
    // Increment download count
    this.courseContentService.incrementDownloadCount(content.id).subscribe();
    
    // Trigger download
    if (content.file_url) {
      const link = document.createElement('a');
      link.href = content.file_url;
      link.download = content.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  getFileIcon(content: any): string {
    // Handle new content structure
    if (content.type && content.data) {
      return this.courseContentService.getFileIcon(content.data);
    }
    // Handle old content structure
    return this.courseContentService.getFileIcon(content);
  }

  getContentTitle(content: any): string {
    // Handle new content structure
    if (content.type && content.data) {
      return content.data.title;
    }
    // Handle old content structure
    return content.title;
  }

  getContentTypeDisplay(content: any): string {
    // Handle new content structure
    if (content.type && content.data) {
      switch (content.type) {
        case 'course_outline':
          return 'Course Outline';
        case 'past_paper':
          return 'Past Paper';
        case 'material':
          return 'Material';
        case 'assignment':
          return 'Assignment';
        case 'announcement':
          return 'Announcement';
        case 'old_content':
          return content.data.content_type_display || 'Content';
        default:
          return 'Content';
      }
    }
    // Handle old content structure
    return content.content_type_display || 'Content';
  }

  getContentTypeBadgeClass(content: any): string {
    // Handle new content structure
    if (content.type && content.data) {
      switch (content.type) {
        case 'course_outline':
          return 'bg-indigo-100 text-indigo-800';
        case 'past_paper':
          return 'bg-purple-100 text-purple-800';
        case 'material':
          return 'bg-blue-100 text-blue-800';
        case 'assignment':
          return 'bg-yellow-100 text-yellow-800';
        case 'announcement':
          return 'bg-green-100 text-green-800';
        case 'old_content':
          return this.getContentTypeBadgeClass(content.data.content_type);
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    // Handle old content structure
    switch (content.content_type) {
      case 'recording':
        return 'bg-red-100 text-red-800';
      case 'material':
        return 'bg-blue-100 text-blue-800';
      case 'assignment':
        return 'bg-yellow-100 text-yellow-800';
      case 'announcement':
        return 'bg-green-100 text-green-800';
      case 'past_papers':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  loadUserCourses(): void {
    this.loading = true;
    this.showCourseSelection = true;
    this.pageTitle = 'Select Course';
    this.pageSubtitle = 'Choose a course to view its timeline';
    
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.userCourses = courses;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'Failed to load courses';
        this.loading = false;
        console.error('Error loading courses:', error);
        this.cdr.detectChanges();
      }
    });
  }

  selectCourse(course: any): void {
    try {
      console.log('Selecting course:', course);
      
      if (!course || !course.id) {
        console.error('Invalid course object:', course);
        this.error = 'Invalid course selected';
        return;
      }
      
      this.courseId = course.id;
      this.showCourseSelection = false;
      this.loadTimeline();
    } catch (error) {
      console.error('Error selecting course:', error);
      this.error = 'Failed to select course';
    }
  }

  goBack(): void {
    if (this.showCourseSelection) {
      this.router.navigate(['/dashboard']);
    } else if (this.courseId) {
      this.showCourseSelection = true;
      this.timelineData = null;
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
