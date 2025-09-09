import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Meeting } from '../../core/course.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, PageLayoutComponent],
  template: `
    <app-page-layout 
      pageTitle="Online Meetings" 
      pageSubtitle="University of Nairobi - Join virtual classes and meetings"
      [isSidebarOpen]="isSidebarOpen"
      (sidebarToggle)="onSidebarToggle($event)">
          
          <!-- Filter by Subject -->
          <div class="mb-6">
            <label for="subject-filter" class="block text-sm font-medium text-gray-700 mb-2">
              Filter by Subject
            </label>
            <select id="subject-filter" 
                    [(ngModel)]="selectedSubject" 
                    (change)="filterMeetings()"
                    class="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
              <option value="">All Subjects</option>
              <option *ngFor="let subject of subjects" [value]="subject">{{ subject }}</option>
            </select>
          </div>
          
          <!-- Meetings Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let meeting of filteredMeetings" 
                 class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              <div class="p-6">
                <div class="flex items-center mb-4">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-3">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ meeting.duration }} min
                    </span>
                  </div>
                </div>
                
                <h3 class="text-lg font-medium text-gray-900 mb-2">{{ meeting.title }}</h3>
                <p class="text-sm text-gray-600 mb-3">{{ meeting.description }}</p>
                
                <div class="space-y-2 mb-4">
                  <div class="flex items-center text-sm text-gray-500">
                    <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ meeting.date | date:'MMM d, y' }} at {{ meeting.time }}
                  </div>
                  <div class="flex items-center text-sm text-gray-500">
                    <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {{ meeting.subject }}
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-500">
                    <span class="font-medium">{{ meeting.subject }}</span>
                  </div>
                  <a [href]="meeting.link" 
                     class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Join
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div *ngIf="filteredMeetings.length === 0 && !isLoading" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No meetings scheduled</h3>
            <p class="mt-1 text-sm text-gray-500">Online meetings will appear here once they are scheduled.</p>
          </div>
    </app-page-layout>
    
    <app-loader [isLoading]="isLoading" message="Loading meetings..."></app-loader>
  `,
  styles: []
})
export class MeetingsComponent implements OnInit {
  meetings: Meeting[] = [];
  filteredMeetings: Meeting[] = [];
  subjects: string[] = [];
  selectedSubject = '';
  isLoading = true;
  isSidebarOpen = false;

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadMeetings();
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  private loadMeetings(): void {
    this.isLoading = true;
    this.courseService.getMeetings().subscribe({
      next: (meetings) => {
        this.meetings = meetings;
        this.filteredMeetings = meetings;
        this.subjects = [...new Set(meetings.map(m => m.subject))];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterMeetings(): void {
    if (this.selectedSubject) {
      this.filteredMeetings = this.meetings.filter(m => m.subject === this.selectedSubject);
    } else {
      this.filteredMeetings = this.meetings;
    }
  }
}