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

        <!-- Registration Section -->
        <div class="bg-white border border-gray-200 rounded-2xl p-12 mb-16">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-semibold text-gray-900 mb-4">Join Class of 2029</h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              Currently supporting first-year law students. Registration requires GPR3/XXXXXX/2025 format and manual approval.
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a routerLink="/register" 
               class="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-semibold transition-colors text-center text-lg">
              Request Registration
            </a>
            <a routerLink="/login" 
               class="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-full font-medium transition-colors text-center">
              Already Registered? Sign In
            </a>
          </div>
          
          <!-- Quick Process -->
          <div class="bg-gray-50 rounded-xl p-6">
            <div class="text-center">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Simple Registration Process</h3>
              <div class="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div class="flex flex-col items-center">
                  <span class="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-semibold mb-2">1</span>
                  <span>Request Registration</span>
                </div>
                <div class="flex flex-col items-center">
                  <span class="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-semibold mb-2">2</span>
                  <span>Admin Approval</span>
                </div>
                <div class="flex flex-col items-center">
                  <span class="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-semibold mb-2">3</span>
                  <span>SMS Passcode</span>
                </div>
                <div class="flex flex-col items-center">
                  <span class="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-semibold mb-2">4</span>
                  <span>Complete Setup</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Key Features Section -->
        <div class="mb-20">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-6">Everything You Need for Academic Success</h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              A complete digital ecosystem designed specifically for University of Nairobi students with powerful tools for learning, communication, and academic management.
            </p>
          </div>

          <!-- Main Features Grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <!-- Academic Tools -->
            <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6">
                <svg class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 class="text-xl font-semibold text-gray-900 mb-3">Smart Timetable</h4>
              <p class="text-gray-600 mb-4">Interactive class schedules with real-time updates, room assignments, and professor information.</p>
            </div>

            <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-2xl mb-6">
                <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 class="text-xl font-semibold text-gray-900 mb-3">Course Materials</h4>
              <p class="text-gray-600 mb-4">Organized library of all course documents, readings, assignments, and study resources.</p>
            </div>

            <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-2xl mb-6">
                <svg class="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 class="text-xl font-semibold text-gray-900 mb-3">Lecture Recordings</h4>
              <p class="text-gray-600 mb-4">High-quality recorded lectures with searchable transcripts and bookmark functionality.</p>
            </div>

            <!-- Communication Tools -->
            <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-6">
                <svg class="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
                <h4 class="text-xl font-semibold text-gray-900 mb-3">In-House Meetings</h4>
                <p class="text-gray-600 mb-4">Host and join virtual meetings directly within the platform with integrated video calling.</p>
              </div>

            <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-2xl mb-6">
                <svg class="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 class="text-xl font-semibold text-gray-900 mb-3">Class Discussions</h4>
              <p class="text-gray-600 mb-4">Engage in meaningful discussions with classmates about course topics and assignments.</p>
            </div>

            <div class="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-teal-50 rounded-2xl mb-6">
                <svg class="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 class="text-xl font-semibold text-gray-900 mb-3">SMS Notifications</h4>
              <p class="text-gray-600 mb-4">Stay informed with instant SMS notifications for important updates and announcements.</p>
            </div>
          </div>

          <!-- Latest Features Highlight -->
          <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12 mb-16">
            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-4">✨ Latest Features</h3>
              <p class="text-lg text-gray-600">Recently added capabilities to enhance your academic experience</p>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-4 shadow-sm">
                  <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2">Video Meetings</h4>
                <p class="text-sm text-gray-600">Integrated Jitsi video calling</p>
              </div>
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-4 shadow-sm">
                  <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2">Email Templates</h4>
                <p class="text-sm text-gray-600">Beautiful HTML email notifications</p>
              </div>
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-4 shadow-sm">
                  <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2">Secure Auth</h4>
                <p class="text-sm text-gray-600">SMS-based verification system</p>
              </div>
              <div class="text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl mb-4 shadow-sm">
                  <svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 class="font-semibold text-gray-900 mb-2">Fast & Reliable</h4>
                <p class="text-sm text-gray-600">Optimized performance</p>
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
          <div class="text-center mb-8">
            <h2 class="text-3xl font-semibold text-gray-900 mb-4">Expansion Roadmap</h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to expanding access to all University of Nairobi students through a phased approach.
            </p>
          </div>
          
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-gray-50 rounded-xl p-6 text-center">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-green-600 font-bold text-lg">1</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Class of 2029</h3>
              <p class="text-gray-600 mb-3">First-year law students</p>
              <div class="flex items-center justify-center text-sm text-green-600">
                <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Currently Active
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-xl p-6 text-center">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">All Law Students</h3>
              <p class="text-gray-600 mb-3">All law students at UoN</p>
              <div class="flex items-center justify-center text-sm text-blue-600">
                <div class="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                In Development
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-xl p-6 text-center">
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Other Courses</h3>
              <p class="text-gray-600 mb-3">All UoN programs</p>
              <div class="flex items-center justify-center text-sm text-gray-500">
                <div class="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                Future Plans
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