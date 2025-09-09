import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService, CourseMaterial, Meeting, Recording, TimetableEntry } from '../../core/course.service';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- Sidebar -->
      <div class="hidden md:flex md:w-64 md:flex-col">
        <div class="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
          <div class="flex items-center flex-shrink-0 px-4">
            <h2 class="text-xl font-bold text-navy-500">Course Organizer</h2>
          </div>
          <div class="mt-5 flex-grow flex flex-col">
            <nav class="flex-1 px-2 pb-4 space-y-1">
              <a routerLink="/dashboard" 
                 routerLinkActive="bg-primary-100 text-primary-700 border-r-2 border-primary-500" 
                 class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-700">
                <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                Dashboard
              </a>
              <a routerLink="/timetable" 
                 routerLinkActive="bg-primary-100 text-primary-700 border-r-2 border-primary-500" 
                 class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-700">
                <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Timetable
              </a>
              <a routerLink="/materials" 
                 routerLinkActive="bg-primary-100 text-primary-700 border-r-2 border-primary-500" 
                 class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-700">
                <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Materials
              </a>
              <a routerLink="/recordings" 
                 routerLinkActive="bg-primary-100 text-primary-700 border-r-2 border-primary-500" 
                 class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-700">
                <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Recordings
              </a>
              <a routerLink="/meetings" 
                 routerLinkActive="bg-primary-100 text-primary-700 border-r-2 border-primary-500" 
                 class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-700">
                <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Meetings
              </a>
            </nav>
          </div>
        </div>
      </div>

      <!-- Mobile sidebar overlay -->
      <div *ngIf="isSidebarOpen" class="fixed inset-0 z-40 md:hidden">
        <div class="fixed inset-0 bg-gray-600 bg-opacity-75" (click)="toggleSidebar()"></div>
        <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div class="absolute top-0 right-0 -mr-12 pt-2">
            <button (click)="toggleSidebar()" 
                    class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div class="flex-shrink-0 flex items-center px-4">
              <h2 class="text-xl font-bold text-navy-500">Course Organizer</h2>
            </div>
            <nav class="mt-5 px-2 space-y-1">
              <a routerLink="/dashboard" 
                 routerLinkActive="bg-primary-100 text-primary-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-700">
                <svg class="mr-4 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                Dashboard
              </a>
              <a routerLink="/timetable" 
                 routerLinkActive="bg-primary-100 text-primary-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-700">
                <svg class="mr-4 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Timetable
              </a>
              <a routerLink="/materials" 
                 routerLinkActive="bg-primary-100 text-primary-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-700">
                <svg class="mr-4 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Materials
              </a>
              <a routerLink="/recordings" 
                 routerLinkActive="bg-primary-100 text-primary-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-700">
                <svg class="mr-4 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Recordings
              </a>
              <a routerLink="/meetings" 
                 routerLinkActive="bg-primary-100 text-primary-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-primary-50 hover:text-primary-700">
                <svg class="mr-4 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Meetings
              </a>
            </nav>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top header -->
        <div class="bg-white shadow-sm border-b border-gray-200">
          <div class="px-4 sm:px-6 lg:px-8">
            <div class="py-6 flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-navy-500">University of Nairobi - Dashboard</h1>
                <p class="mt-1 text-sm text-gray-600">Welcome to your course management system</p>
              </div>
              <!-- Mobile menu button -->
              <button (click)="toggleSidebar()" 
                      class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Main content area -->
        <div class="flex-1 overflow-y-auto">
          <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <!-- Quick Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Materials</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ materials.length }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Recordings</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ recordings.length }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Meetings</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ meetings.length }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Classes</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ timetable.length }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Recent Materials -->
          <div class="bg-white shadow rounded-lg mb-8">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Materials</h3>
              <div class="space-y-3">
                <div *ngFor="let material of materials.slice(0, 3)" 
                     class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">{{ material.title }}</p>
                      <p class="text-sm text-gray-500">{{ material.subject }}</p>
                    </div>
                  </div>
                  <a [href]="material.url" 
                     class="text-primary-600 hover:text-primary-500 text-sm font-medium">
                    View
                  </a>
                </div>
              </div>
              <div class="mt-4">
                <a routerLink="/materials" 
                   class="text-primary-600 hover:text-primary-500 text-sm font-medium">
                  View all materials →
                </a>
              </div>
            </div>
          </div>
          
          <!-- Upcoming Classes -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Upcoming Classes</h3>
              <div class="space-y-3">
                <div *ngFor="let class of timetable.slice(0, 3)" 
                     class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span class="text-sm font-medium text-primary-600">{{ class.day.charAt(0) }}</span>
                      </div>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">{{ class.subject }}</p>
                      <p class="text-sm text-gray-500">{{ class.startTime }} - {{ class.endTime }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-900">{{ class.location }}</p>
                    <p class="text-sm text-gray-500">{{ class.instructor }}</p>
                  </div>
                </div>
              </div>
              <div class="mt-4">
                <a routerLink="/timetable" 
                   class="text-primary-600 hover:text-primary-500 text-sm font-medium">
                  View full timetable →
                </a>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <app-loader [isLoading]="isLoading" message="Loading dashboard..."></app-loader>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  materials: CourseMaterial[] = [];
  meetings: Meeting[] = [];
  recordings: Recording[] = [];
  timetable: TimetableEntry[] = [];
  isLoading = true;
  isSidebarOpen = false;

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    
    // Load all data in parallel
    this.courseService.getMaterials().subscribe(materials => {
      this.materials = materials;
    });
    
    this.courseService.getMeetings().subscribe(meetings => {
      this.meetings = meetings;
    });
    
    this.courseService.getRecordings().subscribe(recordings => {
      this.recordings = recordings;
    });
    
    this.courseService.getTimetable().subscribe(timetable => {
      this.timetable = timetable;
      this.isLoading = false;
    });
  }
}