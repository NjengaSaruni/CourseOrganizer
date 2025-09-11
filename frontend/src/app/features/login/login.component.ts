import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-white py-12 px-6">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="flex justify-center mb-6">
            <img src="/courseorganizerlogo.png" 
                 alt="Course Organizer Logo" 
                 class="h-12 w-auto">
          </div>
          <h2 class="text-center text-3xl font-semibold text-gray-900 mb-2">
            Sign in to Course Organizer
          </h2>
          <p class="text-center text-gray-600">
            University of Nairobi - Access your course materials and schedule
          </p>
        </div>
        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email address</label>
              <input id="email" 
                     name="email" 
                     type="email" 
                     autocomplete="email" 
                     required 
                     [disabled]="isLoading"
                     [(ngModel)]="email"
                     class="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed" 
                     placeholder="Enter your email">
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input id="password" 
                     name="password" 
                     type="password" 
                     autocomplete="current-password" 
                     required 
                     [disabled]="isLoading"
                     [(ngModel)]="password"
                     class="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed" 
                     placeholder="Enter your password">
              
              <!-- Subtle loading indicator under password field -->
              <div *ngIf="isLoading" class="flex items-center justify-center mt-3">
                <div class="flex items-center space-x-2 text-gray-500">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
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
                <p class="text-sm text-red-700">{{ errorMessage }}</p>
              </div>
            </div>
          </div>

          <!-- Demo Account Information -->
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div class="text-center">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">
                Demo Account Available
              </h3>
              <div class="space-y-2 text-sm text-gray-600">
                <p><span class="font-medium">Demo Student (Class of 2029):</span> demo.student@uon.ac.ke / demo123</p>
                <p><span class="font-medium">Student:</span> john.doe@student.uon.ac.ke / student123</p>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" 
                    [disabled]="isLoading || !loginForm.form.valid"
                    class="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="!isLoading">Sign in</span>
              <span *ngIf="isLoading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            </button>
          </div>

          <div class="text-center space-y-3">
            <p class="text-sm text-gray-600">
              Don't have an account?
              <a routerLink="/register" class="font-medium text-gray-900 hover:text-gray-700">
                Register here
              </a>
            </p>
            <p class="text-sm text-gray-600">
              <a routerLink="/" class="font-medium text-gray-900 hover:text-gray-700">
                ← Back to Home
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.authService.login(this.email, this.password).subscribe({
      next: (success) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Login failed. Please check your credentials and try again.';
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        if (error.error && error.error.non_field_errors) {
          this.errorMessage = error.error.non_field_errors[0];
        } else if (error.error && error.error.email) {
          this.errorMessage = error.error.email[0];
        } else if (error.error && error.error.password) {
          this.errorMessage = error.error.password[0];
        } else {
          this.errorMessage = 'An error occurred. Please try again.';
        }
        this.cdr.detectChanges();
      }
    });
  }

}