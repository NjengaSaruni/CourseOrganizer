import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="flex justify-center mb-4">
            <img src="/courseorganizerlogo.png" 
                 alt="Course Organizer Logo" 
                 class="h-16 w-auto">
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-navy-500">
            Sign in to Course Organizer
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            University of Nairobi - Access your course materials and schedule
          </p>
        </div>
        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email" class="sr-only">Email address</label>
              <input id="email" 
                     name="email" 
                     type="email" 
                     autocomplete="email" 
                     required 
                     [(ngModel)]="email"
                     class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm" 
                     placeholder="Email address">
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input id="password" 
                     name="password" 
                     type="password" 
                     autocomplete="current-password" 
                     required 
                     [(ngModel)]="password"
                     class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm" 
                     placeholder="Password">
            </div>
          </div>

          <div *ngIf="errorMessage" class="text-accent-500 text-sm text-center">
            {{ errorMessage }}
          </div>

          <!-- Demo Account Information -->
          <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">
                  Demo Accounts Available
                </h3>
                <div class="mt-2 text-sm text-blue-700">
                  <p><strong>Admin:</strong> admin@uon.ac.ke / admin123</p>
                  <p><strong>Student:</strong> john.doe@student.uon.ac.ke / student123</p>
                  <p><strong>Pending:</strong> jane.smith@student.uon.ac.ke / student123</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button type="submit" 
                    [disabled]="isLoading || !loginForm.form.valid"
                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="h-5 w-5 text-primary-500 group-hover:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </span>
              Sign in
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Don't have an account?
              <a routerLink="/register" class="font-medium text-primary-600 hover:text-primary-500">
                Register here
              </a>
            </p>
            <p class="text-sm text-gray-600 mt-2">
              <a routerLink="/" class="font-medium text-primary-600 hover:text-primary-500">
                ← Back to Home
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
    
    <app-loader [isLoading]="isLoading" message="Signing in..."></app-loader>
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
    private router: Router
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
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Login failed. Please check your credentials and try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error && error.error.non_field_errors) {
          this.errorMessage = error.error.non_field_errors[0];
        } else if (error.error && error.error.email) {
          this.errorMessage = error.error.email[0];
        } else if (error.error && error.error.password) {
          this.errorMessage = error.error.password[0];
        } else {
          this.errorMessage = 'An error occurred. Please try again.';
        }
      }
    });
  }

}