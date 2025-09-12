import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
      
      <!-- Header Section -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p class="text-lg text-gray-600">Manage student registrations and approvals</p>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500 mb-1">Logged in as</div>
            <div class="text-base font-semibold text-gray-900">admin@uon.ac.ke</div>
          </div>
        </div>
      </div>

      <!-- Main Content Card -->
      <div class="bg-white border border-gray-200 rounded-3xl overflow-hidden">
        <!-- Card Header with Tabs -->
        <div class="px-8 py-6 border-b border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Student Registrations</h2>
              <p class="text-sm text-gray-600 mt-1">Manage student registration requests and view confirmed students</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span class="text-sm font-medium text-gray-700">{{ pendingRegistrations.length }} pending</span>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm font-medium text-gray-700">{{ confirmedRegistrations.length }} confirmed</span>
              </div>
            </div>
          </div>
          
          <!-- Tabs -->
          <div class="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            <button 
              (click)="activeTab = 'pending'"
              [class]="activeTab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              class="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors">
              Pending Registrations
            </button>
            <button 
              (click)="activeTab = 'confirmed'"
              [class]="activeTab === 'confirmed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              class="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors">
              Confirmed Students
            </button>
          </div>
        </div>
        
        <!-- Card Content -->
        <div class="p-8">
          <!-- Pending Registrations Tab -->
          <div *ngIf="activeTab === 'pending'">
            <!-- Empty State for Pending -->
            <div *ngIf="pendingRegistrations.length === 0" class="text-center py-16">
              <div class="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">No pending registrations</h3>
              <p class="text-gray-600 max-w-md mx-auto">All student registration requests have been processed. New requests will appear here when submitted.</p>
            </div>

          <!-- Registration Cards -->
          <div *ngIf="pendingRegistrations.length > 0" class="space-y-6">
            <div *ngFor="let registration of pendingRegistrations" 
                 class="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
              
              <!-- Registration Header -->
              <div class="flex items-start justify-between mb-6">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-3">
                    <div class="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center">
                      <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-lg font-semibold text-gray-900">{{ registration.full_name }}</h4>
                      <p class="text-sm text-gray-600">{{ registration.email }}</p>
                    </div>
                  </div>
                  
                  <!-- Student Details -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="space-y-2">
                      <div class="flex items-center space-x-2">
                        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span class="text-sm font-medium text-gray-700">Registration Number:</span>
                      </div>
                      <p class="text-sm text-gray-900 ml-6">{{ registration.registration_number }}</p>
                    </div>
                    
                    <div class="space-y-2">
                      <div class="flex items-center space-x-2">
                        <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span class="text-sm font-medium text-gray-700">Phone:</span>
                      </div>
                      <p class="text-sm text-gray-900 ml-6">{{ registration.phone_number }}</p>
                    </div>
                  </div>
                  
                  <!-- Class Information -->
                  <div *ngIf="registration.class_display_name" class="mb-4">
                    <div class="flex items-center space-x-2 mb-2">
                      <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span class="text-sm font-medium text-gray-700">Class:</span>
                    </div>
                    <span class="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-gray-200 text-gray-800 ml-6">
                      {{ registration.class_display_name }}
                    </span>
                  </div>
                  
                  <!-- Registration Date -->
                  <div class="flex items-center space-x-2 text-xs text-gray-500">
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Registered: {{ registration.date_joined_formatted || formatDate(registration.date_joined) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Manual Verification Notice -->
              <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                <div class="flex items-center space-x-2 mb-3">
                  <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm font-semibold text-blue-800">Manual Verification</span>
                </div>
                <p class="text-sm text-blue-700">
                  This student will be manually verified during in-person meetings. 
                  SMS verification is temporarily disabled until Twilio account is configured.
                </p>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-3">
                <button (click)="approveRegistration(registration.id)" 
                        class="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Approve Registration</span>
                </button>
                
                <button (click)="rejectRegistration(registration.id)" 
                        class="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Reject Registration</span>
                </button>
              </div>
            </div>
          </div>
          </div>

          <!-- Confirmed Students Tab -->
          <div *ngIf="activeTab === 'confirmed'">
            <!-- Empty State for Confirmed -->
            <div *ngIf="confirmedRegistrations.length === 0" class="text-center py-16">
              <div class="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">No confirmed students</h3>
              <p class="text-gray-600 max-w-md mx-auto">Approved students will appear here once they have been confirmed.</p>
            </div>

            <!-- Confirmed Students List -->
            <div *ngIf="confirmedRegistrations.length > 0" class="space-y-4">
              <div *ngFor="let student of confirmedRegistrations" 
                   class="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                
                <!-- Student Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                      <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-lg font-semibold text-gray-900">{{ student.full_name }}</h4>
                      <p class="text-sm text-gray-600">{{ student.email }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-green-100 text-green-800">
                      <svg class="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      Confirmed
                    </span>
                  </div>
                </div>
                
                <!-- Student Details -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span class="text-sm font-medium text-gray-700">Registration Number:</span>
                    </div>
                    <p class="text-sm text-gray-900 ml-6">{{ student.registration_number }}</p>
                  </div>
                  
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span class="text-sm font-medium text-gray-700">Phone:</span>
                    </div>
                    <p class="text-sm text-gray-900 ml-6">{{ student.phone_number }}</p>
                  </div>
                </div>
                
                <!-- Class Information -->
                <div *ngIf="student.class_display_name" class="mb-4">
                  <div class="flex items-center space-x-2 mb-2">
                    <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span class="text-sm font-medium text-gray-700">Class:</span>
                  </div>
                  <span class="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-gray-200 text-gray-800 ml-6">
                    {{ student.class_display_name }}
                  </span>
                </div>
                
                <!-- Registration and Login Info -->
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <div class="flex items-center space-x-2">
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Registered: {{ student.date_joined_formatted || formatDate(student.date_joined) }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Last Login: {{ student.last_login_formatted }}</span>
                  </div>
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
  confirmedRegistrations: User[] = [];
  isSidebarOpen = false;
  activeTab: 'pending' | 'confirmed' = 'pending';

  constructor(private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPendingRegistrations();
    this.loadConfirmedRegistrations();
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  private loadPendingRegistrations(): void {
    console.log('Loading pending registrations...');
    this.authService.getPendingRegistrations().subscribe({
      next: (users) => {
        console.log('Pending registrations loaded:', users);
        this.pendingRegistrations = users;
        // Ensure UI updates under zoneless change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading pending registrations:', error);
        console.error('Error details:', error);
      }
    });
  }

  private loadConfirmedRegistrations(): void {
    console.log('Loading confirmed registrations...');
    this.authService.getConfirmedRegistrations().subscribe({
      next: (users) => {
        console.log('Confirmed registrations loaded:', users);
        this.confirmedRegistrations = users;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading confirmed registrations:', error);
        console.error('Error details:', error);
      }
    });
  }

  approveRegistration(id: number): void {
    this.authService.approveUser(id).subscribe({
      next: () => {
        this.loadPendingRegistrations();
        this.loadConfirmedRegistrations();
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
        this.loadConfirmedRegistrations();
      },
      error: (error) => {
        console.error('Error rejecting user:', error);
      }
    });
  }

  // TODO: Passcode methods disabled until SMS service is properly configured
  // generatePasscode(userId: number): void {
  //   this.authService.generatePasscode(userId).subscribe({
  //     next: (response) => {
  //       // Update the local registration object with the passcode
  //       const registration = this.pendingRegistrations.find(r => r.id === userId);
  //       if (registration) {
  //         registration.passcode = response.passcode;
  //       }
  //       console.log('Passcode generated:', response.passcode);
  //     },
  //     error: (error) => {
  //       console.error('Error generating passcode:', error);
  //     }
  //   });
  // }

  // sendPasscodeSMS(userId: number, passcode: string): void {
  //   this.authService.sendPasscodeSMS(userId, passcode).subscribe({
  //     next: (response) => {
  //       // Update the local registration object to show SMS was sent
  //       const registration = this.pendingRegistrations.find(r => r.id === userId);
  //       if (registration) {
  //         registration.smsSent = true;
  //       }
  //       console.log('SMS sent:', response.message);
  //     },
  //     error: (error) => {
  //       console.error('Error sending SMS:', error);
  //     }
  //   });
  // }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}