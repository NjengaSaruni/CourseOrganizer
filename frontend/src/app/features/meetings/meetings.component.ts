import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Meeting } from '../../core/course.service';
import { AuthService } from '../../core/auth.service';
import { VideoCallService, VideoCallResponse } from '../../core/video-call.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [CommonModule, FormsModule, PageLayoutComponent],
  template: `
    <app-page-layout 
      pageTitle="Online Meetings" 
      pageSubtitle="University of Nairobi - Join virtual classes and meetings"
      [isSidebarOpen]="isSidebarOpen"
      (sidebarToggle)="onSidebarToggle($event)">
          
          <!-- Loading State -->
          <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-20">
            <div class="relative">
              <!-- Meeting icon with spinning effect -->
              <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-8 h-8 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <!-- Spinning ring around icon -->
              <div class="absolute -inset-2 w-20 h-20 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div class="mt-6 text-center">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Loading Meetings</h3>
              <p class="text-sm text-gray-500">Fetching your scheduled meetings...</p>
              <!-- Skeleton cards -->
              <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                <div *ngFor="let i of [1,2,3]" class="bg-white rounded-lg shadow-md animate-pulse" [style.animation-delay]="(i-1)*0.1 + 's'">
                  <div class="p-6">
                    <div class="flex items-center mb-4">
                      <div class="h-10 w-10 bg-gray-200 rounded-lg"></div>
                      <div class="ml-3">
                        <div class="h-6 w-16 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                    <div class="h-6 bg-gray-200 rounded mb-2"></div>
                    <div class="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                    <div class="space-y-2 mb-4">
                      <div class="h-3 bg-gray-200 rounded w-full"></div>
                      <div class="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div class="h-8 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Meetings Content -->
          <div *ngIf="!isLoading">
          
          <!-- Create New Meeting Section (for admins) -->
          <div *ngIf="authService.isAdmin()" class="mb-8 bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Create New Jitsi Meeting</h3>
            <form (ngSubmit)="createJitsiMeeting()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="meeting-title" class="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Title
                  </label>
                  <input type="text" 
                         id="meeting-title"
                         [(ngModel)]="newMeeting.title" 
                         name="title"
                         required
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                </div>
                <div>
                  <label for="meeting-course" class="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <select id="meeting-course"
                          [(ngModel)]="newMeeting.course" 
                          name="course"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Select Course</option>
                    <option *ngFor="let course of availableCourses" [value]="course.id">{{ course.name }}</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label for="meeting-description" class="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea id="meeting-description"
                          [(ngModel)]="newMeeting.description" 
                          name="description"
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"></textarea>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="meeting-time" class="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Time
                  </label>
                  <input type="datetime-local" 
                         id="meeting-time"
                         [(ngModel)]="newMeeting.scheduled_time" 
                         name="scheduled_time"
                         required
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                </div>
                <div>
                  <label for="meeting-duration" class="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input type="number" 
                         id="meeting-duration"
                         [(ngModel)]="newMeeting.duration_minutes" 
                         name="duration_minutes"
                         min="15"
                         max="480"
                         placeholder="60"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                </div>
              </div>
              
              <div class="flex items-center">
                <input type="checkbox" 
                       id="recording-enabled"
                       [(ngModel)]="newMeeting.is_recording_enabled" 
                       name="is_recording_enabled"
                       class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded">
                <label for="recording-enabled" class="ml-2 block text-sm text-gray-700">
                  Enable recording for this meeting
                </label>
              </div>
              
              <div class="flex justify-end">
                <button type="submit" 
                        [disabled]="isCreatingMeeting"
                        class="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors">
                  <span *ngIf="isCreatingMeeting">Creating...</span>
                  <span *ngIf="!isCreatingMeeting">Create Jitsi Meeting</span>
                </button>
              </div>
            </form>
          </div>
          
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
                    <div class="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-3 flex-1">
                    <div class="flex items-center space-x-2">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {{ meeting.platform_display || 'Jitsi Meet' }}
                      </span>
                      <span *ngIf="meeting.is_recording_enabled" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        📹 Recording
                      </span>
                    </div>
                  </div>
                </div>
                
                <h3 class="text-lg font-medium text-gray-900 mb-2">{{ meeting.title }}</h3>
                <p class="text-sm text-gray-600 mb-3">{{ meeting.description }}</p>
                
                <div class="space-y-2 mb-4">
                  <div class="flex items-center text-sm text-gray-500">
                    <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ meeting.scheduled_time | date:'MMM d, y' }} at {{ meeting.scheduled_time | date:'h:mm a' }}
                  </div>
                  <div class="flex items-center text-sm text-gray-500">
                    <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {{ meeting.created_by_name }}
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-500">
                    <span class="font-medium">{{ meeting.created_by_name }}</span>
                  </div>
                  <div class="flex space-x-2">
                    <button (click)="joinMeeting(meeting)" 
                            [disabled]="!meeting.can_join"
                            class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {{ meeting.can_join ? 'Join Meeting' : 'Not Available' }}
                    </button>
                    <button *ngIf="authService.isAdmin() || meeting.created_by === authService.getCurrentUser()?.id" 
                            (click)="manageMeeting(meeting)"
                            class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                      <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Manage
                    </button>
                  </div>
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
          </div> <!-- End Meetings Content -->
    </app-page-layout>
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
  
  // New meeting creation properties
  isCreatingMeeting = false;
  availableCourses: any[] = [];
  newMeeting = {
    title: '',
    description: '',
    course: '',
    scheduled_time: '',
    duration_minutes: 60,
    is_recording_enabled: true
  };

  constructor(
    private courseService: CourseService,
    public authService: AuthService,
    private videoCallService: VideoCallService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Only load data if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.loadMeetings();
      if (this.authService.isAdmin()) {
        this.loadCourses();
      }
    } else {
      this.isLoading = false;
    }
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
        this.subjects = ['All Courses']; // We'll update this when we have course data
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterMeetings(): void {
    if (this.selectedSubject && this.selectedSubject !== 'All Courses') {
      this.filteredMeetings = this.meetings.filter(m => m.title.toLowerCase().includes(this.selectedSubject.toLowerCase()));
    } else {
      this.filteredMeetings = this.meetings;
    }
  }

  private loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (response: any) => {
        this.availableCourses = response.results || response || [];
      },
      error: (error: any) => {
        console.error('Error loading courses:', error);
      }
    });
  }

  createJitsiMeeting(): void {
    if (!this.newMeeting.title || !this.newMeeting.course || !this.newMeeting.scheduled_time) {
      alert('Please fill in all required fields');
      return;
    }

    this.isCreatingMeeting = true;
    
    const meetingData = {
      title: this.newMeeting.title,
      description: this.newMeeting.description,
      course: parseInt(this.newMeeting.course),
      scheduled_time: this.newMeeting.scheduled_time,
      duration: this.newMeeting.duration_minutes ? `${this.newMeeting.duration_minutes}:00` : null,
      is_recording_enabled: this.newMeeting.is_recording_enabled,
      platform: 'jitsi'
    };

    this.courseService.createJitsiMeeting(meetingData).subscribe({
      next: (response) => {
        console.log('Meeting created successfully:', response);
        this.loadMeetings(); // Reload meetings
        this.resetForm();
        alert('Jitsi meeting created successfully!');
      },
      error: (error) => {
        console.error('Error creating meeting:', error);
        alert('Error creating meeting. Please try again.');
      },
      complete: () => {
        this.isCreatingMeeting = false;
      }
    });
  }

  private resetForm(): void {
    this.newMeeting = {
      title: '',
      description: '',
      course: '',
      scheduled_time: '',
      duration_minutes: 60,
      is_recording_enabled: true
    };
  }

  joinMeeting(meeting: Meeting): void {
    if (!meeting.can_join) {
      alert('This meeting is not available for joining at this time.');
      return;
    }

    // Check media device support before attempting to join
    const mediaInfo = this.videoCallService.getMediaDeviceInfo();
    console.log('Media device info:', mediaInfo);

    if (!this.videoCallService.isSecureContext()) {
      alert('Camera and microphone access requires a secure connection (HTTPS). Please ensure you are using HTTPS.');
      return;
    }

    if (!this.videoCallService.isMediaDevicesSupported()) {
      alert('Your browser does not support camera and microphone access. Please use a modern browser.');
      return;
    }

    this.videoCallService.joinMeeting(meeting.id).subscribe({
      next: (response: VideoCallResponse) => {
        // Use the embedded video call service to open the video call in the header
        this.videoCallService.openEmbeddedVideoCall(response);
      },
      error: (error) => {
        console.error('Error joining meeting:', error);
        alert('Error joining meeting. Please try again.');
      }
    });
  }

  manageMeeting(meeting: Meeting): void {
    // For now, just show meeting details
    // In the future, this could open a modal with recording controls, etc.
    const details = `
Meeting: ${meeting.title}
Status: ${meeting.status_display || 'Scheduled'}
Platform: ${meeting.platform_display || 'Jitsi Meet'}
Recording: ${meeting.is_recording_enabled ? 'Enabled' : 'Disabled'}
Meeting ID: ${meeting.meeting_id}
    `.trim();
    
    alert(details);
  }
}