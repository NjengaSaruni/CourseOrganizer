import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-navy-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-navy-500">
            Create your account
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            University of Nairobi - School of Law Module II Evening Students
          </p>
        </div>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form class="space-y-6" (ngSubmit)="onSubmit()" #registerForm="ngForm">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <div class="mt-1">
                <input id="firstName" 
                       name="firstName" 
                       type="text" 
                       required 
                       [(ngModel)]="registrationData.first_name"
                       class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <div class="mt-1">
                <input id="lastName" 
                       name="lastName" 
                       type="text" 
                       required 
                       [(ngModel)]="registrationData.last_name"
                       class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div class="mt-1">
                <input id="email" 
                       name="email" 
                       type="email" 
                       required 
                       [(ngModel)]="registrationData.email"
                       class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="registrationNumber" class="block text-sm font-medium text-gray-700">
                Registration Number
              </label>
              <div class="mt-1">
                <input id="registrationNumber" 
                       name="registrationNumber" 
                       type="text" 
                       required 
                       [(ngModel)]="registrationData.registration_number"
                       (blur)="validateRegistrationNumber()"
                       placeholder="GPR3/123456/2025"
                       class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                       [class.border-red-300]="registrationError"
                       [class.focus:ring-red-500]="registrationError"
                       [class.focus:border-red-500]="registrationError">
              </div>
              <div *ngIf="registrationError" class="mt-1 text-sm text-accent-500">
                {{ registrationError }}
              </div>
              <div class="mt-1 text-xs text-gray-500">
                Format: GPR3/XXXXXX/2025 (where XXXXXX is your unique number)
              </div>
            </div>

            <div>
              <label for="phoneNumber" class="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div class="mt-1">
                <input id="phoneNumber" 
                       name="phoneNumber" 
                       type="tel" 
                       required 
                       [(ngModel)]="registrationData.phone_number"
                       placeholder="+254 XXX XXX XXX"
                       class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div class="mt-1">
                <input id="password" 
                       name="password" 
                       type="password" 
                       required 
                       [(ngModel)]="registrationData.password"
                       class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div class="mt-1">
                <input id="confirmPassword" 
                       name="confirmPassword" 
                       type="password" 
                       required 
                       [(ngModel)]="registrationData.confirm_password"
                       class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
              </div>
            </div>

            <div class="bg-primary-50 border border-primary-200 rounded-md p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-primary-800">
                    Manual Approval Required
                  </h3>
                  <div class="mt-2 text-sm text-primary-700">
                    <p>Your registration will be reviewed by administrators. You'll receive an email notification once your account is approved.</p>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="errorMessage" class="bg-accent-50 border border-accent-200 rounded-md p-4">
              <div class="text-sm text-accent-700">
                {{ errorMessage }}
              </div>
            </div>

            <div *ngIf="successMessage" class="bg-green-50 border border-green-200 rounded-md p-4">
              <div class="text-sm text-green-700">
                {{ successMessage }}
              </div>
            </div>

            <div>
              <button type="submit" 
                      [disabled]="isLoading || !isFormValid()"
                      class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <span *ngIf="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ isLoading ? 'Registering...' : 'Register' }}
              </button>
            </div>

            <div class="text-center">
              <p class="text-sm text-gray-600">
                Already have an account?
                <a routerLink="/login" class="font-medium text-primary-600 hover:text-primary-500">
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
    confirm_password: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  registrationError = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  validateRegistrationNumber(): void {
    const regNumber = this.registrationData.registration_number.trim();
    const gpr3Pattern = /^GPR3\/\d{6}\/2025$/;
    
    if (!regNumber) {
      this.registrationError = '';
      return;
    }

    if (!gpr3Pattern.test(regNumber)) {
      this.registrationError = 'Registration number must be in format GPR3/XXXXXX/2025';
      return;
    }

    this.registrationError = '';
  }

  isFormValid(): boolean {
    return this.registrationData.first_name.trim() !== '' &&
           this.registrationData.last_name.trim() !== '' &&
           this.registrationData.email.trim() !== '' &&
           this.registrationData.registration_number.trim() !== '' &&
           this.registrationData.phone_number.trim() !== '' &&
           this.registrationData.password.trim() !== '' &&
           this.registrationData.confirm_password.trim() !== '' &&
           this.registrationData.password === this.registrationData.confirm_password &&
           !this.registrationError;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

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
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.successMessage = 'Registration submitted successfully! You will receive an email notification once your account is approved by administrators.';
          
          // Reset form
          this.registrationData = {
            first_name: '',
            last_name: '',
            email: '',
            registration_number: '',
            phone_number: '',
            password: '',
            confirm_password: ''
          };
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred during registration. Please try again.';
      }
    });
  }
}