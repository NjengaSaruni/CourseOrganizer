import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';
import { AuthService, User } from '../../core/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, PageLayoutComponent],
  template: `
    <app-page-layout 
      pageTitle="Admin Panel" 
      pageSubtitle="University of Nairobi - Manage pending registrations"
      [isSidebarOpen]="isSidebarOpen"
      (sidebarToggle)="onSidebarToggle($event)">
      
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Pending Registrations</h3>
          
          <div *ngIf="pendingRegistrations.length === 0" class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No pending registrations</h3>
            <p class="mt-1 text-sm text-gray-500">All registrations have been processed.</p>
          </div>

          <div *ngIf="pendingRegistrations.length > 0" class="space-y-4">
            <div *ngFor="let registration of pendingRegistrations" 
                 class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-gray-900">{{ registration.full_name }}</h4>
                  <p class="text-sm text-gray-500">{{ registration.email }}</p>
                  <p class="text-sm text-gray-500">{{ registration.registration_number }}</p>
                  <p class="text-sm text-gray-500">{{ registration.phone_number }}</p>
                  <p class="text-xs text-gray-400">Registered: {{ formatDate(registration.date_joined) }}</p>
                </div>
                <div class="flex space-x-2">
                  <button (click)="approveRegistration(registration.id)" 
                          class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
                    Approve
                  </button>
                  <button (click)="rejectRegistration(registration.id)" 
                          class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-page-layout>
  `,
  styles: []
})
export class AdminComponent implements OnInit {
  pendingRegistrations: User[] = [];
  isSidebarOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadPendingRegistrations();
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  private loadPendingRegistrations(): void {
    this.authService.getPendingRegistrations().subscribe({
      next: (users) => {
        this.pendingRegistrations = users;
      },
      error: (error) => {
        console.error('Error loading pending registrations:', error);
      }
    });
  }

  approveRegistration(id: number): void {
    this.authService.approveUser(id).subscribe({
      next: () => {
        this.loadPendingRegistrations();
      },
      error: (error) => {
        console.error('Error approving user:', error);
      }
    });
  }

  rejectRegistration(id: number): void {
    this.authService.rejectUser(id).subscribe({
      next: () => {
        this.loadPendingRegistrations();
      },
      error: (error) => {
        console.error('Error rejecting user:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}