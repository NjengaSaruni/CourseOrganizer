import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CourseContentService, CourseContent } from '../../core/course-content.service';
import { CourseService } from '../../core/course.service';
import { CourseOutlineFormComponent } from './forms/course-outline-form.component';
import { PastPapersFormComponent } from './forms/past-papers-form.component';
import { RecordingsFormComponent } from './forms/recordings-form.component';
import { MaterialsFormComponent } from './forms/materials-form.component';
import { AssignmentsFormComponent } from './forms/assignments-form.component';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';

@Component({
  selector: 'app-course-content-manager-new',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    PageLayoutComponent,
    CourseOutlineFormComponent,
    PastPapersFormComponent,
    RecordingsFormComponent,
    MaterialsFormComponent,
    AssignmentsFormComponent
  ],
  template: `
    <app-page-layout 
      pageTitle="Course Content Manager" 
      pageSubtitle="Add outlines, materials, past papers, recordings and assignments"
      [isSidebarOpen]="false"
      (sidebarToggle)="{}">
      
      <div class="bg-gradient-to-b from-gray-50 to-white -m-6 p-6 rounded-2xl">
        
        <!-- Content Type Selection -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">What would you like to add?</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <!-- Course Outline -->
            <button (click)="selectContentType('course-outline')" 
                    [class]="selectedContentType === 'course-outline' ? 'ring-2 ring-gray-300 bg-gray-50' : 'hover:bg-gray-50'"
                    class="p-5 border border-gray-200 rounded-2xl text-left transition-all shadow-sm bg-white/90 backdrop-blur">
              <div class="flex items-center mb-2">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h3 class="font-medium text-gray-900">Course Outline</h3>
              </div>
              <p class="text-sm text-gray-600">Upload the official course outline document</p>
            </button>

            <!-- Past Papers -->
            <button (click)="selectContentType('past-papers')" 
                    [class]="selectedContentType === 'past-papers' ? 'ring-2 ring-gray-300 bg-gray-50' : 'hover:bg-gray-50'"
                    class="p-5 border border-gray-200 rounded-2xl text-left transition-all shadow-sm bg-white/90 backdrop-blur">
              <div class="flex items-center mb-2">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h3 class="font-medium text-gray-900">Past Papers</h3>
              </div>
              <p class="text-sm text-gray-600">Upload past examination papers</p>
            </button>

            <!-- Recordings -->
            <button (click)="selectContentType('recordings')" 
                    [class]="selectedContentType === 'recordings' ? 'ring-2 ring-gray-300 bg-gray-50' : 'hover:bg-gray-50'"
                    class="p-5 border border-gray-200 rounded-2xl text-left transition-all shadow-sm bg-white/90 backdrop-blur">
              <div class="flex items-center mb-2">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h3 class="font-medium text-gray-900">Class Recording</h3>
              </div>
              <p class="text-sm text-gray-600">Upload or link to class recordings</p>
            </button>

            <!-- Materials -->
            <button (click)="selectContentType('materials')" 
                    [class]="selectedContentType === 'materials' ? 'ring-2 ring-gray-300 bg-gray-50' : 'hover:bg-gray-50'"
                    class="p-5 border border-gray-200 rounded-2xl text-left transition-all shadow-sm bg-white/90 backdrop-blur">
              <div class="flex items-center mb-2">
                <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h3 class="font-medium text-gray-900">Course Materials</h3>
              </div>
              <p class="text-sm text-gray-600">Upload supplementary materials and resources</p>
            </button>

            <!-- Assignments -->
            <button (click)="selectContentType('assignments')" 
                    [class]="selectedContentType === 'assignments' ? 'ring-2 ring-gray-300 bg-gray-50' : 'hover:bg-gray-50'"
                    class="p-5 border border-gray-200 rounded-2xl text-left transition-all shadow-sm bg-white/90 backdrop-blur">
              <div class="flex items-center mb-2">
                <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h3 class="font-medium text-gray-900">Assignment</h3>
              </div>
              <p class="text-sm text-gray-600">Create assignments and homework tasks</p>
            </button>

          </div>
        </div>

        <!-- Selected Form -->
        <div *ngIf="selectedContentType" class="mb-10">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Add {{ getContentTypeLabel() }}</h2>
            <button (click)="clearSelection()" 
                    class="text-sm text-gray-600 hover:text-gray-900 rounded-lg px-2 py-1 hover:bg-gray-50">
              Change selection
            </button>
          </div>

          <!-- Course Outline Form -->
          <app-course-outline-form 
            *ngIf="selectedContentType === 'course-outline'"
            [courses]="courses"
            (contentCreated)="onContentCreated($event)"
            (error)="onError($event)">
          </app-course-outline-form>

          <!-- Past Papers Form -->
          <app-past-papers-form 
            *ngIf="selectedContentType === 'past-papers'"
            [courses]="courses"
            (contentCreated)="onContentCreated($event)"
            (error)="onError($event)">
          </app-past-papers-form>

          <!-- Recordings Form -->
          <app-recordings-form 
            *ngIf="selectedContentType === 'recordings'"
            [courses]="courses"
            (contentCreated)="onContentCreated($event)"
            (error)="onError($event)">
          </app-recordings-form>

          <!-- Materials Form -->
          <app-materials-form 
            *ngIf="selectedContentType === 'materials'"
            [courses]="courses"
            (contentCreated)="onContentCreated($event)"
            (error)="onError($event)">
          </app-materials-form>

          <!-- Assignments Form -->
          <app-assignments-form 
            *ngIf="selectedContentType === 'assignments'"
            [courses]="courses"
            (contentCreated)="onContentCreated($event)"
            (error)="onError($event)">
          </app-assignments-form>
        </div>

        <!-- Recent Content -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Recent Content List -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Content</h2>
            <div class="bg-white/90 backdrop-blur rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-200">
              <div *ngIf="recentContent.length === 0" class="p-6 text-center text-gray-500">
                No content added yet
              </div>
              <div *ngFor="let content of recentContent" class="p-4 border-b border-gray-100 last:border-b-0">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900">{{ content.title }}</h3>
                    <p class="text-sm text-gray-600 mt-1">{{ content.description }}</p>
                    <div class="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                      <span [class]="getContentTypeBadgeClass(content.content_type)">
                        {{ getContentTypeLabel(content.content_type) }}
                      </span>
                      <span>{{ content.created_at | date:'short' }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {{ content.course }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div class="space-y-4">
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">Total Content</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ recentContent.length }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">Published</p>
                    <p class="text-2xl font-semibold text-gray-900">{{ getPublishedCount() }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-page-layout>
  `
})
export class CourseContentManagerNewComponent implements OnInit {
  selectedContentType: string | null = null;
  courses: any[] = [];
  recentContent: CourseContent[] = [];

  constructor(
    private courseContentService: CourseContentService,
    private courseService: CourseService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadRecentContent();
  }

  selectContentType(type: string): void {
    this.selectedContentType = type;
  }

  clearSelection(): void {
    this.selectedContentType = null;
  }

  getContentTypeLabel(type?: string): string {
    const contentType = type || this.selectedContentType;
    switch (contentType) {
      case 'course-outline': return 'Course Outline';
      case 'past-papers': return 'Past Papers';
      case 'recordings': return 'Class Recording';
      case 'materials': return 'Course Materials';
      case 'assignments': return 'Assignment';
      case 'material': return 'Material';
      case 'recording': return 'Recording';
      case 'assignment': return 'Assignment';
      case 'past_papers': return 'Past Papers';
      default: return 'Content';
    }
  }

  getContentTypeBadgeClass(contentType: string): string {
    switch (contentType) {
      case 'material': return 'bg-blue-100 text-blue-800';
      case 'recording': return 'bg-green-100 text-green-800';
      case 'assignment': return 'bg-red-100 text-red-800';
      case 'past_papers': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPublishedCount(): number {
    return this.recentContent.filter(content => content.is_published).length;
  }

  onContentCreated(content: any): void {
    alert('Content added successfully!');
    this.loadRecentContent();
    this.clearSelection();
  }

  onError(error: string): void {
    alert(error);
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (courses: any) => {
        this.courses = courses;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error loading courses:', error);
        this.cdr.detectChanges();
      }
    });
  }

  loadRecentContent(): void {
    this.courseContentService.getCourseContent().subscribe({
      next: (content) => {
        console.log('Recent content response:', content);
        // Handle both array response and paginated response
        let contentArray: CourseContent[] = [];
        if (Array.isArray(content)) {
          contentArray = content;
        } else if (content && typeof content === 'object' && 'results' in content) {
          contentArray = (content as any).results;
        } else {
          console.warn('Unexpected content format:', content);
          contentArray = [];
        }
        this.recentContent = contentArray.slice(0, 10); // Show last 10 items
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading recent content:', error);
        this.cdr.detectChanges();
      }
    });
  }

}
