import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, CourseMaterial } from '../../core/course.service';
import { AuthService } from '../../core/auth.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [CommonModule, FormsModule, PageLayoutComponent],
  template: `
    <app-page-layout 
      pageTitle="Course Materials" 
      pageSubtitle="University of Nairobi - Access your course documents and resources"
      [isSidebarOpen]="isSidebarOpen"
      (sidebarToggle)="onSidebarToggle($event)">
          
          <!-- Loading State -->
          <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-20">
            <div class="relative">
              <!-- Document icon with spinning effect -->
              <div class="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg class="w-8 h-8 text-primary-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <!-- Spinning ring around icon -->
              <div class="absolute -inset-2 w-20 h-20 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
            <div class="mt-6 text-center">
              <h3 class="text-lg font-medium text-gray-900 mb-2">Loading Materials</h3>
              <p class="text-sm text-gray-500">Fetching your course documents...</p>
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
                    <div class="flex items-center justify-between">
                      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div class="h-8 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Materials Content -->
          <div *ngIf="!isLoading">
          <!-- Filter by Subject -->
          <div class="mb-6">
            <label for="subject-filter" class="block text-sm font-medium text-gray-700 mb-2">
              Filter by Subject
            </label>
            <select id="subject-filter" 
                    [(ngModel)]="selectedSubject" 
                    (change)="filterMaterials()"
                    class="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
              <option value="">All Subjects</option>
              <option *ngFor="let subject of subjects" [value]="subject">{{ subject }}</option>
            </select>
          </div>
          
          <!-- Materials Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let material of filteredMaterials" 
                 class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              <div class="p-6">
                <div class="flex items-center mb-4">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg class="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-3">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {{ material.file_type.toUpperCase() }}
                    </span>
                  </div>
                </div>
                
                <h3 class="text-lg font-medium text-gray-900 mb-2">{{ material.title }}</h3>
                <p class="text-sm text-gray-600 mb-3">{{ material.description }}</p>
                
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-500">
                    <span class="font-medium">{{ material.uploaded_by_name }}</span>
                    <span class="mx-2">•</span>
                    <span>{{ material.created_at | date:'MMM d, y' }}</span>
                  </div>
                  <a [href]="material.file_url" 
                     class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    View
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div *ngIf="filteredMaterials.length === 0 && !isLoading" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No materials found</h3>
            <p class="mt-1 text-sm text-gray-500">Course materials will appear here once they are uploaded.</p>
          </div>
          </div> <!-- End Materials Content -->
    </app-page-layout>
  `,
  styles: []
})
export class MaterialsComponent implements OnInit {
  materials: CourseMaterial[] = [];
  filteredMaterials: CourseMaterial[] = [];
  subjects: string[] = [];
  selectedSubject = '';
  isLoading = true;
  isSidebarOpen = false;

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Only load data if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.loadMaterials();
    } else {
      this.isLoading = false;
    }
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  private loadMaterials(): void {
    this.isLoading = true;
    this.courseService.getMaterials().subscribe({
      next: (materials) => {
        this.materials = materials;
        this.filteredMaterials = materials;
        // For now, we'll get subjects from the course service or use a default list
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

  filterMaterials(): void {
    if (this.selectedSubject && this.selectedSubject !== 'All Courses') {
      this.filteredMaterials = this.materials.filter(m => m.title.toLowerCase().includes(this.selectedSubject.toLowerCase()));
    } else {
      this.filteredMaterials = this.materials;
    }
  }
}