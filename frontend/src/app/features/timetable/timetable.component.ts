import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CourseService, TimetableEntry } from '../../core/course.service';
import { AuthService } from '../../core/auth.service';
import { CalendarService, CalendarEvent as CalendarEventType } from '../../core/calendar.service';
import { VideoCallService, VideoCallResponse } from '../../core/video-call.service';
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
  has_meeting?: boolean;
  can_join_meeting?: boolean;
  meeting_id?: number;
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
  private userChangedView = false; // Track if user manually changed the view

  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  
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
    private videoCallService: VideoCallService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Set default view mode based on screen width
    this.setDefaultViewMode();
    
    if (this.authService.isAuthenticated()) {
      this.isAdmin = this.authService.isAdmin();
      this.loadTimetable();
    } else {
      this.isLoading = false;
    }
  }

  private setDefaultViewMode(): void {
    // Use calendar view as default for smaller screens (< 768px) to avoid horizontal scrolling
    // Only set default if user hasn't manually changed the view
    if (!this.userChangedView) {
      const screenWidth = window.innerWidth;
      this.viewMode = screenWidth < 768 ? 'calendar' : 'grid';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Update view mode on resize (e.g., device rotation) if user hasn't manually changed it
    this.setDefaultViewMode();
  }

  changeViewMode(mode: 'grid' | 'calendar'): void {
    this.viewMode = mode;
    this.userChangedView = true; // Mark that user manually changed the view
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  private loadTimetable(): void {
    this.isLoading = true;
    this.courseService.getTimetableWithMeetings().subscribe({
      next: (timetable) => {
        this.timetable = timetable;
        this.calendarEvents = this.convertToCalendarEvents(timetable);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading timetable:', error);
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
        time: entry.time,
        has_meeting: entry.has_meeting,
        can_join_meeting: entry.can_join_meeting,
        meeting_id: entry.meeting_id
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
      const dayMatch = event.day.toLowerCase() === day.toLowerCase();
      if (!dayMatch) return false;
      
      const slotHour = parseInt(timeSlot.split(':')[0]);
      const slotStart = slotHour;
      const slotEnd = slotHour + 2; // 2-hour slots
      
      const eventStartHour = event.start.getHours();
      const eventStartMinute = event.start.getMinutes();
      const eventEndHour = event.end.getHours();
      const eventEndMinute = event.end.getMinutes();
      
      const eventStart = eventStartHour + (eventStartMinute / 60);
      const eventEnd = eventEndHour + (eventEndMinute / 60);
      
      // Check if event overlaps with this time slot
      return (eventStart < slotEnd && eventEnd > slotStart);
    });
  }

  // Get the display information for an event in a specific time slot
  getEventDisplayInfo(event: CalendarEvent, timeSlot: string): { 
    showInfo: boolean, 
    height: string,
    position: string,
    alignment: string
  } {
    const slotHour = parseInt(timeSlot.split(':')[0]);
    const slotStart = slotHour;
    const slotEnd = slotHour + 2;
    
    const eventStartHour = event.start.getHours();
    const eventStartMinute = event.start.getMinutes();
    const eventEndHour = event.end.getHours();
    const eventEndMinute = event.end.getMinutes();
    
    const eventStart = eventStartHour + (eventStartMinute / 60);
    const eventEnd = eventEndHour + (eventEndMinute / 60);
    
    // Calculate how much of this slot the event occupies
    const slotEventStart = Math.max(eventStart, slotStart);
    const slotEventEnd = Math.min(eventEnd, slotEnd);
    const slotEventDuration = slotEventEnd - slotEventStart;
    const slotDuration = slotEnd - slotStart; // 2 hours
    const percentage = (slotEventDuration / slotDuration) * 100;
    
    // Determine height, position, alignment, and whether to show info
    let height = '100%';
    let position = 'relative';
    let alignment = '';
    let showInfo = true;
    
    if (percentage < 100) {
      // Partial block
      height = `${Math.max(percentage, 25)}%`; // Minimum 25% height for visibility
      
      if (eventStart >= slotStart) {
        // Event starts in this slot (e.g., 17:30 in 16:00-18:00 slot)
        position = 'absolute';
        alignment = 'bottom-0'; // Position at bottom of slot
        showInfo = percentage > 50; // Show info if more than half the slot
      } else {
        // Event started in previous slot (e.g., 17:30 event in 18:00-20:00 slot)
        position = 'relative';
        alignment = 'top-0'; // Position at top of slot
        showInfo = false; // Don't show info in continuation blocks
      }
    }
    
    return { showInfo, height, position, alignment };
  }

  getDayDate(day: string): string {
    const today = new Date();
    const dayIndex = this.days.indexOf(day);
    const currentDayIndex = today.getDay() - 1; // Monday = 0
    
    // Calculate the start of the current week (Monday)
    const startOfWeek = new Date(today);
    const daysFromMonday = (currentDayIndex + 7) % 7;
    startOfWeek.setDate(today.getDate() - daysFromMonday);
    
    // Calculate the target date for this day
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(startOfWeek.getDate() + dayIndex);
    
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

  // Check if a day is today
  isToday(day: string): boolean {
    const today = new Date();
    const dayIndex = this.days.indexOf(day);
    const currentDayIndex = today.getDay() - 1; // Monday = 0
    return dayIndex === currentDayIndex;
  }

  // Get current time position for the time indicator line
  getCurrentTimePosition(): { top: string, visible: boolean } {
    // Deprecated for per-slot indicator; retained for compatibility if needed
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + (currentMinute / 60);
    if (currentTime < 8 || currentTime > 22) {
      return { top: '0%', visible: false };
    }
    const startHour = 8;
    const endHour = 22;
    const totalHours = endHour - startHour;
    const timeFromStart = currentTime - startHour;
    const percentage = (timeFromStart / totalHours) * 100;
    return { top: `${percentage}%`, visible: true };
  }

  // New: whether now falls within a given time slot (2-hour slot)
  isCurrentTimeInSlot(timeSlot: string): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + (currentMinute / 60);

    const slotHour = parseInt(timeSlot.split(':')[0]);
    const slotStart = slotHour;
    const slotEnd = slotHour + 2; // 2-hour slots

    return currentTime >= slotStart && currentTime < slotEnd;
  }

  // New: position of the indicator within a specific time slot
  getCurrentTimePositionInSlot(timeSlot: string): { top: string, visible: boolean } {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + (currentMinute / 60);

    const slotHour = parseInt(timeSlot.split(':')[0]);
    const slotStart = slotHour;
    const slotEnd = slotHour + 2; // 2-hour slots

    // Only visible within timetable hours and the active slot
    if (currentTime < 8 || currentTime > 22 || !(currentTime >= slotStart && currentTime < slotEnd)) {
      return { top: '0%', visible: false };
    }

    const percentage = ((currentTime - slotStart) / (slotEnd - slotStart)) * 100;
    return { top: `${percentage}%`, visible: true };
  }


  selectEvent(event: CalendarEvent): void {
    if (this.isAdmin) {
      // Admin users see the event details modal
    this.selectedEvent = event;
    } else {
      // Non-admin users navigate to course detail page
      // Use the subject/course name as identifier (URL-encoded) so details page can load dynamically
      const courseId = encodeURIComponent(event.course);
      this.router.navigate(['/course', courseId]);
    }
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

  // Video Call Methods
  createVideoCall(timetableEntry: any): void {
    if (!this.isAdmin) {
      alert('Only administrators can create video calls for classes.');
      return;
    }

    this.videoCallService.createVideoCallForTimetable(timetableEntry.id).subscribe({
      next: (response) => {
        console.log('Video call created successfully:', response);
        alert('Video call created successfully! Students can now join the class.');
        this.loadTimetable(); // Reload timetable to show the new meeting
      },
      error: (error) => {
        console.error('Error creating video call:', error);
        if (error.error?.message) {
          alert(error.error.message);
        } else {
          alert('Error creating video call. Please try again.');
        }
      }
    });
  }

  joinVideoCall(timetableEntry: any): void {
    this.videoCallService.joinTimetableMeeting(timetableEntry.id).subscribe({
      next: (response: VideoCallResponse) => {
        console.log('Joining video call:', response);
        // Use the embedded video call service to open the video call in the header
        this.videoCallService.openEmbeddedVideoCall(response);
      },
      error: (error) => {
        console.error('Error joining video call:', error);
        if (error.error?.message) {
          alert(error.error.message);
        } else {
          alert('Error joining video call. Please try again.');
        }
      }
    });
  }

  deleteVideoCall(timetableEntry: any): void {
    if (!this.isAdmin) {
      alert('Only administrators can delete video calls.');
      return;
    }

    if (confirm('Are you sure you want to delete the video call for this class?')) {
      this.videoCallService.deleteVideoCallForTimetable(timetableEntry.id).subscribe({
        next: (response) => {
          console.log('Video call deleted successfully:', response);
          alert('Video call deleted successfully.');
          this.loadTimetable(); // Reload timetable
        },
        error: (error) => {
          console.error('Error deleting video call:', error);
          if (error.error?.message) {
            alert(error.error.message);
          } else {
            alert('Error deleting video call. Please try again.');
          }
        }
      });
    }
  }

  getVideoCallButtonText(timetableEntry: any): string {
    if (timetableEntry.has_meeting) {
      if (timetableEntry.can_join_meeting) {
        return 'Join Video Call';
      } else {
        return 'Video Call Scheduled';
      }
    } else {
      return 'Create Video Call';
    }
  }

  getVideoCallButtonTooltip(timetableEntry: any): string {
    if (timetableEntry.has_meeting) {
      if (timetableEntry.can_join_meeting) {
        return 'Click to join the video call';
      } else {
        return 'Video call is scheduled for this class';
      }
    } else {
      return 'Create a video call for this class (Admin only)';
    }
  }

  getVideoCallButtonClass(timetableEntry: any): string {
    if (timetableEntry.has_meeting) {
      if (timetableEntry.can_join_meeting) {
        return 'bg-green-600 hover:bg-green-700 text-white';
      } else {
        return 'bg-blue-600 text-white cursor-not-allowed';
      }
    } else {
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  }

  getTimetableEntryFromEvent(event: CalendarEvent): any {
    // Find the corresponding timetable entry from the calendar event
    return this.timetable.find(entry => 
      entry.day.toLowerCase() === event.day.toLowerCase() &&
      entry.time === event.time &&
      entry.subject === event.course
    );
  }
}