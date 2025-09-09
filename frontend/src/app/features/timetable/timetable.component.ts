import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService, TimetableEntry } from '../../core/course.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, LoaderComponent, PageLayoutComponent],
  template: `
    <app-page-layout 
      pageTitle="Class Timetable" 
      pageSubtitle="University of Nairobi - View your class schedule"
      [isSidebarOpen]="isSidebarOpen"
      (sidebarToggle)="onSidebarToggle($event)">
          
      <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="px-4 py-5 sm:p-6">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Day
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instructor
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr *ngFor="let entry of timetable" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span class="text-sm font-medium text-primary-600">{{ entry.day.charAt(0) }}</span>
                          </div>
                          <span class="text-sm font-medium text-gray-900">{{ entry.day }}</span>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm text-gray-900">{{ entry.subject }}</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm text-gray-900">{{ entry.startTime }} - {{ entry.endTime }}</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm text-gray-900">{{ entry.location }}</span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm text-gray-900">{{ entry.instructor }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div *ngIf="timetable.length === 0 && !isLoading" class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No classes scheduled</h3>
                <p class="mt-1 text-sm text-gray-500">Your timetable will appear here once classes are scheduled.</p>
              </div>
            </div>
          </div>
    </app-page-layout>
    
    <app-loader [isLoading]="isLoading" message="Loading timetable..."></app-loader>
  `,
  styles: []
})
export class TimetableComponent implements OnInit {
  timetable: TimetableEntry[] = [];
  isLoading = true;
  isSidebarOpen = false;

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadTimetable();
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  private loadTimetable(): void {
    this.isLoading = true;
    this.courseService.getTimetable().subscribe({
      next: (timetable) => {
        this.timetable = timetable;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}