import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-6xl mx-auto px-6">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center">
              <div class="flex-shrink-0 flex items-center space-x-3">
                <img src="/courseorganizerlogo.png" 
                     alt="Course Organizer Logo" 
                     class="h-10 w-auto">
                <h1 class="text-xl font-semibold text-gray-900">Course Organizer</h1>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <a routerLink="/login" 
                 class="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors">
                Sign In
              </a>
              <a routerLink="/register" 
                 class="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero Section -->
      <div class="max-w-4xl mx-auto px-6 py-20">
        <div class="text-center">
          <h1 class="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Course Organizer
          </h1>
          <p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            A comprehensive platform designed specifically for University of Nairobi students to manage their academic journey.
          </p>
          
          <!-- Primary Call-to-Action -->
          <div class="bg-gray-50 rounded-2xl p-12 mb-16">
            <div class="text-center">
              <h2 class="text-3xl font-semibold text-gray-900 mb-4">Class of 2029</h2>
              <p class="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                First Year Law Students - Join your classmates and access course materials, timetables, and resources
              </p>
              <a routerLink="/register" 
                 class="inline-block bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors">
                Request Registration
              </a>
              <p class="text-sm text-gray-500 mt-6">
                Registration requires admin approval • Free for Class of 2029 students
              </p>
            </div>
          </div>
        </div>

        <!-- Current Support Section -->
        <div class="bg-white border border-gray-200 rounded-2xl p-12 mb-16">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-semibold text-gray-900 mb-4">Currently Supporting</h2>
            <h3 class="text-xl text-gray-600 mb-6">School of Law - Class of 2029</h3>
            <p class="text-lg text-gray-500 max-w-2xl mx-auto">
              We're starting with first-year law students (Class of 2029) and will gradually expand to other classes and programs.
            </p>
          </div>

          <!-- Registration Info -->
          <div class="bg-gray-50 rounded-xl p-8 mb-8">
            <h4 class="text-xl font-semibold text-gray-900 mb-6 text-center">Registration Requirements</h4>
            <div class="space-y-4 max-w-2xl mx-auto">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-gray-700">
                    <span class="font-semibold">Registration Number Format:</span> GPR3/123456/2025 (example)
                  </p>
                </div>
              </div>
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-gray-700">
                    <span class="font-semibold">Manual Approval:</span> All registrations require manual approval by administrators
                  </p>
                </div>
              </div>
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <div class="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-gray-700">
                    <span class="font-semibold">Class of 2029:</span> Must have GPR3/XXXXXX/2025 format registration number
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/register" 
               class="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-semibold transition-colors text-center text-lg">
              Request Registration for Class of 2029
            </a>
            <a routerLink="/login" 
               class="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-full font-medium transition-colors text-center">
              Already Registered? Sign In
            </a>
          </div>
          
          <!-- Registration Notice -->
          <div class="mt-8 bg-gray-100 border border-gray-200 rounded-xl p-6">
            <div class="text-center">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Registration Process
              </h3>
              <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-600 max-w-2xl mx-auto">
                <div class="flex items-center">
                  <span class="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-3">1</span>
                  Click "Request Registration" above
                </div>
                <div class="flex items-center">
                  <span class="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-3">2</span>
                  Fill out your details with GPR3/XXXXXX/2025 registration number
                </div>
                <div class="flex items-center">
                  <span class="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-3">3</span>
                  Wait for admin approval and passcode via SMS
                </div>
                <div class="flex items-center">
                  <span class="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-3">4</span>
                  Use the passcode to complete your registration
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Features Section -->
        <div class="grid md:grid-cols-3 gap-8 mb-16">
          <div class="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
              <svg class="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Class Timetable</h3>
            <p class="text-gray-600">View your class schedule and stay updated with your academic calendar.</p>
          </div>

          <div class="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
              <svg class="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Course Materials</h3>
            <p class="text-gray-600">Access all your course documents, readings, and resources in one place.</p>
          </div>

          <div class="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
              <svg class="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Lecture Recordings</h3>
            <p class="text-gray-600">Watch recorded lectures and catch up on missed classes.</p>
          </div>
        </div>

        <!-- Future Plans -->
        <div class="bg-white border border-gray-200 rounded-2xl p-12">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-semibold text-gray-900 mb-4">Future Expansion</h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to expanding access to all University of Nairobi students.
            </p>
          </div>
          
          <div class="grid md:grid-cols-2 gap-8">
            <div class="bg-gray-50 rounded-xl p-8">
              <h3 class="text-xl font-semibold text-gray-900 mb-3">Phase 1: Class of 2029</h3>
              <p class="text-gray-600 mb-4">Starting with first-year law students (Class of 2029)</p>
              <div class="flex items-center text-sm text-gray-700">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Currently Active
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-xl p-8">
              <h3 class="text-xl font-semibold text-gray-900 mb-3">Phase 2: Other Courses</h3>
              <p class="text-gray-600 mb-4">Expanding to other University of Nairobi programs</p>
              <div class="flex items-center text-sm text-gray-500">
                <div class="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-900 text-white py-12">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <p class="text-gray-400">
            © 2025 University of Nairobi - Course Organizer. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LandingComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Redirect authenticated users to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }
}