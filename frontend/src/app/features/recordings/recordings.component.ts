import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Recording } from '../../core/course.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';

@Component({
  selector: 'app-recordings',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, PageLayoutComponent],
  template: `
    <app-page-layout 
      pageTitle="Lecture Recordings" 
      pageSubtitle="University of Nairobi - Watch recorded lectures and presentations"
      [isSidebarOpen]="isSidebarOpen"
      (sidebarToggle)="onSidebarToggle($event)">
          
          <!-- Filter by Subject -->
          <div class="mb-6">
            <label for="subject-filter" class="block text-sm font-medium text-gray-700 mb-2">
              Filter by Subject
            </label>
            <select id="subject-filter" 
                    [(ngModel)]="selectedSubject" 
                    (change)="filterRecordings()"
                    class="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
              <option value="">All Subjects</option>
              <option *ngFor="let subject of subjects" [value]="subject">{{ subject }}</option>
            </select>
          </div>
          
          <!-- Recordings Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let recording of filteredRecordings" 
                 class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              <div class="p-6">
                <div class="flex items-center mb-4">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-3">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {{ recording.duration }} min
                    </span>
                  </div>
                </div>
                
                <h3 class="text-lg font-medium text-gray-900 mb-2">{{ recording.title }}</h3>
                <p class="text-sm text-gray-600 mb-3">{{ recording.description }}</p>
                
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-500">
                    <span class="font-medium">{{ recording.subject }}</span>
                    <span class="mx-2">•</span>
                    <span>{{ recording.date | date:'MMM d, y' }}</span>
                  </div>
                  <a [href]="recording.url" 
                     class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <svg class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                    </svg>
                    Watch
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div *ngIf="filteredRecordings.length === 0 && !isLoading" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No recordings available</h3>
            <p class="mt-1 text-sm text-gray-500">Lecture recordings will appear here once they are uploaded.</p>
          </div>
    </app-page-layout>
    
    <app-loader [isLoading]="isLoading" message="Loading recordings..."></app-loader>
  `,
  styles: []
})
export class RecordingsComponent implements OnInit {
  recordings: Recording[] = [];
  filteredRecordings: Recording[] = [];
  subjects: string[] = [];
  selectedSubject = '';
  isLoading = true;
  isSidebarOpen = false;

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadRecordings();
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  private loadRecordings(): void {
    this.isLoading = true;
    this.courseService.getRecordings().subscribe({
      next: (recordings) => {
        this.recordings = recordings;
        this.filteredRecordings = recordings;
        this.subjects = [...new Set(recordings.map(r => r.subject))];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterRecordings(): void {
    if (this.selectedSubject) {
      this.filteredRecordings = this.recordings.filter(r => r.subject === this.selectedSubject);
    } else {
      this.filteredRecordings = this.recordings;
    }
  }
}