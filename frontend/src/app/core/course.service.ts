import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface CourseMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'ppt' | 'video' | 'link';
  url: string;
  description: string;
  uploadDate: Date;
  subject: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  link: string;
  subject: string;
  description: string;
}

export interface Recording {
  id: string;
  title: string;
  url: string;
  duration: number; // in minutes
  subject: string;
  date: Date;
  description: string;
}

export interface TimetableEntry {
  id: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  instructor: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private materials: CourseMaterial[] = [
    {
      id: '1',
      title: 'Introduction to Programming',
      type: 'pdf',
      url: '#',
      description: 'Basic concepts of programming',
      uploadDate: new Date('2024-01-15'),
      subject: 'Computer Science'
    },
    {
      id: '2',
      title: 'Data Structures Lecture Notes',
      type: 'ppt',
      url: '#',
      description: 'Comprehensive notes on data structures',
      uploadDate: new Date('2024-01-20'),
      subject: 'Computer Science'
    }
  ];

  private meetings: Meeting[] = [
    {
      id: '1',
      title: 'Weekly CS Discussion',
      date: new Date('2024-01-25'),
      time: '10:00',
      duration: 60,
      link: '#',
      subject: 'Computer Science',
      description: 'Weekly discussion session'
    }
  ];

  private recordings: Recording[] = [
    {
      id: '1',
      title: 'Introduction to Algorithms',
      url: '#',
      duration: 45,
      subject: 'Computer Science',
      date: new Date('2024-01-22'),
      description: 'Recorded lecture on algorithm basics'
    }
  ];

  private timetable: TimetableEntry[] = [
    {
      id: '1',
      subject: 'Computer Science',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      location: 'Room 101',
      instructor: 'Dr. Smith'
    },
    {
      id: '2',
      subject: 'Mathematics',
      day: 'Tuesday',
      startTime: '11:00',
      endTime: '12:30',
      location: 'Room 102',
      instructor: 'Prof. Johnson'
    }
  ];

  getMaterials(): Observable<CourseMaterial[]> {
    return of(this.materials);
  }

  getMeetings(): Observable<Meeting[]> {
    return of(this.meetings);
  }

  getRecordings(): Observable<Recording[]> {
    return of(this.recordings);
  }

  getTimetable(): Observable<TimetableEntry[]> {
    return of(this.timetable);
  }

  getMaterialsBySubject(subject: string): Observable<CourseMaterial[]> {
    const filtered = this.materials.filter(m => m.subject === subject);
    return of(filtered);
  }
}