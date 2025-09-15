import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegistrationResponse } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-white flex flex-col justify-center py-12 px-6">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="text-center">
          <div class="flex justify-center mb-6">
            <img src="/courseorganizerlogo.png" 
                 alt="Course Organizer Logo" 
                 class="h-12 w-auto">
          </div>
          <h2 class="text-3xl font-semibold text-gray-900 mb-2">
            Join Course Organizer
          </h2>
          <p class="text-gray-600 mb-4">
            University of Nairobi - Class of 2029 Students
          </p>
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p class="text-sm text-gray-700">
              <span class="font-semibold">Eligible:</span> First-year law students with GPR3/XXXXXX/2025 registration number
            </p>
          </div>
        </div>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white border border-gray-200 rounded-2xl p-8">
          
          <!-- Already registered message -->
          <div *ngIf="!showRegistrationForm" class="text-center">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-green-50 border border-green-200 mb-6">
              <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Registration Complete</h3>
            <p class="text-gray-600 mb-8">
              You have already registered for the Course Organizer. Your account is pending administrative approval.
            </p>
            <div class="space-y-3">
              <a routerLink="/login" 
                 class="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-xl font-semibold transition-colors text-center block">
                Go to Login
              </a>
              <button type="button" 
                      (click)="showRegistrationForm = true"
                      class="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 py-3 px-4 rounded-xl font-medium transition-colors">
                Register Another Account
              </button>
            </div>
          </div>

          <!-- Registration form -->
          <form *ngIf="showRegistrationForm" class="space-y-6" (ngSubmit)="onSubmit()" #registerForm="ngForm">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input id="firstName" 
                     name="firstName" 
                     type="text" 
                     required 
                     [disabled]="isLoading"
                     [(ngModel)]="registrationData.first_name"
                     class="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
            </div>

            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input id="lastName" 
                     name="lastName" 
                     type="text" 
                     required 
                     [disabled]="isLoading"
                     [(ngModel)]="registrationData.last_name"
                     class="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input id="email" 
                     name="email" 
                     type="email" 
                     required 
                     [disabled]="isLoading"
                     [(ngModel)]="registrationData.email"
                     class="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
            </div>

            <div>
              <label for="registrationNumber" class="block text-sm font-medium text-gray-700 mb-2">
                Registration Number
              </label>
              <input id="registrationNumber" 
                     name="registrationNumber" 
                     type="text" 
                     required 
                     [disabled]="isLoading"
                     [(ngModel)]="registrationData.registration_number"
                     (blur)="validateRegistrationNumber()"
                     placeholder="GPR3/123456/2025"
                     class="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                     [class.border-red-300]="registrationError"
                     [class.focus:ring-red-500]="registrationError"
                     [class.focus:border-red-500]="registrationError">
              <div *ngIf="registrationError" class="mt-2 text-sm text-red-600">
                {{ registrationError }}
              </div>
              <div class="mt-2 text-xs text-gray-500">
                Format: GPR3/XXXXXX/2025 (where XXXXXX is your unique number)
              </div>
            </div>

            <div>
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input id="phoneNumber" 
                     name="phoneNumber" 
                     type="tel" 
                     required 
                     [disabled]="isLoading"
                     [(ngModel)]="registrationData.phone_number"
                     placeholder="+254 XXX XXX XXX"
                     class="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input id="password" 
                     name="password" 
                     type="password" 
                     required 
                     [disabled]="isLoading"
                     [(ngModel)]="registrationData.password"
                     class="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input id="confirmPassword" 
                     name="confirmPassword" 
                     type="password" 
                     required 
                     [disabled]="isLoading"
                     [(ngModel)]="registrationData.confirm_password"
                     class="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
              
              <!-- Subtle loading indicator under confirm password field -->
              <div *ngIf="isLoading" class="flex items-center justify-center mt-3">
                <div class="flex items-center space-x-2 text-gray-500">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div class="text-center">
                <h3 class="text-sm font-semibold text-blue-900 mb-2">
                  Verification Process
                </h3>
                <p class="text-sm text-blue-700">
                  Your registration will be verified by administrators. You'll receive a passcode via SMS once approved.
                </p>
              </div>
            </div>

            <!-- Privacy Policy Agreement -->
            <div class="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <input id="privacyPolicy" 
                         name="privacyPolicy" 
                         type="checkbox" 
                         required
                         [disabled]="isLoading"
                         [(ngModel)]="registrationData.agreeToPrivacyPolicy"
                         class="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                </div>
                <div class="flex-1">
                  <label for="privacyPolicy" class="text-sm text-gray-700">
                    I agree to the 
                    <a routerLink="/privacy-policy" 
                       target="_blank"
                       class="text-gray-900 hover:text-gray-700 underline font-medium">
                      Privacy Policy
                    </a>
                    and consent to the collection, processing, and use of my personal information as described therein.
                  </label>
                  <div *ngIf="!registrationData.agreeToPrivacyPolicy && registrationData.agreeToPrivacyPolicy !== undefined" 
                       class="mt-2 text-sm text-red-600">
                    You must agree to the Privacy Policy to continue.
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-xl p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <div class="text-sm text-red-700">
                    {{ errorMessage }}
                  </div>
                  <div *ngIf="isDuplicateRegistrationError()" class="mt-3">
                    <p class="text-sm text-red-600 mb-2">You might already be registered. Try logging in instead:</p>
                    <a routerLink="/login" 
                       class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-xl text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                      Go to Login
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button type="submit" 
                      [disabled]="isLoading || !isFormValid()"
                      class="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="!isLoading">Register</span>
                <span *ngIf="isLoading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              </button>
            </div>

            <div class="text-center">
              <p class="text-sm text-gray-600">
                Already have an account?
                <a routerLink="/login" class="font-medium text-gray-900 hover:text-gray-700">
                  Sign in here
                </a>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent implements OnInit {
  registrationData = {
    first_name: '',
    last_name: '',
    email: '',
    registration_number: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    agreeToPrivacyPolicy: false
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  registrationError = '';
  registrationDetails: RegistrationResponse | null = null;
  showRegistrationForm = true;

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Redirect authenticated users to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  validateRegistrationNumber(): void {
    const regNumber = this.registrationData.registration_number.trim();
    // Flexible pattern that accepts various formats but focuses on Class of 2029
    const flexiblePattern = /^[A-Z]{1,4}\d{0,2}\/\d{1,6}\/\d{4}$/;
    const classOf2029Pattern = /^GPR3\/\d{1,6}\/2025$/;
    
    if (!regNumber) {
      this.registrationError = '';
      return;
    }

    if (!flexiblePattern.test(regNumber)) {
      this.registrationError = 'Registration number must be in format: PREFIX/XXXXXX/YYYY';
      return;
    }

    // Check if it's Class of 2029 (GPR3/XXXXXX/2025)
    if (classOf2029Pattern.test(regNumber)) {
      this.registrationError = '';
      return;
    }

    // For other formats, show a warning but allow
    this.registrationError = 'Note: This appears to be for a different class. Class of 2029 uses format GPR3/XXXXXX/2025';
  }

  isFormValid(): boolean {
    const regNumber = this.registrationData.registration_number.trim();
    const flexiblePattern = /^[A-Z]{1,4}\d{0,2}\/\d{1,6}\/\d{4}$/;
    
    return this.registrationData.first_name.trim() !== '' &&
           this.registrationData.last_name.trim() !== '' &&
           this.registrationData.email.trim() !== '' &&
           this.registrationData.registration_number.trim() !== '' &&
           this.registrationData.phone_number.trim() !== '' &&
           this.registrationData.password.trim() !== '' &&
           this.registrationData.confirm_password.trim() !== '' &&
           this.registrationData.password === this.registrationData.confirm_password &&
           this.registrationData.agreeToPrivacyPolicy === true &&
           flexiblePattern.test(regNumber); // Allow any valid format
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    const registrationData = {
      first_name: this.registrationData.first_name,
      last_name: this.registrationData.last_name,
      email: this.registrationData.email,
      registration_number: this.registrationData.registration_number,
      phone_number: this.registrationData.phone_number,
      password: this.registrationData.password,
      confirm_password: this.registrationData.confirm_password
    };

    this.authService.register(registrationData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.registrationDetails = response;
        this.successMessage = response.message || 'Registration submitted successfully! You will receive an email notification once your account is approved by administrators.';
        
        // Reset form
        this.registrationData = {
          first_name: '',
          last_name: '',
          email: '',
          registration_number: '',
          phone_number: '',
          password: '',
          confirm_password: '',
          agreeToPrivacyPolicy: false
        };
        
        // Hide the form after successful registration
        this.showRegistrationForm = false;
        
        // Manually trigger change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        
        // Handle specific error messages
        if (error.error?.registration_number) {
          this.errorMessage = error.error.registration_number[0];
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.error?.non_field_errors) {
          this.errorMessage = error.error.non_field_errors[0];
        } else {
          this.errorMessage = 'An error occurred during registration. Please try again.';
        }
        
        // Manually trigger change detection
        this.cdr.detectChanges();
      }
    });
  }

  resetForm(): void {
    this.registrationData = {
      first_name: '',
      last_name: '',
      email: '',
      registration_number: '',
      phone_number: '',
      password: '',
      confirm_password: '',
      agreeToPrivacyPolicy: false
    };
    this.errorMessage = '';
    this.successMessage = '';
    this.registrationDetails = null;
    this.registrationError = '';
    this.showRegistrationForm = true;
    
    // Manually trigger change detection
    this.cdr.detectChanges();
  }

  isDuplicateRegistrationError(): boolean {
    return !!(this.errorMessage && (
      this.errorMessage.includes('already registered') ||
      this.errorMessage.includes('pending approval') ||
      this.errorMessage.includes('already registered and approved')
    ));
  }
}