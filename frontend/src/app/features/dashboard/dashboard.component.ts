import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CourseService, Course, CourseMaterial, Meeting, Recording, TimetableEntry } from '../../core/course.service';
import { AuthService } from '../../core/auth.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PageLayoutComponent],
  template: `
    <app-page-layout 
      pageTitle="University of Nairobi - Dashboard" 
      pageSubtitle="Welcome to your course management system"
      [isSidebarOpen]="isSidebarOpen"
      (sidebarToggle)="onSidebarToggle($event)">
          
          <!-- Loading State -->
          <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-20">
            <div class="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
            <div class="mt-6 text-center">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
              <p class="text-gray-600">Fetching your course data...</p>
            </div>
          </div>

          <!-- Dashboard Content -->
          <div *ngIf="!isLoading">
          

          <!-- Quick Stats -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white border border-gray-200 rounded-2xl p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Materials</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ materials.length }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white border border-gray-200 rounded-2xl p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Recordings</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ recordings.length }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white border border-gray-200 rounded-2xl p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Meetings</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ meetings.length }}</p>
                </div>
              </div>
            </div>
            
            <div class="bg-white border border-gray-200 rounded-2xl p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Classes</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ timetable.length }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Recent Materials -->
          <div class="bg-white border border-gray-200 rounded-2xl mb-8">
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">Recent Materials</h3>
              <div class="space-y-4">
                <div *ngFor="let material of materials.slice(0, 3)" 
                     class="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <svg class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-semibold text-gray-900">{{ material.title }}</p>
                      <p class="text-sm text-gray-600">{{ material.description }}</p>
                    </div>
                  </div>
                  <a [href]="material.file_url" 
                     class="text-gray-900 hover:text-gray-700 text-sm font-medium">
                    View
                  </a>
                </div>
              </div>
              <div class="mt-6">
                <a routerLink="/materials" 
                   class="text-gray-900 hover:text-gray-700 text-sm font-medium">
                  View all materials →
                </a>
              </div>
            </div>
          </div>
          
          <!-- Upcoming Classes -->
          <div class="bg-white border border-gray-200 rounded-2xl">
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">Upcoming Classes</h3>
              <div class="space-y-4">
                <div *ngFor="let class of timetable.slice(0, 3)" 
                     class="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div class="flex items-center">
                    <div class="flex-shrink-0">
                      <div class="h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <span class="text-sm font-semibold text-gray-900">{{ class.day.charAt(0) }}</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <p class="text-sm font-semibold text-gray-900">{{ class.subject }}</p>
                      <p class="text-sm text-gray-600">{{ class.time }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-900">{{ class.location }}</p>
                    <p class="text-sm text-gray-600">{{ class.lecturer }}</p>
                  </div>
                </div>
              </div>
              <div class="mt-6">
                <a routerLink="/timetable" 
                   class="text-gray-900 hover:text-gray-700 text-sm font-medium">
                  View full timetable →
                </a>
              </div>
            </div>
          </div>

          <!-- Courses by Year Section -->
          <div class="mt-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-8">Courses by Academic Year</h2>
            <div class="space-y-8">
              <div *ngFor="let year of getYears()" class="bg-white border border-gray-200 rounded-2xl">
                <div class="p-6">
                  <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-semibold text-gray-900">
                      Year {{ year }} - First Semester
                    </h3>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      {{ coursesByYear[year].length }} courses
                    </span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div *ngFor="let course of coursesByYear[year]" class="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <h4 class="text-sm font-semibold text-gray-900">{{ course.code }}</h4>
                          <p class="text-sm text-gray-600 mt-1">{{ course.name }}</p>
                          <div class="mt-3 flex items-center text-xs text-gray-500">
                            <span class="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 mr-2">
                              {{ course.credits }} credits
                            </span>
                            <span *ngIf="course.is_core" class="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700">
                              Core
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div> <!-- End Dashboard Content -->
    </app-page-layout>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  materials: CourseMaterial[] = [];
  meetings: Meeting[] = [];
  recordings: Recording[] = [];
  timetable: TimetableEntry[] = [];
  courses: Course[] = [];
  coursesByYear: { [year: number]: Course[] } = {};
  isLoading = true;
  isSidebarOpen = false;
  currentUser: any = null;

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Only load data if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.loadDashboardData();
    } else {
      this.isLoading = false;
    }
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  getYears(): number[] {
    return Object.keys(this.coursesByYear).map(year => parseInt(year)).sort();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    
    // Use forkJoin to wait for all requests to complete
    forkJoin({
      materials: this.courseService.getMaterials().pipe(
        catchError(error => {
          console.error('Error loading materials:', error);
          return of([]);
        })
      ),
      meetings: this.courseService.getMeetings().pipe(
        catchError(error => {
          console.error('Error loading meetings:', error);
          return of([]);
        })
      ),
      recordings: this.courseService.getRecordings().pipe(
        catchError(error => {
          console.error('Error loading recordings:', error);
          return of([]);
        })
      ),
      timetable: this.courseService.getTimetable().pipe(
        catchError(error => {
          console.error('Error loading timetable:', error);
          return of([]);
        })
      ),
      courses: this.courseService.getCourses().pipe(
        catchError(error => {
          console.error('Error loading courses:', error);
          return of([]);
        })
      )
    }).subscribe({
      next: (data) => {
        this.materials = data.materials;
        this.meetings = data.meetings;
        this.recordings = data.recordings;
        this.timetable = data.timetable;
        this.courses = data.courses;
        
        // Group courses by year
        this.coursesByYear = {};
        if (Array.isArray(this.courses)) {
          this.courses.forEach(course => {
            if (!this.coursesByYear[course.year]) {
              this.coursesByYear[course.year] = [];
            }
            this.coursesByYear[course.year].push(course);
          });
        } else {
          console.warn('Courses data is not an array:', this.courses);
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}