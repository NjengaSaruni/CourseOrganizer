import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseContentService, PastPaperCreate, FileUploadResponse } from '../../../core/course-content.service';
import { ButtonComponent } from '../../../shared/button/button.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-past-papers-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center mb-4">
        <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Past Papers</h3>
          <p class="text-sm text-gray-600">Upload past examination papers</p>
        </div>
      </div>

      <form (ngSubmit)="onSubmit()" #papersForm="ngForm" class="space-y-4">
        
        <!-- Course Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Course *</label>
          <select [(ngModel)]="content.course" 
                  name="course" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
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
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
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
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Select semester</option>
              <option *ngFor="let semester of semesters" [value]="semester.id">
                {{ semester.semester_type_display }}
              </option>
            </select>
          </div>
        </div>

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input type="text" 
                 [(ngModel)]="content.title" 
                 name="title"
                 required
                 placeholder="e.g., Tort I - Final Exam 2023/2024"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea [(ngModel)]="content.description" 
                    name="description"
                    rows="3"
                    placeholder="Additional details about the past paper..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
        </div>

        <!-- File Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Past Paper File *</label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div class="space-y-1 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="flex text-sm text-gray-600">
                <label for="papers-file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                  <span>Upload a file</span>
                  <input id="papers-file-upload" 
                         name="papers-file-upload" 
                         type="file" 
                         class="sr-only"
                         accept=".pdf"
                         (change)="onFileSelected($event)">
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs text-gray-500">PDF files up to 10MB</p>
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
          <app-button 
            type="submit"
            size="lg"
            [disabled]="!papersForm.form.valid || !selectedFile"
            [loading]="uploading"
            loadingText="Uploading..."
            [fullWidth]="true">
            Upload Past Paper
          </app-button>
        </div>
      </form>
    </div>
  `
})
export class PastPapersFormComponent implements OnInit {
  @Input() courses: any[] = [];
  @Output() contentCreated = new EventEmitter<any>();
  @Output() error = new EventEmitter<string>();

  content: PastPaperCreate = {
    title: '',
    description: '',
    course: 0,
    academic_year: 0,
    semester: 0,
    is_published: true
  };

  selectedFile: File | null = null;
  uploading = false;
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
      this.cdr.detectChanges();
    }
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      this.error.emit('Please select a file to upload.');
      return;
    }

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

    this.uploading = true;

    // Upload file first
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
  }

  private createContent(): void {
    // Prepare content data for submission
    const contentData: any = { ...this.content };
    
    // Ensure course is a number, not a string
    contentData.course = parseInt(contentData.course.toString(), 10);
    
    // Past papers don't need lesson dates
    contentData.lesson_order = 0;

    this.courseContentService.createPastPaper(contentData).subscribe({
      next: (content) => {
        this.uploading = false;
        this.contentCreated.emit(content);
        this.resetForm();
      },
      error: (error) => {
        this.uploading = false;
        this.error.emit('Failed to create past paper. Please try again.');
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
      is_published: true
    };
    this.selectedFile = null;
    this.cdr.detectChanges();
  }
}
