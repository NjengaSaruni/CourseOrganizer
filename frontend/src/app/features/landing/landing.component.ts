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
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="flex justify-between items-center py-4">
            <div class="flex items-center">
              <div class="flex-shrink-0 flex items-center space-x-2 sm:space-x-3">
                <img src="/courseorganizerlogo.png" 
                     alt="Course Organizer Logo" 
                     class="h-8 sm:h-10 w-auto">
                <h1 class="text-lg sm:text-xl font-semibold text-gray-900">Course Organizer</h1>
              </div>
            </div>
            <div class="flex items-center space-x-1 sm:space-x-3">
              <a routerLink="/login" 
                 class="text-gray-600 hover:text-gray-900 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors">
                Sign In
              </a>
              <a routerLink="/register" 
                 class="bg-gray-900 hover:bg-gray-800 text-white px-3 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero Section -->
      <div class="max-w-6xl mx-auto px-6 py-20">
        <div class="text-center">
          <div class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-8">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Now Supporting Class of 2029 - Law Students
          </div>
          <h1 class="text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Transform Your 
            <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Academic Experience</span>
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            The complete digital ecosystem for University of Nairobi students. Access course materials, manage your timetable, communicate with classmates, and stay organized throughout your academic journey.
          </p>
          
          <!-- Key Benefits -->
          <div class="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div class="flex items-center justify-center space-x-3">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="text-gray-700 font-medium">All-in-One Platform</span>
            </div>
            <div class="flex items-center justify-center space-x-3">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="text-gray-700 font-medium">Mobile Optimized</span>
            </div>
            <div class="flex items-center justify-center space-x-3">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="text-gray-700 font-medium">Secure & Reliable</span>
            </div>
          </div>
          
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
              We're starting with first-year law students (Class of 2029) and will expand to all law students, then to other University of Nairobi programs.
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

        <!-- Comprehensive Features Section -->
        <div class="mb-20">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-6">Everything You Need for Academic Success</h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              A complete digital ecosystem designed specifically for University of Nairobi students with powerful tools for learning, communication, and academic management.
            </p>
          </div>

          <!-- Core Academic Features -->
          <div class="mb-16">
            <h3 class="text-2xl font-bold text-gray-900 mb-8 text-center">📚 Core Academic Tools</h3>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6">
                  <svg class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 class="text-xl font-semibold text-gray-900 mb-3">Smart Timetable</h4>
                <p class="text-gray-600 mb-4">Interactive class schedules with real-time updates, room assignments, and professor information.</p>
                <ul class="text-sm text-gray-500 space-y-1">
                  <li>• Weekly and monthly views</li>
                  <li>• Automatic conflict detection</li>
                  <li>• Mobile-optimized interface</li>
                </ul>
              </div> 

              <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-2xl mb-6">
                  <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 class="text-xl font-semibold text-gray-900 mb-3">Course Materials Hub</h4>
                <p class="text-gray-600 mb-4">Organized library of all course documents, readings, assignments, and study resources.</p>
                <ul class="text-sm text-gray-500 space-y-1">
                  <li>• PDF documents and presentations</li>
                  <li>• Searchable content library</li>
                  <li>• Offline download capability</li>
                </ul>
              </div>

              <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-2xl mb-6">
                  <svg class="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 class="text-xl font-semibold text-gray-900 mb-3">Lecture Recordings</h4>
                <p class="text-gray-600 mb-4">High-quality recorded lectures with searchable transcripts and bookmark functionality.</p>
                <ul class="text-sm text-gray-500 space-y-1">
                  <li>• HD video streaming</li>
                  <li>• Playback speed control</li>
                  <li>• Timestamp bookmarks</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Communication Features -->
          <div class="mb-16">
            <h3 class="text-2xl font-bold text-gray-900 mb-8 text-center">💬 Communication & Collaboration</h3>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-2xl mb-6">
                  <svg class="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 9h6m-6 4h6m-6 4h4" />
                  </svg>
                </div>
                <h4 class="text-xl font-semibold text-gray-900 mb-3">Class Representatives</h4>
                <p class="text-gray-600 mb-4">Dedicated class representatives who can send announcements and facilitate communication.</p>
                <ul class="text-sm text-gray-500 space-y-1">
                  <li>• Official announcements</li>
                  <li>• Class-wide notifications</li>
                  <li>• Direct communication channel</li>
                </ul>
              </div>

              <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-6">
                  <svg class="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 class="text-xl font-semibold text-gray-900 mb-3">Class Discussions</h4>
                <p class="text-gray-600 mb-4">Engage in meaningful discussions with classmates about course topics and assignments.</p>
                <ul class="text-sm text-gray-500 space-y-1">
                  <li>• Topic-based discussions</li>
                  <li>• Real-time messaging</li>
                  <li>• File sharing in conversations</li>
                </ul>
              </div>

              <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-teal-50 rounded-2xl mb-6">
                  <svg class="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 class="text-xl font-semibold text-gray-900 mb-3">SMS Notifications</h4>
                <p class="text-gray-600 mb-4">Stay informed with instant SMS notifications for important updates and announcements.</p>
                <ul class="text-sm text-gray-500 space-y-1">
                  <li>• Instant class updates</li>
                  <li>• Assignment reminders</li>
                  <li>• Emergency notifications</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Management & Admin Features -->
          <div class="mb-16">
            <h3 class="text-2xl font-bold text-gray-900 mb-8 text-center">⚙️ Advanced Management</h3>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-6">
                  <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 class="text-xl font-semibold text-gray-900 mb-3">Secure Registration</h4>
                <p class="text-gray-600 mb-4">Robust user verification system with manual approval and SMS-based authentication.</p>
                <ul class="text-sm text-gray-500 space-y-1">
                  <li>• Registration number validation</li>
                  <li>• Manual admin approval</li>
                  <li>• SMS passcode verification</li>
                </ul>
              </div>

              <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-yellow-50 rounded-2xl mb-6">
                  <svg class="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 class="text-xl font-semibold text-gray-900 mb-3">User Management</h4>
                <p class="text-gray-600 mb-4">Comprehensive admin dashboard for managing students, teachers, and class representatives.</p>
                <ul class="text-sm text-gray-500 space-y-1">
                  <li>• Student approval workflow</li>
                  <li>• Role-based permissions</li>
                  <li>• Bulk user operations</li>
                </ul>
              </div>

              <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-pink-50 rounded-2xl mb-6">
                  <svg class="w-8 h-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 class="text-xl font-semibold text-gray-900 mb-3">Analytics Dashboard</h4>
                <p class="text-gray-600 mb-4">Real-time insights into student engagement, course performance, and platform usage.</p>
                <ul class="text-sm text-gray-500 space-y-1">
                  <li>• Student activity tracking</li>
                  <li>• Course engagement metrics</li>
                  <li>• Usage analytics</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Technical Features -->
          <div class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-12">
            <h3 class="text-2xl font-bold text-gray-900 mb-8 text-center">🚀 Technical Excellence</h3>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-4 shadow-sm">
                  <svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2">Lightning Fast</h4>
                <p class="text-sm text-gray-600">Optimized performance with instant loading times</p>
              </div>
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-4 shadow-sm">
                  <svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2">Mobile First</h4>
                <p class="text-sm text-gray-600">Responsive design optimized for all devices</p>
              </div>
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-4 shadow-sm">
                  <svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2">Secure & Private</h4>
                <p class="text-sm text-gray-600">Enterprise-grade security with data protection</p>
              </div>
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-4 shadow-sm">
                  <svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2">User Friendly</h4>
                <p class="text-sm text-gray-600">Intuitive interface designed for easy navigation</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Student Success Stories - Commented out until we have actual reviews -->
        <!-- 
        <div class="mb-20">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-6">What Students Are Saying</h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              See how Course Organizer is transforming the academic experience for University of Nairobi students.
            </p>
          </div>
          
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 font-bold text-lg">J</span>
                </div>
                <div class="ml-4">
                  <h4 class="font-semibold text-gray-900">John Mwangi</h4>
                  <p class="text-sm text-gray-600">Class of 2029 - Law Student</p>
                </div>
              </div>
              <p class="text-gray-700 mb-4">
                "Course Organizer has made managing my academic life so much easier. I can access all my materials, check my timetable, and stay updated with class announcements all in one place."
              </p>
              <div class="flex text-yellow-400">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              </div>
            </div>

            <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-green-600 font-bold text-lg">S</span>
                </div>
                <div class="ml-4">
                  <h4 class="font-semibold text-gray-900">Sarah Wanjiku</h4>
                  <p class="text-sm text-gray-600">Class of 2029 - Law Student</p>
                </div>
              </div>
              <p class="text-gray-700 mb-4">
                "The SMS notifications are a game-changer! I never miss important announcements or assignment deadlines. The platform is so intuitive and well-designed."
              </p>
              <div class="flex text-yellow-400">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              </div>
            </div>

            <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span class="text-purple-600 font-bold text-lg">D</span>
                </div>
                <div class="ml-4">
                  <h4 class="font-semibold text-gray-900">David Ochieng</h4>
                  <p class="text-sm text-gray-600">Class of 2029 - Law Student</p>
                </div>
              </div>
              <p class="text-gray-700 mb-4">
                "As a class representative, Course Organizer makes it so easy to communicate with my classmates. The admin tools are powerful yet simple to use."
              </p>
              <div class="flex text-yellow-400">
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              </div>
            </div>
          </div>
        </div>
        -->

        <!-- Future Plans -->
        <div class="bg-white border border-gray-200 rounded-2xl p-12">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-semibold text-gray-900 mb-4">Future Expansion</h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to expanding access to all University of Nairobi students through a phased approach.
            </p>
          </div>
          
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-gray-50 rounded-xl p-8">
              <div class="flex items-center mb-4">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-green-600 font-bold text-sm">1</span>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">Phase 1: Class of 2029</h3>
              </div>
              <p class="text-gray-600 mb-4">Starting with first-year law students (Class of 2029)</p>
              <div class="flex items-center text-sm text-gray-700">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Currently Active
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-xl p-8">
              <div class="flex items-center mb-4">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-blue-600 font-bold text-sm">2</span>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">Phase 2: All Law Students</h3>
              </div>
              <p class="text-gray-600 mb-4">Expanding to cover all law students across all years at UoN</p>
              <div class="flex items-center text-sm text-gray-500">
                <div class="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                In Development
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-xl p-8">
              <div class="flex items-center mb-4">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span class="text-purple-600 font-bold text-sm">3</span>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">Phase 3: Other Courses</h3>
              </div>
              <p class="text-gray-600 mb-4">Expanding to other University of Nairobi programs and faculties</p>
              <div class="flex items-center text-sm text-gray-500">
                <div class="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                Future Plans
              </div>
            </div>
          </div>
          
          <!-- Timeline -->
          <div class="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-6 text-center">Expansion Timeline</h3>
            <div class="flex items-center justify-between">
              <div class="text-center">
                <div class="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p class="text-sm font-medium text-gray-900">2025 Q4</p>
                <p class="text-xs text-gray-600">Class of 2029</p>
              </div>
              <div class="flex-1 h-0.5 bg-gray-300 mx-4"></div>
              <div class="text-center">
                <div class="w-4 h-4 bg-blue-400 rounded-full mx-auto mb-2"></div>
                <p class="text-sm font-medium text-gray-900">2026 Q1-Q2</p>
                <p class="text-xs text-gray-600">All Law Students</p>
              </div>
              <div class="flex-1 h-0.5 bg-gray-300 mx-4"></div>
              <div class="text-center">
                <div class="w-4 h-4 bg-gray-400 rounded-full mx-auto mb-2"></div>
                <p class="text-sm font-medium text-gray-900">2026 Q3+</p>
                <p class="text-xs text-gray-600">Other Courses</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Final Call-to-Action -->
      <div class="max-w-4xl mx-auto px-6 py-20">
        <div class="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-12 text-center text-white">
          <h2 class="text-4xl font-bold mb-6">Ready to Transform Your Academic Journey?</h2>
          <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Be among the first University of Nairobi students to experience the future of academic management with Course Organizer.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a routerLink="/register" 
               class="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-full font-semibold text-lg transition-colors inline-flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Get Started Today
            </a>
            <a routerLink="/login" 
               class="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-full font-medium transition-colors">
              Already Have an Account? Sign In
            </a>
          </div>
          
          <!-- Trust Indicators -->
          <div class="grid md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-blue-400">
            <div class="text-center">
              <div class="text-3xl font-bold text-white mb-2">Early Access</div>
              <div class="text-blue-100">Launch Phase</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-white mb-2">100%</div>
              <div class="text-blue-100">Free for Students</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-white mb-2">UoN</div>
              <div class="text-blue-100">Designed for You</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-900 text-white">
        <div class="max-w-6xl mx-auto px-6 py-16">
          <!-- Main Footer Content -->
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <!-- Company Info -->
            <div class="lg:col-span-2">
              <div class="flex items-center space-x-3 mb-4">
                <img src="/courseorganizerlogo.png" 
                     alt="Course Organizer Logo" 
                     class="h-8 w-auto">
                <h3 class="text-xl font-semibold">Course Organizer</h3>
              </div>
              <p class="text-gray-400 mb-6 max-w-md">
                Empowering University of Nairobi students with a comprehensive digital platform for academic success. Built by RiverLearn Inc.
              </p>
              <div class="space-y-2">
                <p class="text-gray-400 text-sm">
                  <span class="font-medium text-white">Company:</span> RiverLearn Inc.
                </p>
                <p class="text-gray-400 text-sm">
                  <span class="font-medium text-white">Location:</span> Nairobi, Kenya
                </p>
                <p class="text-gray-400 text-sm">
                  <span class="font-medium text-white">Established:</span> 2025
                </p>
              </div>
            </div>

            <!-- Quick Links -->
            <div>
              <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
              <ul class="space-y-3">
                <li>
                  <a routerLink="/" class="text-gray-400 hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a routerLink="/about" class="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a routerLink="/register" class="text-gray-400 hover:text-white transition-colors">
                    Register
                  </a>
                </li>
                <li>
                  <a routerLink="/login" class="text-gray-400 hover:text-white transition-colors">
                    Sign In
                  </a>
                </li>
              </ul>
            </div>

            <!-- Support -->
            <div>
              <h4 class="text-lg font-semibold mb-4">Support</h4>
              <ul class="space-y-3">
                <li>
                  <a routerLink="/privacy-policy" class="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="mailto:support@riverlearn.co.ke" class="text-gray-400 hover:text-white transition-colors">
                    Contact Support
                  </a>
                </li>
                <li>
                  <span class="text-gray-400">For Class of 2029 Students</span>
                </li>
                <li>
                  <span class="text-gray-400">University of Nairobi</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Bottom Footer -->
          <div class="border-t border-gray-800 pt-8">
            <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div class="text-center md:text-left">
                <p class="text-gray-400 text-sm">
                  © 2025 RiverLearn Inc. All rights reserved. | Incorporated in Kenya
                </p>
                <p class="text-gray-500 text-xs mt-1">
                  Course Organizer is a product of RiverLearn Inc., a technology company focused on educational solutions.
                </p>
              </div>
              <div class="flex items-center space-x-6">
                <span class="text-gray-500 text-sm">Made with ❤️ in Kenya</span>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span class="text-gray-400 text-sm">System Online</span>
                </div>
              </div>
            </div>
          </div>
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