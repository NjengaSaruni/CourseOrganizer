import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../core/auth.service';
import { SettingsService, UserProfile, ProfileUpdateRequest } from '../../core/settings.service';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, PageLayoutComponent],
  template: `
    <app-page-layout 
      pageTitle="Profile Settings" 
      pageSubtitle="Manage your personal information and profile details"
      [isSidebarOpen]="isSidebarOpen"
      (sidebarToggle)="onSidebarToggle($event)">
      
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Profile Header -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div class="flex items-center space-x-6">
            <!-- Profile Avatar -->
            <div class="relative">
              <div class="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span class="text-white font-bold text-2xl">{{ getInitials() }}</span>
              </div>
              <button class="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <svg class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            
            <!-- Profile Info -->
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ currentUser?.full_name }}</h2>
              <p class="text-gray-600 mb-1">{{ currentUser?.email }}</p>
              <p class="text-sm text-gray-500">{{ currentUser?.registration_number }}</p>
              <div class="mt-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Active Student
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Personal Information Form -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Personal Information</h3>
            <p class="text-gray-600">Update your personal details and contact information.</p>
          </div>

          <form (ngSubmit)="updateProfile()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- First Name -->
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input 
                  type="text" 
                  id="firstName"
                  [(ngModel)]="profileForm.first_name" 
                  name="firstName"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your first name">
              </div>

              <!-- Last Name -->
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input 
                  type="text" 
                  id="lastName"
                  [(ngModel)]="profileForm.last_name" 
                  name="lastName"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your last name">
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input 
                  type="email" 
                  id="email"
                  [(ngModel)]="profileForm.email" 
                  name="email"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your email">
              </div>

              <!-- Registration Number -->
              <div>
                <label for="registrationNumber" class="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number
                </label>
                <input 
                  type="text" 
                  id="registrationNumber"
                  [(ngModel)]="profileForm.registration_number" 
                  name="registrationNumber"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your registration number"
                  readonly>
                <p class="mt-1 text-sm text-gray-500">Registration number cannot be changed</p>
              </div>

              <!-- Phone Number -->
              <div>
                <label for="phoneNumber" class="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  id="phoneNumber"
                  [(ngModel)]="profileForm.phone_number" 
                  name="phoneNumber"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your phone number">
              </div>
            </div>

            <!-- Academic Information -->
            <div class="border-t border-gray-200 pt-6">
              <h4 class="text-lg font-medium text-gray-900 mb-4">Academic Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Class -->
                <div>
                  <label for="class" class="block text-sm font-medium text-gray-700 mb-2">
                    Class
                  </label>
                  <input 
                    type="text" 
                    id="class"
                    [(ngModel)]="profileForm.class_name" 
                    name="class"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Class of 2029"
                    readonly>
                  <p class="mt-1 text-sm text-gray-500">Class assignment is managed by administrators</p>
                </div>

                <!-- Program -->
                <div>
                  <label for="program" class="block text-sm font-medium text-gray-700 mb-2">
                    Program
                  </label>
                  <input 
                    type="text" 
                    id="program"
                    [(ngModel)]="profileForm.program" 
                    name="program"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Bachelor of Laws"
                    readonly>
                  <p class="mt-1 text-sm text-gray-500">Program assignment is managed by administrators</p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button 
                type="button"
                (click)="resetForm()"
                class="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </button>
              <button 
                type="submit"
                [disabled]="isUpdating"
                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors font-medium flex items-center">
                <svg *ngIf="isUpdating" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isUpdating ? 'Updating...' : 'Update Profile' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Success/Error Messages -->
        <div *ngIf="successMessage" class="bg-green-50 border border-green-200 rounded-xl p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
            </div>
          </div>
        </div>

        <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
      </div>
    </app-page-layout>
  `,
  styles: []
})
export class ProfileSettingsComponent implements OnInit {
  currentUser: User | null = null;
  isSidebarOpen = false;
  isUpdating = false;
  successMessage = '';
  errorMessage = '';

  profileForm = {
    first_name: '',
    last_name: '',
    email: '',
    registration_number: '',
    phone_number: '',
    class_name: '',
    program: ''
  };

  constructor(
    private authService: AuthService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm = {
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          registration_number: user.registration_number || '',
          phone_number: user.phone_number || '',
          class_name: user.class_display_name || '',
          program: ''
        };
      }
    });
  }

  getInitials(): string {
    if (!this.currentUser?.full_name) return 'U';
    return this.currentUser.full_name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  updateProfile(): void {
    this.isUpdating = true;
    this.successMessage = '';
    this.errorMessage = '';

    const updateData: ProfileUpdateRequest = {
      first_name: this.profileForm.first_name,
      last_name: this.profileForm.last_name,
      phone_number: this.profileForm.phone_number
    };

    this.settingsService.updateProfile(updateData).subscribe({
      next: (updatedUser) => {
        this.isUpdating = false;
        this.successMessage = 'Profile updated successfully!';
        // Update current user with the updated profile data
        if (this.currentUser) {
          this.currentUser.first_name = updatedUser.first_name;
          this.currentUser.last_name = updatedUser.last_name;
          this.currentUser.full_name = updatedUser.full_name;
          this.currentUser.phone_number = updatedUser.phone_number || '';
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.isUpdating = false;
        this.errorMessage = error.error?.message || 'Failed to update profile. Please try again.';
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  resetForm(): void {
    if (this.currentUser) {
      this.profileForm = {
        first_name: this.currentUser.first_name || '',
        last_name: this.currentUser.last_name || '',
        email: this.currentUser.email || '',
        registration_number: this.currentUser.registration_number || '',
        phone_number: this.currentUser.phone_number || '',
        class_name: this.currentUser.class_display_name || '',
        program: ''
      };
    }
    this.successMessage = '';
    this.errorMessage = '';
  }
}
