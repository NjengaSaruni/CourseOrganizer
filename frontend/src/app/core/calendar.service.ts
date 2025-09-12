import { Injectable } from '@angular/core';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
  lecturer: string;
  course: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor() { }

  /**
   * Generate ICS (iCalendar) format for Google Calendar, Outlook, etc.
   */
  generateICS(events: CalendarEvent[]): string {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Course Organizer//UoN Law//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    events.forEach(event => {
      const startDate = this.formatDateForICS(event.start);
      const endDate = this.formatDateForICS(event.end);
      
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@courseorganizer.uon.ac.ke`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${event.course}`,
        `DESCRIPTION:${event.description || `${event.course} - ${event.lecturer}`}`,
        `LOCATION:${event.location}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
  }

  /**
   * Download ICS file for calendar import
   */
  downloadICS(events: CalendarEvent[], filename: string = 'uon-law-timetable.ics'): void {
    const icsContent = this.generateICS(events);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  }

  /**
   * Generate Google Calendar URL
   */
  generateGoogleCalendarURL(event: CalendarEvent): string {
    const startDate = this.formatDateForGoogle(event.start);
    const endDate = this.formatDateForGoogle(event.end);
    const title = encodeURIComponent(event.course);
    const details = encodeURIComponent(`${event.course} - ${event.lecturer}`);
    const location = encodeURIComponent(event.location);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
  }

  /**
   * Generate Outlook Calendar URL
   */
  generateOutlookCalendarURL(event: CalendarEvent): string {
    const startDate = this.formatDateForOutlook(event.start);
    const endDate = this.formatDateForOutlook(event.end);
    const title = encodeURIComponent(event.course);
    const details = encodeURIComponent(`${event.course} - ${event.lecturer}`);
    const location = encodeURIComponent(event.location);

    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startDate}&enddt=${endDate}&body=${details}&location=${location}`;
  }

  /**
   * Add event to device calendar (mobile)
   */
  addToDeviceCalendar(event: CalendarEvent): void {
    if (navigator.share) {
      // Use Web Share API if available
      navigator.share({
        title: event.course,
        text: `${event.course} - ${event.lecturer}`,
        url: this.generateGoogleCalendarURL(event)
      }).catch(console.error);
    } else {
      // Fallback to opening Google Calendar
      window.open(this.generateGoogleCalendarURL(event), '_blank');
    }
  }

  /**
   * Get calendar integration options
   */
  getCalendarOptions(event: CalendarEvent) {
    return [
      {
        name: 'Google Calendar',
        icon: '📅',
        action: () => window.open(this.generateGoogleCalendarURL(event), '_blank')
      },
      {
        name: 'Outlook',
        icon: '📧',
        action: () => window.open(this.generateOutlookCalendarURL(event), '_blank')
      },
      {
        name: 'Download ICS',
        icon: '⬇️',
        action: () => this.downloadICS([event], `${event.course.replace(/\s+/g, '-').toLowerCase()}.ics`)
      },
      {
        name: 'Share',
        icon: '📤',
        action: () => this.addToDeviceCalendar(event)
      }
    ];
  }

  private formatDateForICS(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private formatDateForGoogle(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private formatDateForOutlook(date: Date): string {
    return date.toISOString();
  }

  /**
   * Get current week dates for display
   */
  getCurrentWeekDates(): { day: string; date: Date }[] {
    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + daysToMonday);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return { day, date };
    });
  }

  /**
   * Check if an event is happening today
   */
  isEventToday(event: CalendarEvent): boolean {
    const today = new Date();
    const eventDate = event.start;
    return eventDate.toDateString() === today.toDateString();
  }

  /**
   * Check if an event is happening this week
   */
  isEventThisWeek(event: CalendarEvent): boolean {
    const today = new Date();
    const eventDate = event.start;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Sunday

    return eventDate >= weekStart && eventDate <= weekEnd;
  }

  /**
   * Get upcoming events (next 7 days)
   */
  getUpcomingEvents(events: CalendarEvent[]): CalendarEvent[] {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return events
      .filter(event => event.start >= today && event.start <= nextWeek)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }
}
