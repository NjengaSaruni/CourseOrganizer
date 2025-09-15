import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
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
              <a routerLink="/" 
                 class="text-gray-600 hover:text-gray-900 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors">
                Home
              </a>
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
      <div class="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <h1 class="text-5xl font-bold text-gray-900 mb-6">
            About <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RiverLearn</span>
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Empowering the future of education through innovative technology solutions designed specifically for African universities.
          </p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-6xl mx-auto px-6 py-16">
        
        <!-- Company Overview -->
        <div class="mb-16">
          <div class="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p class="text-lg text-gray-600 mb-6">
                RiverLearn Inc. is a technology company incorporated in Kenya, dedicated to transforming educational experiences across African universities. We believe that every student deserves access to modern, efficient, and user-friendly academic management tools.
              </p>
              <p class="text-lg text-gray-600 mb-8">
                Course Organizer represents our first major initiative - a comprehensive platform designed specifically for University of Nairobi students, starting with the School of Law Class of 2029.
              </p>
              
              <div class="grid grid-cols-2 gap-6">
                <div class="text-center">
                  <div class="text-3xl font-bold text-blue-600 mb-2">2025</div>
                  <div class="text-sm text-gray-600">Founded</div>
                </div>
                <div class="text-center">
                  <div class="text-3xl font-bold text-purple-600 mb-2">Kenya</div>
                  <div class="text-sm text-gray-600">Based</div>
                </div>
              </div>
            </div>
            
            <div class="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 class="text-xl font-semibold text-gray-900 mb-4">Company Details</h3>
              <div class="space-y-4">
                <div>
                  <span class="font-medium text-gray-900">Legal Name:</span>
                  <span class="text-gray-600 ml-2">RiverLearn Inc.</span>
                </div>
                <div>
                  <span class="font-medium text-gray-900">Incorporation:</span>
                  <span class="text-gray-600 ml-2">Kenya, 2025</span>
                </div>
                <div>
                  <span class="font-medium text-gray-900">Headquarters:</span>
                  <span class="text-gray-600 ml-2">Nairobi, Kenya</span>
                </div>
                <div>
                  <span class="font-medium text-gray-900">Industry:</span>
                  <span class="text-gray-600 ml-2">Educational Technology</span>
                </div>
                <div>
                  <span class="font-medium text-gray-900">Focus:</span>
                  <span class="text-gray-600 ml-2">University Management Systems</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- What We Do -->
        <div class="mb-16">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">What We Do</h2>
            <p class="text-lg text-gray-600 max-w-3xl mx-auto">
              We develop cutting-edge educational technology solutions that address the unique challenges faced by African universities and their students.
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-6">
                <svg class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">Academic Management</h3>
              <p class="text-gray-600">
                Comprehensive platforms for course management, timetable scheduling, and academic resource distribution.
              </p>
            </div>

            <div class="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-2xl mb-6">
                <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">Student Communication</h3>
              <p class="text-gray-600">
                Advanced communication tools including SMS notifications, class announcements, and peer-to-peer messaging.
              </p>
            </div>

            <div class="bg-white border border-gray-200 rounded-2xl p-8 text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-2xl mb-6">
                <svg class="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-3">Security & Privacy</h3>
              <p class="text-gray-600">
                Enterprise-grade security with robust user verification, data protection, and privacy compliance.
              </p>
            </div>
          </div>
        </div>

        <!-- Course Organizer Focus -->
        <div class="mb-16">
          <div class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-12">
            <div class="text-center mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-4">Course Organizer: Our Flagship Product</h2>
              <p class="text-lg text-gray-600 max-w-3xl mx-auto">
                Course Organizer represents our commitment to solving real-world problems in African higher education through technology.
              </p>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
              <div class="bg-white rounded-2xl p-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Why University of Nairobi?</h3>
                <ul class="space-y-3 text-gray-600">
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    One of Kenya's premier universities with a rich academic tradition
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    Large student population that can benefit from digital solutions
                  </li>
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    Strategic location in Nairobi, Kenya's technology hub
                  </li>
                </ul>
              </div>

              <div class="bg-white rounded-2xl p-8">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Our Expansion Plan</h3>
                <div class="space-y-4">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <span class="text-green-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">Class of 2029 (Current)</div>
                      <div class="text-sm text-gray-600">First-year law students</div>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span class="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">All Law Students</div>
                      <div class="text-sm text-gray-600">All years at UoN School of Law</div>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <span class="text-purple-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">Other Faculties</div>
                      <div class="text-sm text-gray-600">Expand to other UoN programs</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Founder Section -->
        <div class="mb-16">
          <div class="bg-white border border-gray-200 rounded-3xl p-12">
            <div class="text-center mb-12">
              <h2 class="text-3xl font-bold text-gray-900 mb-4">Meet the Founder</h2>
              <p class="text-lg text-gray-600 max-w-3xl mx-auto">
                RiverLearn Inc. was founded by Peter Njenga, a seasoned software engineer with a unique vision to bridge the gap between AI, technology, and legal education.
              </p>
            </div>

            <div class="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div class="flex items-center space-x-4 mb-6">
                  <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <span class="text-white font-bold text-2xl">PN</span>
                  </div>
                  <div>
                    <h3 class="text-2xl font-bold text-gray-900">Peter Njenga</h3>
                    <p class="text-lg text-gray-600">Founder & CEO, RiverLearn Inc.</p>
                    <p class="text-sm text-gray-500">Currently pursuing Law at University of Nairobi</p>
                  </div>
                </div>
                
                <p class="text-gray-600 mb-6">
                  Peter brings over 6 years of experience in software engineering, having worked at leading technology companies including Amazon Web Services and Microsoft. His unique journey of pursuing law while building educational technology solutions gives him deep insights into the challenges faced by modern students.
                </p>

                <div class="space-y-4">
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <div>
                      <p class="font-medium text-gray-900">AWS Software Engineer II (2022-2024)</p>
                      <p class="text-sm text-gray-600">Led infrastructure improvements saving 53% storage costs</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-blue-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <div>
                      <p class="font-medium text-gray-900">Microsoft Software Engineer (2019-2022)</p>
                      <p class="text-sm text-gray-600">Built DNS services and VM management tools for Azure</p>
                    </div>
                  </div>

                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-purple-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <div>
                      <p class="font-medium text-gray-900">UoN Law Student (Current)</p>
                      <p class="text-sm text-gray-600">Bridging the gap between technology and legal education</p>
                    </div>
                  </div>
                </div>

                <div class="mt-8">
                  <a href="https://www.linkedin.com/in/peternjengask/" 
                     target="_blank"
                     class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Connect on LinkedIn
                  </a>
                </div>
              </div>

              <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                <h4 class="text-xl font-semibold text-gray-900 mb-6">Why Law + Technology?</h4>
                <div class="space-y-4">
                  <div class="flex items-start">
                    <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <h5 class="font-medium text-gray-900 mb-1">Real-World Experience</h5>
                      <p class="text-sm text-gray-600">As a current UoN Law student, Peter understands the daily challenges faced by law students firsthand.</p>
                    </div>
                  </div>

                  <div class="flex items-start">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <h5 class="font-medium text-gray-900 mb-1">Technical Expertise</h5>
                      <p class="text-sm text-gray-600">Extensive background in building scalable systems at AWS and Microsoft ensures robust, reliable solutions.</p>
                    </div>
                  </div>

                  <div class="flex items-start">
                    <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <h5 class="font-medium text-gray-900 mb-1">Innovation Focus</h5>
                      <p class="text-sm text-gray-600">Bridging AI and legal education to create next-generation learning tools for African universities.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Values -->
        <div class="mb-16">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p class="text-lg text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at RiverLearn Inc.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
                <svg class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
              <p class="text-gray-600 text-sm">Continuously pushing the boundaries of educational technology</p>
            </div>

            <div class="text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-2xl mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Inclusivity</h3>
              <p class="text-gray-600 text-sm">Making quality education accessible to all students</p>
            </div>

            <div class="text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-50 rounded-2xl mb-4">
                <svg class="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Security</h3>
              <p class="text-gray-600 text-sm">Protecting student data with enterprise-grade security</p>
            </div>

            <div class="text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-2xl mb-4">
                <svg class="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Excellence</h3>
              <p class="text-gray-600 text-sm">Delivering exceptional user experiences and support</p>
            </div>
          </div>
        </div>

        <!-- Contact Section -->
        <div class="bg-gray-900 rounded-3xl p-12 text-white text-center">
          <h2 class="text-3xl font-bold mb-4">Get in Touch</h2>
          <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Have questions about Course Organizer or interested in partnering with RiverLearn Inc.?
          </p>
          
          <div class="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div class="text-2xl font-bold text-white mb-2">Email</div>
              <a href="mailto:info@riverlearn.co.ke" class="text-gray-300 hover:text-white transition-colors">
                info@riverlearn.co.ke
              </a>
            </div>
            <div>
              <div class="text-2xl font-bold text-white mb-2">Support</div>
              <a href="mailto:support@riverlearn.co.ke" class="text-gray-300 hover:text-white transition-colors">
                support@riverlearn.co.ke
              </a>
            </div>
            <div>
              <div class="text-2xl font-bold text-white mb-2">Location</div>
              <div class="text-gray-300">Nairobi, Kenya</div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/register" 
               class="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-colors inline-flex items-center justify-center">
              Try Course Organizer
            </a>
            <a href="mailto:info@riverlearn.co.ke" 
               class="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-6 py-3 rounded-full font-medium transition-colors">
              Contact Us
            </a>
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
export class AboutComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

}
