import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CourseService, Course, CourseMaterial, Meeting, Recording, TimetableEntry } from '../../core/course.service';
import { CommunicationService, Announcement } from '../../core/communication.service';
import { AuthService } from '../../core/auth.service';
import { CourseContentService } from '../../core/course-content.service';
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
      [unreadCount]="unreadAnnouncementsCount"
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
                  <p class="text-2xl font-semibold text-gray-900">{{ (materials || []).length }}</p>
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
                  <p class="text-2xl font-semibold text-gray-900">{{ (recordings || []).length }}</p>
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
                  <p class="text-2xl font-semibold text-gray-900">{{ (meetings || []).length }}</p>
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
                  <p class="text-2xl font-semibold text-gray-900">{{ (timetable || []).length }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Semester Progress -->
          <div *ngIf="currentSemester" class="bg-white border border-gray-200 rounded-2xl mb-8">
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-900">Semester Progress</h3>
                <div class="flex items-center space-x-2">
                  <span *ngIf="totalWeeks > 0" class="text-sm text-gray-700 mr-3">Week {{ currentWeek }} of {{ totalWeeks }}</span>
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        [ngClass]="{
                          'bg-green-100 text-green-800': currentSemester.progress_status === 'In Progress',
                          'bg-blue-100 text-blue-800': currentSemester.progress_status === 'Not Started',
                          'bg-gray-100 text-gray-800': currentSemester.progress_status === 'Completed'
                        }">
                    {{ currentSemester.progress_status }}
                  </span>
                </div>
              </div>
              
              <div class="space-y-6">
                <!-- Progress Bar -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">{{ currentSemester.academic_year_display }} - {{ currentSemester.semester_type_display }}</span>
                    <span class="text-sm font-semibold text-gray-900">{{ currentSemester.progress_percentage }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                         [style.width.%]="currentSemester.progress_percentage"></div>
                  </div>
                </div>

                <!-- Progress Details -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="text-center p-4 bg-gray-50 rounded-xl">
                    <div class="text-2xl font-bold text-gray-900">{{ currentSemester.days_elapsed }}</div>
                    <div class="text-sm text-gray-600">Days Elapsed</div>
                  </div>
                  <div class="text-center p-4 bg-gray-50 rounded-xl">
                    <div class="text-2xl font-bold text-gray-900">{{ currentSemester.total_days }}</div>
                    <div class="text-sm text-gray-600">Total Days</div>
                  </div>
                  <div class="text-center p-4 bg-gray-50 rounded-xl">
                    <div class="text-2xl font-bold text-gray-900">{{ currentSemester.days_remaining }}</div>
                    <div class="text-sm text-gray-600">Days Remaining</div>
                  </div>
                </div>

                <!-- Date Range -->
                <div class="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>Started: {{ currentSemester.start_date | date:'MMM d, y' }}</span>
                  </div>
                  <div class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>Ends: {{ currentSemester.end_date | date:'MMM d, y' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Recent Announcements -->
          <div class="bg-white border border-gray-200 rounded-2xl mb-8">
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-semibold text-gray-900">Recent Announcements</h3>
                <div class="flex items-center space-x-2">
                  <span *ngIf="unreadAnnouncementsCount > 0" 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {{ unreadAnnouncementsCount }} unread
                  </span>
                  <a routerLink="/announcements" 
                     class="text-gray-900 hover:text-gray-700 text-sm font-medium">
                    View all →
                  </a>
                </div>
              </div>
              <div class="space-y-4">
                <div *ngFor="let announcement of (announcements || []).slice(0, 3)" 
                     class="flex items-start justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                     [class.bg-blue-50]="!announcement.is_read"
                     [class.border-blue-200]="!announcement.is_read">
                  <div class="flex items-start flex-1">
                    <div class="flex-shrink-0">
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                           [ngClass]="{
                             'bg-blue-100': !announcement.is_read,
                             'bg-gray-100': announcement.is_read
                           }">
                        <svg class="h-5 w-5" 
                             [ngClass]="{
                               'text-blue-600': !announcement.is_read,
                               'text-gray-600': announcement.is_read
                             }" 
                             fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 9h6m-6 4h6m-6 4h4"/>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4 flex-1">
                      <div class="flex items-center space-x-2 mb-1">
                        <p class="text-sm font-semibold text-gray-900">{{ announcement.title }}</p>
                        <span *ngIf="!announcement.is_read" 
                              class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          New
                        </span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                              [ngClass]="{
                                'bg-green-100 text-green-800': announcement.priority === 'low',
                                'bg-blue-100 text-blue-800': announcement.priority === 'normal',
                                'bg-yellow-100 text-yellow-800': announcement.priority === 'high',
                                'bg-red-100 text-red-800': announcement.priority === 'urgent'
                              }">
                          {{ announcement.priority | titlecase }}
                        </span>
                      </div>
                      <p class="text-sm text-gray-600 mb-2">{{ announcement.content | slice:0:100 }}{{ announcement.content.length > 100 ? '...' : '' }}</p>
                      <div class="flex items-center text-xs text-gray-500">
                        <span>From: {{ announcement.sender?.full_name || 'Unknown' }}</span>
                        <span class="mx-2">•</span>
                        <span>{{ formatDate(announcement.created_at) }}</span>
                      </div>
                    </div>
                  </div>
                  <button (click)="markAnnouncementAsRead(announcement)" 
                          *ngIf="!announcement.is_read"
                          class="ml-4 text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-100 transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </button>
                </div>
                <div *ngIf="(announcements || []).length === 0" class="text-center py-8">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 9h6m-6 4h6m-6 4h4"/>
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">No announcements yet</h3>
                  <p class="mt-1 text-sm text-gray-500">Check back later for class updates.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Materials -->
          <div class="bg-white border border-gray-200 rounded-2xl mb-8">
            <div class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">Recent Materials</h3>
              <div class="space-y-4">
                <div *ngFor="let material of (materials || []).slice(0, 3)" 
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
                  <a (click)="viewMaterial(material); $event.preventDefault();" href="#" 
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
                <div *ngFor="let class of (timetable || []).slice(0, 3)" 
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

          <!-- Quick Actions Section -->
          <div class="mt-8 mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a routerLink="/course-timeline" 
                 class="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow group">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">Course Timeline</h3>
                    <p class="text-sm text-gray-600">Browse all course content chronologically</p>
                  </div>
                </div>
              </a>
              
              <a routerLink="/content-manager" 
                 *ngIf="isAdmin()"
                 class="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow group">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">Content Manager</h3>
                    <p class="text-sm text-gray-600">Add recordings and course materials</p>
                  </div>
                </div>
              </a>
              
              <a routerLink="/announcements" 
                 class="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow group">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                    <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 9h6m-6 4h6m-6 4h4"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Announcements</h3>
                    <p class="text-sm text-gray-600">View class announcements and updates</p>
                  </div>
                </div>
              </a>
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
                      {{ (coursesByYear[year] || []).length }} courses
                    </span>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div *ngFor="let course of (coursesByYear[year] || [])" class="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
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
  announcements: Announcement[] = [];
  unreadAnnouncementsCount = 0;
  isLoading = true;
  isSidebarOpen = false;
  currentUser: any = null;
  currentSemester: any = null;
  currentWeek = 0;
  totalWeeks = 0;

  constructor(
    private courseService: CourseService,
    private communicationService: CommunicationService,
    private authService: AuthService,
    private courseContentService: CourseContentService,
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

  markAnnouncementAsRead(announcement: Announcement): void {
    if (announcement.id && !announcement.is_read) {
      this.communicationService.markAnnouncementAsRead(announcement.id).subscribe({
        next: () => {
          // Update local state
          announcement.is_read = true;
          this.unreadAnnouncementsCount = Math.max(0, this.unreadAnnouncementsCount - 1);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error marking announcement as read:', error);
        }
      });
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
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
      ),
      announcements: this.communicationService.getAnnouncements().pipe(
        catchError(error => {
          console.error('Error loading announcements:', error);
          return of([]);
        })
      ),
      unreadCount: this.communicationService.getUnreadAnnouncementsCount().pipe(
        catchError(error => {
          console.error('Error loading unread count:', error);
          return of({ unread_count: 0, total_count: 0, read_count: 0 });
        })
      ),
      currentSemester: this.courseContentService.getCurrentSemester().pipe(
        catchError(error => {
          console.error('Error loading current semester:', error);
          return of(null);
        })
      )
    }).subscribe({
      next: (data) => {
        this.materials = data.materials;
        this.meetings = data.meetings;
        this.recordings = data.recordings;
        this.timetable = data.timetable;
        this.courses = data.courses;
        this.announcements = data.announcements;
        this.unreadAnnouncementsCount = data.unreadCount.unread_count;
        this.currentSemester = data.currentSemester;
        this.computeSemesterWeeks();
        
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

  private computeSemesterWeeks(): void {
    if (!this.currentSemester?.start_date || !this.currentSemester?.end_date) {
      this.currentWeek = 0;
      this.totalWeeks = 0;
      return;
    }

    const start = new Date(this.currentSemester.start_date);
    const end = new Date(this.currentSemester.end_date);
    // Normalize to start of day
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const msPerDay = 24 * 60 * 60 * 1000;
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / msPerDay) + 1);
    this.totalWeeks = Math.max(1, Math.ceil(totalDays / 7));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysElapsed = Math.max(0, Math.round((today.getTime() - start.getTime()) / msPerDay));
    const computedWeek = Math.floor(daysElapsed / 7) + 1;
    this.currentWeek = Math.min(this.totalWeeks, Math.max(1, computedWeek));
  }

  viewMaterial(material: any): void {
    if (!material?.file_url) return;
    const isPdf = material.file_url.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      const encoded = encodeURIComponent(material.file_url);
      const queryParams = new URLSearchParams();
      queryParams.set('url', encoded);
      
      // Add material information
      if (material.title) queryParams.set('title', encodeURIComponent(material.title));
      if (material.description) queryParams.set('description', encodeURIComponent(material.description));
      if (material.uploaded_by_name) queryParams.set('uploadedBy', encodeURIComponent(material.uploaded_by_name));
      if (material.created_at) queryParams.set('uploadDate', material.created_at);
      if (material.file_type) queryParams.set('materialType', encodeURIComponent(material.file_type.toUpperCase()));
      
      // Use routerLink would need Router injected; keep it simple via location change
      window.location.href = `/pdf?${queryParams.toString()}`;
    } else {
      window.open(material.file_url, '_blank');
    }
  }
}