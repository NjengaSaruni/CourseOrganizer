import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseContentService, CourseContentCreate, FileUploadResponse } from '../../../core/course-content.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-recordings-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center mb-4">
        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Class Recording</h3>
          <p class="text-sm text-gray-600">Upload or link to class recordings</p>
        </div>
      </div>

      <form (ngSubmit)="onSubmit()" #recordingsForm="ngForm" class="space-y-4">
        
        <!-- Course Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Course *</label>
          <select [(ngModel)]="content.course" 
                  name="course" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Select a course</option>
            <option *ngFor="let course of courses" [value]="course.id">
              {{ course.name }}
            </option>
          </select>
        </div>

        <!-- Recording Platform -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Recording Platform *</label>
          <select [(ngModel)]="content.recording_platform" 
                  name="recording_platform" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Select platform</option>
            <option *ngFor="let platform of recordingPlatforms" [value]="platform.value">
              {{ platform.label }}
            </option>
          </select>
        </div>

        <!-- Lesson Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Lesson Date *</label>
          <input type="date" 
                 [(ngModel)]="content.lesson_date" 
                 name="lesson_date"
                 required
                 (change)="onLessonDateChange()"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
        </div>

        <!-- Topic -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Topic</label>
          <input type="text" 
                 [(ngModel)]="content.topic" 
                 name="topic"
                 placeholder="e.g., Introduction to Tort Law"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
        </div>

        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input type="text" 
                 [(ngModel)]="content.title" 
                 name="title"
                 required
                 placeholder="e.g., Tort I - Class Recording - Introduction"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea [(ngModel)]="content.description" 
                    name="description"
                    rows="3"
                    placeholder="Brief description of the recording content..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"></textarea>
        </div>

        <!-- Duration -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
          <input type="number" 
                 [(ngModel)]="durationMinutes" 
                 name="duration"
                 min="1"
                 placeholder="e.g., 90"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
        </div>

        <!-- Audio Only Toggle -->
        <div class="flex items-center">
          <input type="checkbox" 
                 [(ngModel)]="content.audio_only" 
                 name="audio_only"
                 id="audio-only"
                 class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded">
          <label for="audio-only" class="ml-2 block text-sm text-gray-700">
            Audio only recording
          </label>
        </div>

        <!-- File Upload or URL -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Recording Source *</label>
          <div class="space-y-3">
            <!-- File Upload Option -->
            <div class="border-2 border-gray-300 border-dashed rounded-md p-4 hover:border-gray-400 transition-colors">
              <div class="text-center">
                <svg class="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="mt-2">
                  <label for="recording-file-upload" class="cursor-pointer">
                    <span class="mt-2 block text-sm font-medium text-gray-700">Upload recording file</span>
                    <input id="recording-file-upload" 
                           name="recording-file-upload" 
                           type="file" 
                           class="sr-only"
                           accept=".mp4,.mp3,.wav,.m4a,.mov"
                           (change)="onFileSelected($event)">
                  </label>
                  <p class="text-xs text-gray-500">MP4, MP3, WAV, M4A, MOV up to 100MB</p>
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
                     placeholder="https://example.com/recording-link"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
              <p class="text-xs text-gray-500 mt-1">Enter a direct link to the recording</p>
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
                  [disabled]="!recordingsForm.form.valid || uploading"
                  class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <span *ngIf="!uploading">Add Recording</span>
            <span *ngIf="uploading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          </button>
        </div>
      </form>
    </div>
  `
})
export class RecordingsFormComponent implements OnInit {
  @Input() courses: any[] = [];
  @Output() contentCreated = new EventEmitter<any>();
  @Output() error = new EventEmitter<string>();

  content: CourseContentCreate = {
    title: '',
    description: '',
    content_type: 'recording',
    course: 0,
    recording_platform: '',
    lesson_date: '',
    topic: '',
    audio_only: false,
    is_published: true
  };

  selectedFile: File | null = null;
  uploading = false;
  durationMinutes = 0;
  recordingPlatforms: any[] = [];

  constructor(
    private courseContentService: CourseContentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.recordingPlatforms = this.courseContentService.getRecordingPlatformOptions();
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
      this.error.emit('Please either upload a file or provide a recording URL.');
      return;
    }

    if (!this.content.course || this.content.course === 0) {
      this.error.emit('Please select a course.');
      return;
    }

    if (!this.content.recording_platform) {
      this.error.emit('Please select a recording platform.');
      return;
    }

    if (!this.content.lesson_date) {
      this.error.emit('Please select a lesson date.');
      return;
    }

    this.uploading = true;

    // Set duration if provided
    if (this.durationMinutes > 0) {
      this.content.duration = this.durationMinutes.toString();
    }

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
    
    // Calculate lesson order if not set
    if (!contentData.lesson_order) {
      contentData.lesson_order = 1;
    }

    this.courseContentService.createCourseContent(contentData).subscribe({
      next: (content) => {
        this.uploading = false;
        this.contentCreated.emit(content);
        this.resetForm();
      },
      error: (error) => {
        this.uploading = false;
        this.error.emit('Failed to create recording. Please try again.');
        console.error('Content creation error:', error);
      }
    });
  }

  private resetForm(): void {
    this.content = {
      title: '',
      description: '',
      content_type: 'recording',
      course: 0,
      recording_platform: '',
      lesson_date: '',
      topic: '',
      audio_only: false,
      is_published: true
    };
    this.selectedFile = null;
    this.durationMinutes = 0;
    this.cdr.detectChanges();
  }
}
