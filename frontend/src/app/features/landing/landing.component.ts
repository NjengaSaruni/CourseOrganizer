import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-navy-50">
      <!-- Header -->
      <div class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 flex items-center space-x-3">
                <img src="assets/courseorganizerlogo.png" 
                     alt="Course Organizer Logo" 
                     class="h-12 w-auto">
                <h1 class="text-2xl font-bold text-navy-500">Course Organizer</h1>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <a routerLink="/login" 
                 class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Login
              </a>
              <a routerLink="/register" 
                 class="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Register
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center">
          <div class="flex justify-center mb-6">
            <img src="assets/courseorganizerlogo.png" 
                 alt="Course Organizer Logo" 
                 class="h-20 w-auto">
          </div>
          <h1 class="text-4xl font-bold text-navy-500 mb-6">
            Welcome to Course Organizer
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive platform designed specifically for University of Nairobi students to manage their academic journey.
          </p>
        </div>

        <!-- Current Support Section -->
        <div class="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <svg class="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-navy-500 mb-4">Currently Supporting</h2>
            <h3 class="text-xl font-semibold text-primary-600 mb-2">School of Law - Module II Evening Students</h3>
            <p class="text-gray-600">
              We're starting with the School of Law Module II evening program and will gradually expand to other courses.
            </p>
          </div>

          <!-- Registration Info -->
          <div class="bg-primary-50 rounded-lg p-6 mb-6">
            <h4 class="text-lg font-semibold text-navy-500 mb-3">Registration Requirements</h4>
            <div class="space-y-3">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <svg class="w-5 h-5 text-primary-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-gray-700">
                            <strong>Registration Number Format:</strong> GPR3/123456/2025 (example)
                  </p>
                </div>
              </div>
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <svg class="w-5 h-5 text-primary-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-gray-700">
                    <strong>Manual Approval:</strong> All registrations require manual approval by administrators
                  </p>
                </div>
              </div>
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <svg class="w-5 h-5 text-primary-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-gray-700">
                    <strong>Current Students:</strong> Must have GPR3/*/2025 format registration number
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/register" 
               class="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-md font-medium transition-colors text-center">
              Register Now
            </a>
            <a routerLink="/login" 
               class="bg-white hover:bg-gray-50 text-primary-600 border border-primary-300 px-6 py-3 rounded-md font-medium transition-colors text-center">
              Already Registered? Login
            </a>
          </div>
        </div>

        <!-- Features Section -->
        <div class="grid md:grid-cols-3 gap-8 mb-12">
          <div class="bg-white rounded-lg shadow-lg p-6 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
              <svg class="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-navy-500 mb-2">Class Timetable</h3>
            <p class="text-gray-600 text-sm">View your class schedule and stay updated with your academic calendar.</p>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
              <svg class="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-navy-500 mb-2">Course Materials</h3>
            <p class="text-gray-600 text-sm">Access all your course documents, readings, and resources in one place.</p>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
              <svg class="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-navy-500 mb-2">Lecture Recordings</h3>
            <p class="text-gray-600 text-sm">Watch recorded lectures and catch up on missed classes.</p>
          </div>
        </div>

        <!-- Future Plans -->
        <div class="bg-white rounded-lg shadow-lg p-8">
          <div class="text-center mb-6">
            <h2 class="text-2xl font-bold text-navy-500 mb-4">Future Expansion</h2>
            <p class="text-gray-600">
              We're committed to expanding access to all University of Nairobi students.
            </p>
          </div>
          
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-navy-500 mb-2">Phase 1: Module II Students</h3>
              <p class="text-gray-600 text-sm mb-3">Starting with School of Law Module II evening students</p>
              <div class="flex items-center text-sm text-primary-600">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Currently Active
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-navy-500 mb-2">Phase 2: Other Courses</h3>
              <p class="text-gray-600 text-sm mb-3">Expanding to other University of Nairobi programs</p>
              <div class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-navy-500 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p class="text-sm">
            © 2025 University of Nairobi - Course Organizer. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LandingComponent {}