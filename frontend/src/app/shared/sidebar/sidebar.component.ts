import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Desktop Sidebar -->
    <div class="hidden md:flex md:w-72 md:flex-col">
      <div class="flex flex-col h-screen bg-white overflow-y-auto border-r border-gray-200">
        <!-- Header -->
        <div class="flex items-center flex-shrink-0 px-6 py-6 space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">CO</span>
          </div>
          <h2 class="text-lg font-semibold text-gray-900">Course Organizer</h2>
        </div>
        
        <!-- Main Navigation -->
        <div class="flex-grow flex flex-col px-4">
          <nav class="flex-1 space-y-6">
            
            <!-- Dashboard Section -->
            <div class="space-y-2">
              <div class="px-3 py-2">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overview</h3>
              </div>
              <a routerLink="/dashboard" 
                 routerLinkActive="bg-blue-50 text-blue-700 border-r-2 border-blue-500" 
                 class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Dashboard</div>
                  <div class="text-xs text-gray-500">Your learning overview</div>
                </div>
              </a>
            </div>

            <!-- Academic Section -->
            <div class="space-y-2">
              <div class="px-3 py-2">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Academic</h3>
              </div>
              <a routerLink="/timetable" 
                 routerLinkActive="bg-green-50 text-green-700 border-r-2 border-green-500" 
                 class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Timetable</div>
                  <div class="text-xs text-gray-500">Your class schedule</div>
                </div>
              </a>
              
              <a routerLink="/materials" 
                 routerLinkActive="bg-purple-50 text-purple-700 border-r-2 border-purple-500" 
                 class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Materials</div>
                  <div class="text-xs text-gray-500">Course resources</div>
                </div>
              </a>
              
              <a routerLink="/recordings" 
                 routerLinkActive="bg-orange-50 text-orange-700 border-r-2 border-orange-500" 
                 class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Recordings</div>
                  <div class="text-xs text-gray-500">Lecture videos</div>
                </div>
              </a>
              
              <a routerLink="/meetings" 
                 routerLinkActive="bg-teal-50 text-teal-700 border-r-2 border-teal-500" 
                 class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Meetings</div>
                  <div class="text-xs text-gray-500">Online sessions</div>
                </div>
              </a>

              <!-- Announcements (for all students) -->
              <a routerLink="/announcements" 
                 routerLinkActive="bg-orange-50 text-orange-700 border-r-2 border-orange-500" 
                 class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 9h6m-6 4h6m-6 4h4"/>
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Announcements</div>
                  <div class="text-xs text-gray-500">{{ isClassRep() ? 'Send class announcements' : 'View class announcements' }}</div>
                </div>
              </a>
              
              <!-- Course Timeline (for all users) -->
              <a routerLink="/course-timeline" 
                 routerLinkActive="bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500" 
                 class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Course Timeline</div>
                  <div class="text-xs text-gray-500">Browse content chronologically</div>
                </div>
              </a>
            </div>

            <!-- Administration Section -->
            <div *ngIf="isAdmin()" class="space-y-2">
              <div class="px-3 py-2">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Administration</h3>
              </div>
              <a routerLink="/admin" 
                 routerLinkActive="bg-red-50 text-red-700 border-r-2 border-red-500" 
                 class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Admin Panel</div>
                  <div class="text-xs text-gray-500">Manage registrations</div>
                </div>
              </a>
              
              <a routerLink="/admin/class-rep-management" 
                 routerLinkActive="bg-purple-50 text-purple-700 border-r-2 border-purple-500" 
                 class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Class Representatives</div>
                  <div class="text-xs text-gray-500">Manage class reps</div>
                </div>
              </a>
              
              <a routerLink="/admin/course-management" 
                 routerLinkActive="bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500" 
                 class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Course Management</div>
                  <div class="text-xs text-gray-500">Upload recordings & materials</div>
                </div>
              </a>
              
              <a routerLink="/content-manager" 
                 routerLinkActive="bg-emerald-50 text-emerald-700 border-r-2 border-emerald-500" 
                 class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Content Manager</div>
                  <div class="text-xs text-gray-500">Add course content & timeline</div>
                </div>
              </a>
            </div>
          </nav>
        </div>
        
        <!-- User Profile Section -->
        <div class="flex-shrink-0 border-t border-gray-200 p-4">
          <div class="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div class="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
              <span class="text-white font-semibold text-sm">{{ getInitials() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">{{ currentUser?.full_name }}</p>
              <p class="text-xs text-gray-500 truncate">{{ currentUser?.email }}</p>
            </div>
            <button (click)="logout()" 
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile sidebar overlay -->
    <div *ngIf="isSidebarOpen" class="fixed inset-0 z-40 md:hidden">
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75" (click)="toggleSidebar()"></div>
      <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div class="absolute top-0 right-0 -mr-12 pt-2">
          <button (click)="toggleSidebar()" 
                  class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
            <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 pt-6 pb-4 overflow-y-auto max-h-screen">
          <!-- Header -->
          <div class="flex-shrink-0 flex items-center px-6 space-x-3 mb-8">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">CO</span>
            </div>
            <h2 class="text-lg font-semibold text-gray-900">Course Organizer</h2>
          </div>
          
          <!-- Navigation -->
          <nav class="px-4 space-y-6">
            <!-- Dashboard Section -->
            <div class="space-y-2">
              <div class="px-3 py-2">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overview</h3>
              </div>
              <a routerLink="/dashboard" 
                 routerLinkActive="bg-blue-50 text-blue-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Dashboard</div>
                  <div class="text-xs text-gray-500">Your learning overview</div>
                </div>
              </a>
            </div>

            <!-- Academic Section -->
            <div class="space-y-2">
              <div class="px-3 py-2">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Academic</h3>
              </div>
              <a routerLink="/timetable" 
                 routerLinkActive="bg-green-50 text-green-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Timetable</div>
                  <div class="text-xs text-gray-500">Your class schedule</div>
                </div>
              </a>
              
              <a routerLink="/materials" 
                 routerLinkActive="bg-purple-50 text-purple-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Materials</div>
                  <div class="text-xs text-gray-500">Course resources</div>
                </div>
              </a>
              
              <a routerLink="/recordings" 
                 routerLinkActive="bg-orange-50 text-orange-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Recordings</div>
                  <div class="text-xs text-gray-500">Lecture videos</div>
                </div>
              </a>
              
              <a routerLink="/meetings" 
                 routerLinkActive="bg-teal-50 text-teal-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Meetings</div>
                  <div class="text-xs text-gray-500">Online sessions</div>
                </div>
              </a>

              <!-- Announcements (for all students) -->
              <a routerLink="/announcements" 
                 routerLinkActive="bg-orange-50 text-orange-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 9h6m-6 4h6m-6 4h4"/>
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Announcements</div>
                  <div class="text-xs text-gray-500">{{ isClassRep() ? 'Send class announcements' : 'View class announcements' }}</div>
                </div>
              </a>
              
              <!-- Course Timeline (for all users) -->
              <a routerLink="/course-timeline" 
                 routerLinkActive="bg-indigo-50 text-indigo-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Course Timeline</div>
                  <div class="text-xs text-gray-500">Browse content chronologically</div>
                </div>
              </a>
            </div>

            <!-- Administration Section -->
            <div *ngIf="isAdmin()" class="space-y-2">
              <div class="px-3 py-2">
                <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Administration</h3>
              </div>
              <a routerLink="/admin" 
                 routerLinkActive="bg-red-50 text-red-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Admin Panel</div>
                  <div class="text-xs text-gray-500">Manage registrations</div>
                </div>
              </a>
              
              <a routerLink="/admin/class-rep-management" 
                 routerLinkActive="bg-purple-50 text-purple-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Class Representatives</div>
                  <div class="text-xs text-gray-500">Manage class reps</div>
                </div>
              </a>
              
              <a routerLink="/admin/course-management" 
                 routerLinkActive="bg-indigo-50 text-indigo-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Course Management</div>
                  <div class="text-xs text-gray-500">Upload recordings & materials</div>
                </div>
              </a>
              
              <a routerLink="/content-manager" 
                 routerLinkActive="bg-emerald-50 text-emerald-700" 
                 (click)="toggleSidebar()"
                 class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200">
                <div class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium">Content Manager</div>
                  <div class="text-xs text-gray-500">Add course content & timeline</div>
                </div>
              </a>
            </div>
          </nav>
        </div>
        
        <!-- User Profile Section -->
        <div class="flex-shrink-0 border-t border-gray-200 p-4">
          <div class="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
            <div class="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
              <span class="text-white font-semibold text-sm">{{ getInitials() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">{{ currentUser?.full_name }}</p>
              <p class="text-xs text-gray-500 truncate">{{ currentUser?.email }}</p>
            </div>
            <button (click)="logout()" 
                    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SidebarComponent {
  @Input() isSidebarOpen = false;
  currentUser: User | null = null;

  constructor(public authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    // Refresh user data only if we don't have class rep role information
    const user = this.authService.getCurrentUser();
    if (user && user.user_type === 'student' && !user.class_rep_role) {
      console.log('Refreshing user data to get class rep role information');
      this.authService.refreshUserData().subscribe({
        next: (refreshedUser) => {
          console.log('User data refreshed in sidebar:', refreshedUser);
        },
        error: (error) => {
          console.error('Error refreshing user data in sidebar:', error);
        }
      });
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.is_admin === true;
  }

  isClassRep(): boolean {
    const user = this.authService.getCurrentUser();
    console.log('Checking if user is class rep:', {
      user: user,
      user_type: user?.user_type,
      class_rep_role: user?.class_rep_role,
      is_active: user?.class_rep_role?.is_active
    });
    
    return user?.user_type === 'student' && user?.class_rep_role?.is_active === true;
  }

  getInitials(): string {
    if (!this.currentUser) return 'U';
    const names = this.currentUser.full_name?.split(' ') || [];
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0]?.[0]?.toUpperCase() || 'U';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Logout successful, redirect to home page
        console.log('Logout successful, redirecting...');
        window.location.href = '/';
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails on server, clear local data and redirect
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        // Force reload to clear any cached state
        window.location.href = '/';
      }
    });
  }
}