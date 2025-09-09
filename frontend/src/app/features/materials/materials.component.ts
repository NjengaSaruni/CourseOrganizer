import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, CourseMaterial } from '../../core/course.service';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, PageLayoutComponent],
  template: `
    <app-page-layout 
      pageTitle="Course Materials" 
      pageSubtitle="University of Nairobi - Access your course documents and resources"
      [isSidebarOpen]="isSidebarOpen"
      (sidebarToggle)="onSidebarToggle($event)">
          
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
                      {{ material.type.toUpperCase() }}
                    </span>
                  </div>
                </div>
                
                <h3 class="text-lg font-medium text-gray-900 mb-2">{{ material.title }}</h3>
                <p class="text-sm text-gray-600 mb-3">{{ material.description }}</p>
                
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-500">
                    <span class="font-medium">{{ material.subject }}</span>
                    <span class="mx-2">•</span>
                    <span>{{ material.uploadDate | date:'MMM d, y' }}</span>
                  </div>
                  <a [href]="material.url" 
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
    </app-page-layout>
    
    <app-loader [isLoading]="isLoading" message="Loading materials..."></app-loader>
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

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadMaterials();
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
        this.subjects = [...new Set(materials.map(m => m.subject))];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterMaterials(): void {
    if (this.selectedSubject) {
      this.filteredMaterials = this.materials.filter(m => m.subject === this.selectedSubject);
    } else {
      this.filteredMaterials = this.materials;
    }
  }
}