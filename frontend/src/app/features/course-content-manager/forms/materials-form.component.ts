import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseContentService, MaterialCreate, FileUploadResponse } from '../../../core/course-content.service';
import { environment } from '../../../../environments/environment';
import { ButtonComponent } from '../../../shared/button/button.component';

@Component({
  selector: 'app-materials-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="bg-white/90 backdrop-blur rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-200 p-6 sm:p-8">
      <div class="flex items-center mb-5">
        <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Course Materials</h3>
          <p class="text-sm text-gray-600">Upload supplementary materials and resources</p>
        </div>
      </div>

      <form (ngSubmit)="onSubmit()" #materialsForm="ngForm" class="space-y-5">
        
        <!-- Course Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Course *</label>
          <select [(ngModel)]="content.course" 
                  name="course" 
                  required
                  class="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition">
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
                    class="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition">
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
                    class="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition">
              <option value="">Select semester</option>
              <option *ngFor="let semester of semesters" [value]="semester.id">
                {{ semester.semester_type_display }}
              </option>
            </select>
          </div>
        </div>

        <!-- Material Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Material Type *</label>
          <select [(ngModel)]="content.material_type" 
                  name="material_type" 
                  required
                  class="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition">
            <option value="">Select material type</option>
            <option *ngFor="let type of materialTypes" [value]="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>

        <!-- Lesson Date (Optional) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Lesson Date (Optional)</label>
          <input type="date" 
                 [(ngModel)]="content.lesson_date" 
                 name="lesson_date"
                 (change)="onLessonDateChange()"
                 class="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition">
          <p class="text-xs text-gray-500 mt-1">Leave empty for general course materials</p>
        </div>

        <!-- Topic -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Topic</label>
          <input type="text" 
                 [(ngModel)]="content.topic" 
                 name="topic"
                 placeholder="e.g., Chapter 1: Introduction"
                 class="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition">
        </div>

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input type="text" 
                 [(ngModel)]="content.title" 
                 name="title"
                 required
                 placeholder="e.g., Reading Assignment - Chapter 1"
                 class="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition">
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea [(ngModel)]="content.description" 
                    name="description"
                    rows="3"
                    placeholder="Brief description of the material..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition"></textarea>
        </div>

        <!-- File Upload or URL -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Material Source *</label>
          <div class="space-y-3">
            <!-- File Upload Option -->
            <div class="border-2 border-gray-300 border-dashed rounded-2xl p-6 hover:border-gray-400 transition-colors">
              <div class="text-center">
                <svg class="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="mt-2">
                  <label for="materials-file-upload" class="cursor-pointer">
                    <span class="mt-2 block text-sm font-medium text-gray-700">Upload material file</span>
                    <input id="materials-file-upload" 
                           name="materials-file-upload" 
                           type="file" 
                           class="sr-only"
                           accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                           (change)="onFileSelected($event)">
                  </label>
                  <p class="text-xs text-gray-500">PDF, DOC, PPT, TXT, Images up to 10MB</p>
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
                     placeholder="https://example.com/material-link"
                     class="w-full h-12 px-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition">
              <p class="text-xs text-gray-500 mt-1">Enter a direct link to the material</p>
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
            [disabled]="!materialsForm.form.valid || (!selectedFile && !content.file_url)"
            [loading]="uploading"
            loadingText="Processing..."
            [fullWidth]="true">
            Add Material
          </app-button>
        </div>
      </form>
    </div>
  `
})
export class MaterialsFormComponent implements OnInit {
  @Input() courses: any[] = [];
  @Output() contentCreated = new EventEmitter<any>();
  @Output() error = new EventEmitter<string>();

  content: MaterialCreate = {
    title: '',
    description: '',
    course: 0,
    academic_year: 0,
    semester: 0,
    material_type: '',
    is_published: true
  };

  selectedFile: File | null = null;
  uploading = false;
  materialTypes: any[] = [];
  academicYears: any[] = [];
  semesters: any[] = [];

  constructor(
    private courseContentService: CourseContentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.materialTypes = this.courseContentService.getMaterialTypeOptions();
    
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

  onLessonDateChange(): void {
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
    if (!this.selectedFile && !this.content.file_url) {
      this.error.emit('Please either upload a file or provide a material URL.');
      return;
    }

    if (!this.content.course || this.content.course === 0) {
      this.error.emit('Please select a course.');
      return;
    }

    if (!this.content.academic_year || this.content.academic_year === 0) {
      this.error.emit('Please select an academic year.');
      return;
    }

    if (!this.content.semester || this.content.semester === 0) {
      this.error.emit('Please select a semester.');
      return;
    }

    if (!this.content.material_type) {
      this.error.emit('Please select a material type.');
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
      // Direct URL provided
      this.createContent();
    }
  }

  private createContent(): void {
    // Prepare content data for submission
    const contentData: any = { ...this.content };
    
    // Ensure course is a number, not a string
    contentData.course = parseInt(contentData.course.toString(), 10);
    
    // If no lesson date is provided, set lesson_order to 0
    if (!contentData.lesson_date || contentData.lesson_date === '') {
      contentData.lesson_order = 0;
    } else if (!contentData.lesson_order) {
      contentData.lesson_order = 1;
    }

    this.courseContentService.createMaterial(contentData).subscribe({
      next: (content) => {
        this.uploading = false;
        this.contentCreated.emit(content);
        this.resetForm();
      },
      error: (error) => {
        this.uploading = false;
        this.error.emit('Failed to create material. Please try again.');
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
      material_type: '',
      is_published: true
    };
    this.selectedFile = null;
    this.cdr.detectChanges();
  }
}
