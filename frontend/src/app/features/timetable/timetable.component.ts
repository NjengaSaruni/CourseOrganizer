import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService, TimetableEntry } from '../../core/course.service';
import { AuthService } from '../../core/auth.service';
import { CalendarService, CalendarEvent as CalendarEventType } from '../../core/calendar.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
  lecturer: string;
  course: string;
  color: string;
  day: string;
  time: string;
}

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, PageLayoutComponent],
  template: `
    <app-page-layout 
      pageTitle="Class Timetable" 
      pageSubtitle="University of Nairobi - Your weekly schedule at a glance"
      [isSidebarOpen]="isSidebarOpen"
      (sidebarToggle)="onSidebarToggle($event)">
          
      <!-- Loading State -->
      <div *ngIf="isLoading" class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div class="p-6">
          <div class="flex flex-col items-center justify-center py-16">
            <div class="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
            <div class="mt-6 text-center">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Loading Timetable</h3>
              <p class="text-gray-600">Fetching your class schedule...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Timetable Content -->
      <div *ngIf="!isLoading" class="space-y-6">
        
        <!-- View Toggle -->
        <div class="bg-white shadow rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h3 class="text-lg font-medium text-gray-900">Weekly Schedule</h3>
              <div class="flex items-center space-x-2 text-sm text-gray-500">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Academic Year 2025/2026 - First Semester</span>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <button 
                (click)="downloadFullTimetable()" 
                class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Timetable
              </button>
              
              <div class="flex bg-gray-100 rounded-lg p-1">
                <button 
                  (click)="viewMode = 'grid'" 
                  [class]="viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
                  class="px-3 py-1 rounded-md text-sm font-medium transition-colors">
                  Grid View
                </button>
                <button 
                  (click)="viewMode = 'calendar'" 
                  [class]="viewMode === 'calendar' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
                  class="px-3 py-1 rounded-md text-sm font-medium transition-colors">
                  Calendar View
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Grid View -->
        <div *ngIf="viewMode === 'grid'" class="bg-white shadow rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <!-- Header Row -->
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Time
                  </th>
                  <th *ngFor="let day of days" class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div class="text-gray-900 font-semibold">{{ day }}</div>
                    <div class="text-gray-500 text-xs mt-1">{{ getDayDate(day) }}</div>
                  </th>
                </tr>
              </thead>
              
              <!-- Time Slot Rows -->
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let timeSlot of timeSlots" class="hover:bg-gray-50">
                  <!-- Time Column -->
                  <td class="px-4 py-4 whitespace-nowrap bg-gray-50 border-r border-gray-200">
                    <div class="text-sm font-medium text-gray-900 text-center">{{ timeSlot }} - {{ getNextTimeSlot(timeSlot) }}</div>
                  </td>
                  
                  <!-- Day Columns -->
                  <td *ngFor="let day of days" class="px-2 py-4 align-top border-r border-gray-200 min-h-[100px]">
                    <div class="space-y-1">
                      <div *ngFor="let event of getEventsForDayAndTime(day, timeSlot)" 
                           class="p-2 rounded-md text-xs cursor-pointer transition-all hover:shadow-md border-l-4 mb-1"
                           [style.background-color]="event.color + '20'"
                           [style.border-left-color]="event.color"
                           (click)="selectEvent(event)">
                        <div class="font-semibold text-gray-900 truncate text-xs">{{ event.course }}</div>
                        <div class="text-gray-600 truncate text-xs mt-1">{{ event.location }}</div>
                        <div class="text-gray-500 truncate text-xs">{{ event.lecturer }}</div>
                        <div class="text-gray-400 truncate text-xs mt-1">{{ event.time }}</div>
                      </div>
                      
                      <!-- Empty cell indicator -->
                      <div *ngIf="getEventsForDayAndTime(day, timeSlot).length === 0" 
                           class="h-16 flex items-center justify-center text-gray-300">
                        <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Calendar View -->
        <div *ngIf="viewMode === 'calendar'" class="bg-white shadow rounded-lg overflow-hidden">
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let day of days" class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-lg font-semibold text-gray-900">{{ day }}</h4>
                  <div class="text-sm text-gray-500">{{ getDayDate(day) }}</div>
                </div>
                
                <div class="space-y-3">
                  <div *ngFor="let event of getEventsForDay(day)" 
                       class="p-3 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md"
                       [style.border-left-color]="event.color"
                       [style.background-color]="event.color + '10'"
                       (click)="selectEvent(event)">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <div class="font-medium text-gray-900 text-sm">{{ event.course }}</div>
                        <div class="text-xs text-gray-600 mt-1">{{ event.title }}</div>
                        <div class="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                          <div class="flex items-center">
                            <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {{ event.time }}
                          </div>
                          <div class="flex items-center">
                            <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {{ event.location }}
                          </div>
                        </div>
                      </div>
                      <div class="ml-2">
                        <div class="w-3 h-3 rounded-full" [style.background-color]="event.color"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div *ngIf="getEventsForDay(day).length === 0" class="text-center py-4 text-gray-400">
                    <svg class="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <div class="text-sm">No classes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Event Details Modal -->
        <div *ngIf="selectedEvent" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" (click)="closeEventDetails()">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" (click)="$event.stopPropagation()">
            <div class="mt-3">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">{{ selectedEvent.course }}</h3>
                <button (click)="closeEventDetails()" class="text-gray-400 hover:text-gray-600">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div class="space-y-3">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm text-gray-600">{{ selectedEvent.day }} at {{ selectedEvent.time }}</span>
                </div>
                
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="text-sm text-gray-600">{{ selectedEvent.location }}</span>
                </div>
                
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="text-sm text-gray-600">{{ selectedEvent.lecturer }}</span>
                </div>
              </div>
              
              <div class="mt-6 flex justify-end space-x-3">
                <button (click)="closeEventDetails()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                  Close
                </button>
                <div class="relative">
                  <button (click)="toggleCalendarOptions()" class="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90" 
                          [style.background-color]="selectedEvent.color">
                    Add to Calendar
                  </button>
                  
                  <!-- Calendar Options Dropdown -->
                  <div *ngIf="showCalendarOptions" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div class="py-1">
                      <button (click)="addToGoogleCalendar()" class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <span class="mr-3">📅</span>
                        Google Calendar
                      </button>
                      <button (click)="addToOutlook()" class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <span class="mr-3">📧</span>
                        Outlook
                      </button>
                      <button (click)="downloadICS()" class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <span class="mr-3">⬇️</span>
                        Download ICS
                      </button>
                      <button (click)="shareEvent()" class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <span class="mr-3">📤</span>
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="timetable.length === 0 && !isLoading" class="bg-white shadow rounded-lg overflow-hidden">
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No classes scheduled</h3>
            <p class="mt-1 text-sm text-gray-500">Your timetable will appear here once classes are scheduled.</p>
          </div>
        </div>
      </div>
    </app-page-layout>
  `,
  styles: []
})
export class TimetableComponent implements OnInit {
  timetable: TimetableEntry[] = [];
  calendarEvents: CalendarEvent[] = [];
  isLoading = true;
  isSidebarOpen = false;
  viewMode: 'grid' | 'calendar' = 'grid';
  selectedEvent: CalendarEvent | null = null;
  showCalendarOptions = false;

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
  
  courseColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private calendarService: CalendarService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.loadTimetable();
    } else {
      this.isLoading = false;
    }
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  private loadTimetable(): void {
    this.isLoading = true;
    this.courseService.getTimetable().subscribe({
      next: (timetable) => {
        this.timetable = timetable;
        this.calendarEvents = this.convertToCalendarEvents(timetable);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private convertToCalendarEvents(timetable: TimetableEntry[]): CalendarEvent[] {
    return timetable.map((entry, index) => {
      const color = this.courseColors[index % this.courseColors.length];
      const [startTime, endTime] = entry.time.split(' - ');
      
      return {
        id: `${entry.day}-${entry.time}`,
        title: entry.subject,
        start: this.createDateFromTime(startTime),
        end: this.createDateFromTime(endTime),
        location: entry.location,
        lecturer: entry.lecturer,
        course: entry.subject,
        color: color,
        day: entry.day,
        time: entry.time
      };
    });
  }

  private createDateFromTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  getEventsForDay(day: string): CalendarEvent[] {
    return this.calendarEvents.filter(event => 
      event.day.toLowerCase() === day.toLowerCase()
    ).sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  getEventsForDayAndTime(day: string, timeSlot: string): CalendarEvent[] {
    return this.calendarEvents.filter(event => {
      const eventStartHour = event.start.getHours();
      const slotHour = parseInt(timeSlot.split(':')[0]);
      
      // Match events that start within the time slot (within 2 hours)
      const timeMatch = Math.abs(eventStartHour - slotHour) <= 1;
      const dayMatch = event.day.toLowerCase() === day.toLowerCase();
      
      return dayMatch && timeMatch;
    });
  }

  getDayDate(day: string): string {
    const today = new Date();
    const dayIndex = this.days.indexOf(day);
    const currentDayIndex = today.getDay() - 1; // Monday = 0
    const daysUntilTarget = (dayIndex - currentDayIndex + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    
    return targetDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getNextTimeSlot(currentSlot: string): string {
    const [hours, minutes] = currentSlot.split(':').map(Number);
    const nextHour = hours + 2; // 2-hour slots
    return `${nextHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  selectEvent(event: CalendarEvent): void {
    this.selectedEvent = event;
  }

  closeEventDetails(): void {
    this.selectedEvent = null;
    this.showCalendarOptions = false;
  }

  toggleCalendarOptions(): void {
    this.showCalendarOptions = !this.showCalendarOptions;
  }

  addToGoogleCalendar(): void {
    if (this.selectedEvent) {
      const calendarEvent: CalendarEventType = {
        id: this.selectedEvent.id,
        title: this.selectedEvent.title,
        start: this.selectedEvent.start,
        end: this.selectedEvent.end,
        location: this.selectedEvent.location,
        lecturer: this.selectedEvent.lecturer,
        course: this.selectedEvent.course,
        description: `${this.selectedEvent.course} - ${this.selectedEvent.lecturer}`
      };
      window.open(this.calendarService.generateGoogleCalendarURL(calendarEvent), '_blank');
    }
    this.showCalendarOptions = false;
  }

  addToOutlook(): void {
    if (this.selectedEvent) {
      const calendarEvent: CalendarEventType = {
        id: this.selectedEvent.id,
        title: this.selectedEvent.title,
        start: this.selectedEvent.start,
        end: this.selectedEvent.end,
        location: this.selectedEvent.location,
        lecturer: this.selectedEvent.lecturer,
        course: this.selectedEvent.course,
        description: `${this.selectedEvent.course} - ${this.selectedEvent.lecturer}`
      };
      window.open(this.calendarService.generateOutlookCalendarURL(calendarEvent), '_blank');
    }
    this.showCalendarOptions = false;
  }

  downloadICS(): void {
    if (this.selectedEvent) {
      const calendarEvent: CalendarEventType = {
        id: this.selectedEvent.id,
        title: this.selectedEvent.title,
        start: this.selectedEvent.start,
        end: this.selectedEvent.end,
        location: this.selectedEvent.location,
        lecturer: this.selectedEvent.lecturer,
        course: this.selectedEvent.course,
        description: `${this.selectedEvent.course} - ${this.selectedEvent.lecturer}`
      };
      this.calendarService.downloadICS([calendarEvent], `${this.selectedEvent.course.replace(/\s+/g, '-').toLowerCase()}.ics`);
    }
    this.showCalendarOptions = false;
  }

  shareEvent(): void {
    if (this.selectedEvent) {
      const calendarEvent: CalendarEventType = {
        id: this.selectedEvent.id,
        title: this.selectedEvent.title,
        start: this.selectedEvent.start,
        end: this.selectedEvent.end,
        location: this.selectedEvent.location,
        lecturer: this.selectedEvent.lecturer,
        course: this.selectedEvent.course,
        description: `${this.selectedEvent.course} - ${this.selectedEvent.lecturer}`
      };
      this.calendarService.addToDeviceCalendar(calendarEvent);
    }
    this.showCalendarOptions = false;
  }

  downloadFullTimetable(): void {
    const calendarEvents: CalendarEventType[] = this.calendarEvents.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      location: event.location,
      lecturer: event.lecturer,
      course: event.course,
      description: `${event.course} - ${event.lecturer}`
    }));
    this.calendarService.downloadICS(calendarEvents, 'uon-law-timetable.ics');
  }
}