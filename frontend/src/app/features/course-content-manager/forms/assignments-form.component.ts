import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseContentService, AssignmentCreate, FileUploadResponse } from '../../../core/course-content.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-assignments-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center mb-4">
        <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Assignment</h3>
          <p class="text-sm text-gray-600">Create assignments and homework tasks</p>
        </div>
      </div>

      <form (ngSubmit)="onSubmit()" #assignmentsForm="ngForm" class="space-y-4">
        
        <!-- Course Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Course *</label>
          <select [(ngModel)]="content.course" 
                  name="course" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
            <option value="">Select a course</option>
            <option *ngFor="let course of courses" [value]="course.id">
              {{ course.name }}
            </option>
          </select>
        </div>

        <!-- Academic Year and Semester -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
            <select [(ngModel)]="content.academic_year" 
                    name="academic_year" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">Select academic year</option>
              <option *ngFor="let year of academicYears" [value]="year.id">
                {{ year.year_start }}/{{ year.year_end }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
            <select [(ngModel)]="content.semester" 
                    name="semester" 
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">Select semester</option>
              <option *ngFor="let semester of semesters" [value]="semester.id">
                {{ semester.semester_type_display }}
              </option>
            </select>
          </div>
        </div>

        <!-- Assignment Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assignment Date *</label>
          <input type="date" 
                 [(ngModel)]="content.lesson_date" 
                 name="lesson_date"
                 required
                 (change)="onAssignmentDateChange()"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
        </div>

        <!-- Due Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
          <input type="date" 
                 [(ngModel)]="dueDate" 
                 name="due_date"
                 required
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
        </div>

        <!-- Topic -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Topic</label>
          <input type="text" 
                 [(ngModel)]="content.topic" 
                 name="topic"
                 placeholder="e.g., Contract Law Analysis"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
        </div>

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assignment Title *</label>
          <input type="text" 
                 [(ngModel)]="content.title" 
                 name="title"
                 required
                 placeholder="e.g., Assignment 1: Contract Analysis"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assignment Description *</label>
          <textarea [(ngModel)]="content.description" 
                    name="description"
                    required
                    rows="4"
                    placeholder="Describe the assignment requirements, instructions, and evaluation criteria..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"></textarea>
        </div>

        <!-- File Upload or URL -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assignment Materials (Optional)</label>
          <div class="space-y-3">
            <!-- File Upload Option -->
            <div class="border-2 border-gray-300 border-dashed rounded-md p-4 hover:border-gray-400 transition-colors">
              <div class="text-center">
                <svg class="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="mt-2">
                  <label for="assignment-file-upload" class="cursor-pointer">
                    <span class="mt-2 block text-sm font-medium text-gray-700">Upload assignment file</span>
                    <input id="assignment-file-upload" 
                           name="assignment-file-upload" 
                           type="file" 
                           class="sr-only"
                           accept=".pdf,.doc,.docx,.txt"
                           (change)="onFileSelected($event)">
                  </label>
                  <p class="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 10MB</p>
                </div>
              </div>
            </div>

            <!-- OR Divider -->
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <!-- URL Option -->
            <div>
              <input type="url" 
                     [(ngModel)]="content.file_url" 
                     name="file_url"
                     placeholder="https://example.com/assignment-link"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
              <p class="text-xs text-gray-500 mt-1">Enter a direct link to assignment materials</p>
            </div>
          </div>

          <div *ngIf="selectedFile" class="mt-2 flex items-center text-sm text-gray-600">
            <svg class="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            {{ selectedFile.name }}
          </div>
        </div>

        <!-- Submit Button -->
        <div class="pt-4">
          <button type="submit" 
                  [disabled]="!assignmentsForm.form.valid || uploading"
                  class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <span *ngIf="!uploading">Create Assignment</span>
            <span *ngIf="uploading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          </button>
        </div>
      </form>
    </div>
  `
})
export class AssignmentsFormComponent implements OnInit {
  @Input() courses: any[] = [];
  @Output() contentCreated = new EventEmitter<any>();
  @Output() error = new EventEmitter<string>();

  content: AssignmentCreate = {
    title: '',
    description: '',
    course: 0,
    academic_year: 0,
    semester: 0,
    lesson_date: '',
    due_date: '',
    is_published: true
  };

  selectedFile: File | null = null;
  uploading = false;
  dueDate = '';
  academicYears: any[] = [];
  semesters: any[] = [];

  constructor(
    private courseContentService: CourseContentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load academic years and semesters from backend
    this.courseContentService.getAcademicYears().subscribe({
      next: (years) => {
        this.academicYears = years;
        // Auto-select the active academic year (2025/26)
        const activeYear = years.find(year => year.is_active);
        if (activeYear) {
          this.content.academic_year = activeYear.id;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading academic years:', error);
      }
    });
    
    this.courseContentService.getSemesters().subscribe({
      next: (semesters) => {
        this.semesters = semesters;
        // Auto-select the active semester (Semester 1)
        const activeSemester = semesters.find(semester => semester.is_active);
        if (activeSemester) {
          this.content.semester = activeSemester.id;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading semesters:', error);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Clear URL if file is selected
      this.content.file_url = '';
      this.cdr.detectChanges();
    }
  }

  onAssignmentDateChange(): void {
    // Auto-calculate lesson order based on date
    this.calculateLessonOrder();
  }

  private calculateLessonOrder(): void {
    if (this.content.lesson_date && this.content.course) {
      // This would typically call a service to get the next lesson order
      // For now, we'll set it to 1
      this.content.lesson_order = 1;
    }
  }

  onSubmit(): void {
    if (!this.content.course || this.content.course === 0) {
      this.error.emit('Please select a course.');
      return;
    }

    if (!this.content.academic_year) {
      this.error.emit('Please select an academic year.');
      return;
    }

    if (!this.content.semester) {
      this.error.emit('Please select a semester.');
      return;
    }

    if (!this.content.lesson_date) {
      this.error.emit('Please select an assignment date.');
      return;
    }

    if (!this.dueDate) {
      this.error.emit('Please select a due date.');
      return;
    }

    if (!this.content.title) {
      this.error.emit('Please enter an assignment title.');
      return;
    }

    if (!this.content.description) {
      this.error.emit('Please enter an assignment description.');
      return;
    }

    this.uploading = true;

    // If file is selected, upload it first
    if (this.selectedFile) {
      this.courseContentService.uploadFile(this.selectedFile).subscribe({
        next: (response: FileUploadResponse) => {
          if (response.file_url) {
            // Convert relative URL to absolute URL if needed
            let fileUrl = response.file_url;
            if (fileUrl.startsWith('/media/')) {
              const backendUrl = environment.apiUrl.replace('/api', '');
              fileUrl = `${backendUrl}${fileUrl}`;
            }
            this.content.file_url = fileUrl;
            this.createContent();
          } else {
            this.uploading = false;
            this.error.emit('File upload failed: No file URL returned from server.');
          }
        },
        error: (error) => {
          this.uploading = false;
          this.error.emit('Failed to upload file. Please try again.');
          console.error('File upload error:', error);
        }
      });
    } else {
      // No file to upload, create content directly
      this.createContent();
    }
  }

  private createContent(): void {
    // Prepare content data for submission
    const contentData: any = { ...this.content };
    
    // Calculate lesson order if not set
    if (!contentData.lesson_order) {
      contentData.lesson_order = 1;
    }

    // Add due date information to description
    if (this.dueDate) {
      contentData.description = `${contentData.description}\n\nDue Date: ${this.dueDate}`;
    }

    this.courseContentService.createAssignment(contentData).subscribe({
      next: (content) => {
        this.uploading = false;
        this.contentCreated.emit(content);
        this.resetForm();
      },
      error: (error) => {
        this.uploading = false;
        this.error.emit('Failed to create assignment. Please try again.');
        console.error('Content creation error:', error);
      }
    });
  }

  private resetForm(): void {
    this.content = {
      title: '',
      description: '',
      course: 0,
      academic_year: 0,
      semester: 0,
      lesson_date: '',
      due_date: '',
      is_published: true
    };
    this.selectedFile = null;
    this.dueDate = '';
    this.cdr.detectChanges();
  }
}
