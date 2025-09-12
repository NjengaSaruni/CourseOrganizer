import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, PageLayoutComponent],
  templateUrl: './timetable.component.html',
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
  isAdmin = false;
  editingEvent: CalendarEvent | null = null;
  showEditModal = false;

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
      this.isAdmin = this.authService.isAdmin();
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

  // Admin methods for editing timetable
  editEvent(): void {
    if (this.selectedEvent) {
      this.editingEvent = { ...this.selectedEvent };
      this.showEditModal = true;
      this.closeEventDetails();
    }
  }

  deleteEvent(): void {
    if (this.selectedEvent && confirm('Are you sure you want to delete this lesson?')) {
      // Find the timetable entry ID from the selected event
      const timetableEntry = this.timetable.find(entry => 
        entry.day.toLowerCase() === this.selectedEvent!.day.toLowerCase() &&
        entry.time === this.selectedEvent!.time &&
        entry.subject === this.selectedEvent!.course
      );
      
      if (timetableEntry) {
        this.authService.deleteTimetableEntry(timetableEntry.id).subscribe({
          next: () => {
            this.loadTimetable(); // Reload timetable
            this.closeEventDetails();
          },
          error: (error) => {
            console.error('Error deleting timetable entry:', error);
            alert('Failed to delete lesson. Please try again.');
          }
        });
      }
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingEvent = null;
  }

  saveEventChanges(): void {
    if (this.editingEvent) {
      // Find the timetable entry ID from the editing event
      const timetableEntry = this.timetable.find(entry => 
        entry.day.toLowerCase() === this.editingEvent!.day.toLowerCase() &&
        entry.time === this.editingEvent!.time &&
        entry.subject === this.editingEvent!.course
      );
      
      if (timetableEntry) {
        const updatedEntry = {
          day: this.editingEvent.day.toLowerCase(),
          subject: this.editingEvent.course,
          time: this.editingEvent.time,
          location: this.editingEvent.location,
          lecturer: this.editingEvent.lecturer,
          course: timetableEntry.course // Keep the original course reference
        };
        
        this.authService.updateTimetableEntry(timetableEntry.id, updatedEntry).subscribe({
          next: () => {
            this.loadTimetable(); // Reload timetable
            this.closeEditModal();
          },
          error: (error) => {
            console.error('Error updating timetable entry:', error);
            alert('Failed to update lesson. Please try again.');
          }
        });
      }
    }
  }
}