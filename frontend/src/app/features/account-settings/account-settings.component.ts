import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../core/auth.service';
import { SettingsService, PasswordChangeRequest, NotificationSettings } from '../../core/settings.service';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, PageLayoutComponent, ButtonComponent],
  template: `
    <app-page-layout 
      pageTitle="Account Settings" 
      pageSubtitle="Manage your account security, preferences, and notifications"
      [isSidebarOpen]="isSidebarOpen"
      (sidebarToggle)="onSidebarToggle($event)">
      
      <div class="max-w-4xl mx-auto space-y-8">
        <!-- Security Settings -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Security Settings</h3>
            <p class="text-gray-600">Manage your password and account security.</p>
            <div class="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-yellow-800">
                    <strong>Note:</strong> Password change functionality is currently under development. Please contact an administrator if you need to change your password.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form (ngSubmit)="changePassword()" class="space-y-6">
            <div class="space-y-4">
              <!-- Current Password -->
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div class="relative">
                  <input 
                    [type]="showCurrentPassword ? 'text' : 'password'"
                    id="currentPassword"
                    [(ngModel)]="passwordForm.currentPassword" 
                    name="currentPassword"
                    class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your current password">
                  <button 
                    type="button"
                    (click)="showCurrentPassword = !showCurrentPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg *ngIf="!showCurrentPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg *ngIf="showCurrentPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- New Password -->
              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div class="relative">
                  <input 
                    [type]="showNewPassword ? 'text' : 'password'"
                    id="newPassword"
                    [(ngModel)]="passwordForm.newPassword" 
                    name="newPassword"
                    class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your new password">
                  <button 
                    type="button"
                    (click)="showNewPassword = !showNewPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg *ngIf="!showNewPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg *ngIf="showNewPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Confirm Password -->
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div class="relative">
                  <input 
                    [type]="showConfirmPassword ? 'text' : 'password'"
                    id="confirmPassword"
                    [(ngModel)]="passwordForm.confirmPassword" 
                    name="confirmPassword"
                    class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Confirm your new password">
                  <button 
                    type="button"
                    (click)="showConfirmPassword = !showConfirmPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg *ngIf="!showConfirmPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg *ngIf="showConfirmPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Password Requirements -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Password Requirements</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  At least 8 characters long
                </li>
                <li class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  Contains uppercase and lowercase letters
                </li>
                <li class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  Contains at least one number
                </li>
                <li class="flex items-center">
                  <svg class="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  Contains at least one special character
                </li>
              </ul>
            </div>

            <!-- Change Password Button -->
            <div class="flex justify-end">
              <app-button 
                type="submit"
                size="lg"
                [disabled]="isChangingPassword"
                [loading]="isChangingPassword"
                loadingText="Changing...">
                Change Password
              </app-button>
            </div>
          </form>
        </div>

        <!-- Notification Preferences -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Notification Preferences</h3>
            <p class="text-gray-600">Choose how you want to be notified about important updates.</p>
            <div class="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-blue-800">
                    <strong>Note:</strong> Notification preferences are currently saved locally. Full notification system is under development.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Email Notifications -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900">Email Notifications</h4>
                <p class="text-sm text-gray-500">Receive notifications via email about course updates and announcements</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  [(ngModel)]="notificationSettings.emailNotifications"
                  name="emailNotifications"
                  class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- SMS Notifications -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900">SMS Notifications</h4>
                <p class="text-sm text-gray-500">Receive important updates via SMS on your registered phone number</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  [(ngModel)]="notificationSettings.smsNotifications"
                  name="smsNotifications"
                  class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Course Updates -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900">Course Updates</h4>
                <p class="text-sm text-gray-500">Get notified when new materials or recordings are added to your courses</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  [(ngModel)]="notificationSettings.courseUpdates"
                  name="courseUpdates"
                  class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Schedule Changes -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900">Schedule Changes</h4>
                <p class="text-sm text-gray-500">Be notified about timetable changes and class cancellations</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  [(ngModel)]="notificationSettings.scheduleChanges"
                  name="scheduleChanges"
                  class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <!-- Save Notification Settings -->
          <div class="flex justify-end pt-6 border-t border-gray-200 mt-6">
            <app-button 
              size="lg"
              (clicked)="saveNotificationSettings()"
              [disabled]="isSavingNotifications"
              [loading]="isSavingNotifications"
              loadingText="Saving...">
              Save Preferences
            </app-button>
          </div>
        </div>

        <!-- Account Actions -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Account Actions</h3>
            <p class="text-gray-600">Manage your account and data.</p>
          </div>

          <div class="space-y-4">
            <!-- Export Data -->
            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900">Export Account Data</h4>
                <p class="text-sm text-gray-500">Download a copy of your account data and course information</p>
              </div>
              <app-button 
                variant="secondary"
                (clicked)="exportData()">
                Export
              </app-button>
            </div>

            <!-- Delete Account -->
            <div class="flex items-center justify-between p-4 border border-red-200 rounded-xl bg-red-50">
              <div class="flex-1">
                <h4 class="text-sm font-medium text-red-900">Delete Account</h4>
                <p class="text-sm text-red-600">Permanently delete your account and all associated data</p>
              </div>
              <app-button 
                variant="danger"
                (clicked)="showDeleteConfirmation = true">
                Delete
              </app-button>
            </div>
          </div>
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

      <!-- Delete Account Confirmation Modal -->
      <div *ngIf="showDeleteConfirmation" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-2xl bg-white">
          <div class="mt-3 text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mt-4">Delete Account</h3>
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
              </p>
            </div>
            <div class="items-center px-4 py-3">
              <div class="flex space-x-3">
                <app-button 
                  variant="secondary"
                  size="lg"
                  (clicked)="showDeleteConfirmation = false">
                  Cancel
                </app-button>
                <app-button 
                  variant="danger"
                  size="lg"
                  (clicked)="deleteAccount()">
                  Delete Account
                </app-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-page-layout>
  `,
  styles: []
})
export class AccountSettingsComponent implements OnInit {
  currentUser: User | null = null;
  isSidebarOpen = false;
  isChangingPassword = false;
  isSavingNotifications = false;
  successMessage = '';
  errorMessage = '';
  showDeleteConfirmation = false;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  notificationSettings = {
    emailNotifications: true,
    smsNotifications: true,
    courseUpdates: true,
    scheduleChanges: true
  };

  constructor(
    private authService: AuthService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  changePassword(): void {
    this.isChangingPassword = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Validate passwords
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.errorMessage = 'New passwords do not match.';
      this.isChangingPassword = false;
      return;
    }

    // Validate password strength
    const passwordValidation = this.settingsService.validatePasswordStrength(this.passwordForm.newPassword);
    if (!passwordValidation.isValid) {
      this.errorMessage = passwordValidation.errors[0];
      this.isChangingPassword = false;
      return;
    }

    const passwordData: PasswordChangeRequest = {
      current_password: this.passwordForm.currentPassword,
      new_password: this.passwordForm.newPassword,
      confirm_password: this.passwordForm.confirmPassword
    };

    this.settingsService.changePassword(passwordData).subscribe({
      next: (response) => {
        this.isChangingPassword = false;
        this.successMessage = response.message || 'Password changed successfully!';
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.isChangingPassword = false;
        this.errorMessage = error.error?.message || 'Failed to change password. Please try again.';
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  saveNotificationSettings(): void {
    this.isSavingNotifications = true;
    this.successMessage = '';
    this.errorMessage = '';

    const settings: NotificationSettings = {
      email_notifications: this.notificationSettings.emailNotifications,
      sms_notifications: this.notificationSettings.smsNotifications,
      course_updates: this.notificationSettings.courseUpdates,
      schedule_changes: this.notificationSettings.scheduleChanges
    };

    this.settingsService.updateNotificationSettings(settings).subscribe({
      next: (response) => {
        this.isSavingNotifications = false;
        this.successMessage = 'Notification preferences saved successfully!';
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.isSavingNotifications = false;
        this.errorMessage = error.error?.message || 'Failed to save notification preferences. Please try again.';
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  exportData(): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.settingsService.exportUserData().subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Data export initiated. You will receive an email with your data shortly.';
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to initiate data export. Please try again.';
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  deleteAccount(): void {
    this.showDeleteConfirmation = false;
    this.successMessage = '';
    this.errorMessage = '';

    this.settingsService.requestAccountDeletion().subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Account deletion request submitted. You will receive a confirmation email.';
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to submit deletion request. Please try again.';
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }
}
