import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CourseService } from '../../core/course.service';
import { CourseContentService } from '../../core/course-content.service';
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
}

interface CourseOutline {
  id: number;
  title: string;
  description: string;
  file_url: string;
  material_type: string;
  material_type_display: string;
  uploaded_by_name: string;
  created_at: string;
  course_name: string;
}

interface PastPaper {
  id: number;
  title: string;
  description: string;
  file_url: string;
  exam_type: string;
  exam_type_display: string;
  exam_date: string;
  uploaded_by_name: string;
  created_at: string;
  course_name: string;
}

interface Material {
  id: number;
  title: string;
  description: string;
  file_url: string;
  material_type: string;
  material_type_display: string;
  uploaded_by_name: string;
  created_at: string;
  course_name: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  file_url: string;
  due_date: string;
  uploaded_by_name: string;
  created_at: string;
  course_name: string;
}

@Component({
  selector: 'app-course-materials',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageLayoutComponent],
  template: `
    <app-page-layout 
      [pageTitle]="pageTitle" 
      [pageSubtitle]="pageSubtitle"
      [isSidebarOpen]="isSidebarOpen"
      [unreadCount]="0"
      (sidebarToggle)="onSidebarToggle($event)">
      
      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        <span class="ml-3 text-gray-600">Loading materials...</span>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-red-800">{{ error }}</p>
        </div>
      </div>

      <!-- Course Selection -->
      <div *ngIf="!selectedCourse && !loading" class="mb-8">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">Select Course</h2>
            <p class="text-gray-600">Choose a course to view its materials</p>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let course of courses" 
                   (click)="selectCourse(course)"
                   class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ course.name }}</h3>
                    <p class="text-sm text-gray-600 mb-2">{{ course.code }}</p>
                    <p class="text-xs text-gray-500">{{ course.academic_year }} • Year {{ course.year }} • Semester {{ course.semester }}</p>
                  </div>
                  <div class="ml-4">
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                </div>
                <div class="text-xs text-gray-500">
                  {{ course.credits }} credits
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Course Materials -->
      <div *ngIf="selectedCourse && !loading" class="space-y-6">
        <!-- Course Header -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-semibold text-gray-900">{{ selectedCourse.name }}</h2>
                <p class="text-gray-600 mt-1">{{ selectedCourse.code }} • {{ selectedCourse.academic_year }}</p>
              </div>
              <button (click)="goBack()" 
                      class="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Back to Courses
              </button>
            </div>
          </div>
        </div>

        <!-- Materials Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Course Outlines -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Course Outlines</h3>
                  <p class="text-sm text-gray-600">{{ courseOutlines.length }} outline{{ courseOutlines.length !== 1 ? 's' : '' }}</p>
                </div>
              </div>
            </div>
            
            <div class="p-6">
              <div *ngIf="courseOutlines.length === 0" class="text-center py-8">
                <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p class="text-gray-500 text-sm">No course outlines available</p>
              </div>
              
              <div *ngFor="let outline of courseOutlines" 
                   class="bg-gray-50 rounded-xl p-4 mb-3 last:mb-0 cursor-pointer hover:bg-gray-100 transition-colors"
                   (click)="openFile(outline.file_url, outline)">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900 text-sm mb-1">{{ outline.title }}</h4>
                    <p class="text-xs text-gray-600 mb-2">{{ outline.material_type_display }}</p>
                    <p class="text-xs text-gray-500">Uploaded by {{ outline.uploaded_by_name }} • {{ formatDate(outline.created_at) }}</p>
                  </div>
                  <svg class="w-5 h-5 text-gray-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Past Papers -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Past Papers</h3>
                  <p class="text-sm text-gray-600">{{ pastPapers.length }} paper{{ pastPapers.length !== 1 ? 's' : '' }}</p>
                </div>
              </div>
            </div>
            
            <div class="p-6">
              <div *ngIf="pastPapers.length === 0" class="text-center py-8">
                <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <p class="text-gray-500 text-sm">No past papers available</p>
              </div>
              
              <div *ngFor="let paper of pastPapers" 
                   class="bg-gray-50 rounded-xl p-4 mb-3 last:mb-0 cursor-pointer hover:bg-gray-100 transition-colors"
                   (click)="openFile(paper.file_url, paper)">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900 text-sm mb-1">{{ paper.title }}</h4>
                    <p class="text-xs text-gray-600 mb-2">{{ paper.exam_type_display }}</p>
                    <p class="text-xs text-gray-500">Uploaded by {{ paper.uploaded_by_name }} • {{ formatDate(paper.created_at) }}</p>
                  </div>
                  <svg class="w-5 h-5 text-gray-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Materials -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Study Materials</h3>
                  <p class="text-sm text-gray-600">{{ materials.length }} material{{ materials.length !== 1 ? 's' : '' }}</p>
                </div>
              </div>
            </div>
            
            <div class="p-6">
              <div *ngIf="materials.length === 0" class="text-center py-8">
                <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                <p class="text-gray-500 text-sm">No study materials available</p>
              </div>
              
              <div *ngFor="let material of materials" 
                   class="bg-gray-50 rounded-xl p-4 mb-3 last:mb-0 cursor-pointer hover:bg-gray-100 transition-colors"
                   (click)="openFile(material.file_url, material)">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900 text-sm mb-1">{{ material.title }}</h4>
                    <p class="text-xs text-gray-600 mb-2">{{ material.material_type_display }}</p>
                    <p class="text-xs text-gray-500">Uploaded by {{ material.uploaded_by_name }} • {{ formatDate(material.created_at) }}</p>
                  </div>
                  <svg class="w-5 h-5 text-gray-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Assignments -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Assignments</h3>
                  <p class="text-sm text-gray-600">{{ assignments.length }} assignment{{ assignments.length !== 1 ? 's' : '' }}</p>
                </div>
              </div>
            </div>
            
            <div class="p-6">
              <div *ngIf="assignments.length === 0" class="text-center py-8">
                <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
                <p class="text-gray-500 text-sm">No assignments available</p>
              </div>
              
              <div *ngFor="let assignment of assignments" 
                   class="bg-gray-50 rounded-xl p-4 mb-3 last:mb-0 cursor-pointer hover:bg-gray-100 transition-colors"
                   (click)="openFile(assignment.file_url, assignment)">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900 text-sm mb-1">{{ assignment.title }}</h4>
                    <p class="text-xs text-gray-600 mb-2" *ngIf="assignment.due_date">Due: {{ formatDate(assignment.due_date) }}</p>
                    <p class="text-xs text-gray-500">Uploaded by {{ assignment.uploaded_by_name }} • {{ formatDate(assignment.created_at) }}</p>
                  </div>
                  <svg class="w-5 h-5 text-gray-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div class="flex flex-wrap gap-3">
            <button (click)="navigateToContentManager()" 
                    class="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Upload New Material
            </button>
            <button (click)="navigateToTimeline()" 
                    class="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              View Timeline
            </button>
          </div>
        </div>
      </div>
    </app-page-layout>
  `,
  styles: []
})
export class CourseMaterialsComponent implements OnInit {
  courses: Course[] = [];
  selectedCourse: Course | null = null;
  courseOutlines: CourseOutline[] = [];
  pastPapers: PastPaper[] = [];
  materials: Material[] = [];
  assignments: Assignment[] = [];
  
  loading = true;
  error: string | null = null;
  isSidebarOpen = false;
  pendingCourseId: number | null = null;
  
  pageTitle = 'Course Materials';
  pageSubtitle = 'Access course outlines, past papers, and study materials';

  constructor(
    private courseService: CourseService,
    private courseContentService: CourseContentService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    
    // Check if course ID is provided in route
    this.route.params.subscribe(params => {
      if (params['id']) {
        const courseId = parseInt(params['id'], 10);
        // Wait for courses to load before selecting
        if (this.courses.length > 0) {
          this.selectCourseById(courseId);
        } else {
          // Store the course ID to select after courses load
          this.pendingCourseId = courseId;
        }
      }
    });
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  private loadCourses(): void {
    this.loading = true;
    this.error = null;
    
    this.courseService.getCourses().subscribe({
      next: (courses: any) => {
        this.courses = courses;
        this.loading = false;
        
        // If there's a pending course ID, select it now
        if (this.pendingCourseId) {
          this.selectCourseById(this.pendingCourseId);
          this.pendingCourseId = null;
        }
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.error = 'Failed to load courses. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectCourse(course: Course): void {
    this.selectedCourse = course;
    this.pageTitle = `${course.name} - Materials`;
    this.pageSubtitle = `${course.code} • ${course.academic_year}`;
    this.loadCourseMaterials(course.id);
  }

  private selectCourseById(courseId: number): void {
    const course = this.courses.find(c => c.id === courseId);
    if (course) {
      this.selectCourse(course);
    }
  }

  private loadCourseMaterials(courseId: number): void {
    this.loading = true;
    this.error = null;
    
    // Clear existing data
    this.courseOutlines = [];
    this.pastPapers = [];
    this.materials = [];
    this.assignments = [];
    
    // Load all material types for the selected course
    this.loadCourseOutlines(courseId);
    this.loadPastPapers(courseId);
    this.loadMaterials(courseId);
    this.loadAssignments(courseId);
    
    // Set loading to false after a short delay to allow for API calls
    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }, 100);
  }

  private loadCourseOutlines(courseId: number): void {
    this.courseContentService.getCourseOutlines(courseId).subscribe({
      next: (outlines) => {
        this.courseOutlines = outlines;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading course outlines:', error);
        this.courseOutlines = [];
        this.cdr.detectChanges();
      }
    });
  }

  private loadPastPapers(courseId: number): void {
    this.courseContentService.getPastPapers(courseId).subscribe({
      next: (papers) => {
        this.pastPapers = papers;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading past papers:', error);
        this.pastPapers = [];
        this.cdr.detectChanges();
      }
    });
  }

  private loadMaterials(courseId: number): void {
    this.courseContentService.getMaterials(courseId).subscribe({
      next: (materials) => {
        this.materials = materials;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading materials:', error);
        this.materials = [];
        this.cdr.detectChanges();
      }
    });
  }

  private loadAssignments(courseId: number): void {
    this.courseContentService.getAssignments(courseId).subscribe({
      next: (assignments) => {
        this.assignments = assignments;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading assignments:', error);
        this.assignments = [];
        this.cdr.detectChanges();
      }
    });
  }

  openFile(fileUrl: string, materialInfo?: any): void {
    if (!fileUrl) return;
    const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      const encoded = encodeURIComponent(fileUrl);
      const queryParams: any = { url: encoded };
      
      // Add material information if available
      if (materialInfo) {
        if (materialInfo.title) queryParams.title = encodeURIComponent(materialInfo.title);
        if (materialInfo.course_name) queryParams.courseName = encodeURIComponent(materialInfo.course_name);
        if (materialInfo.uploaded_by_name) queryParams.uploadedBy = encodeURIComponent(materialInfo.uploaded_by_name);
        if (materialInfo.created_at) queryParams.uploadDate = materialInfo.created_at;
        if (materialInfo.description) queryParams.description = encodeURIComponent(materialInfo.description);
        if (materialInfo.material_type_display) queryParams.materialType = encodeURIComponent(materialInfo.material_type_display);
        if (this.selectedCourse) {
          queryParams.courseCode = encodeURIComponent(this.selectedCourse.code);
        }
      }
      
      this.router.navigate(['/pdf'], { queryParams });
    } else {
      window.open(fileUrl, '_blank');
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  goBack(): void {
    this.selectedCourse = null;
    this.pageTitle = 'Course Materials';
    this.pageSubtitle = 'Access course outlines, past papers, and study materials';
    this.courseOutlines = [];
    this.pastPapers = [];
    this.materials = [];
    this.assignments = [];
  }

  navigateToContentManager(): void {
    this.router.navigate(['/content-manager']);
  }

  navigateToTimeline(): void {
    if (this.selectedCourse) {
      this.router.navigate(['/course-timeline', this.selectedCourse.id]);
    }
  }
}
