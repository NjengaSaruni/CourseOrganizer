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
    <div class="hidden md:flex md:w-64 md:flex-col">
      <div class="flex flex-col flex-grow pt-6 bg-white overflow-y-auto border-r border-gray-200">
        <div class="flex items-center flex-shrink-0 px-6 space-x-3">
          <img src="/courseorganizerlogo.png" 
               alt="Course Organizer Logo" 
               class="h-8 w-auto">
          <h2 class="text-lg font-semibold text-gray-900">Course Organizer</h2>
        </div>
        <div class="mt-8 flex-grow flex flex-col">
          <nav class="flex-1 px-4 pb-4 space-y-2">
            <a routerLink="/dashboard" 
               routerLinkActive="bg-gray-100 text-gray-900" 
               class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
              Dashboard
            </a>
            <a routerLink="/timetable" 
               routerLinkActive="bg-gray-100 text-gray-900" 
               class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Timetable
            </a>
            <a routerLink="/materials" 
               routerLinkActive="bg-gray-100 text-gray-900" 
               class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Materials
            </a>
            <a routerLink="/recordings" 
               routerLinkActive="bg-gray-100 text-gray-900" 
               class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Recordings
            </a>
            <a routerLink="/meetings" 
               routerLinkActive="bg-gray-100 text-gray-900" 
               class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Meetings
            </a>
            <a *ngIf="isAdmin()" routerLink="/admin" 
               routerLinkActive="bg-gray-100 text-gray-900" 
               class="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Panel
            </a>
          </nav>
        </div>
        
        <!-- User info and logout -->
        <div class="flex-shrink-0 flex border-t border-gray-200 p-6">
          <div class="flex items-center w-full">
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-900">{{ currentUser?.full_name }}</p>
              <p class="text-xs text-gray-600">{{ currentUser?.email }}</p>
            </div>
            <button (click)="logout()" 
                    class="ml-3 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              Logout
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
        <div class="flex-1 h-0 pt-6 pb-4 overflow-y-auto">
          <div class="flex-shrink-0 flex items-center px-6 space-x-3">
            <img src="/courseorganizerlogo.png" 
                 alt="Course Organizer Logo" 
                 class="h-8 w-auto">
            <h2 class="text-lg font-semibold text-gray-900">Course Organizer</h2>
          </div>
          <nav class="mt-8 px-4 space-y-2">
            <a routerLink="/dashboard" 
               routerLinkActive="bg-gray-100 text-gray-900" 
               (click)="toggleSidebar()"
               class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg class="mr-4 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
              Dashboard
            </a>
            <a routerLink="/timetable" 
               routerLinkActive="bg-gray-100 text-gray-900" 
               (click)="toggleSidebar()"
               class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg class="mr-4 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Timetable
            </a>
            <a routerLink="/materials" 
               routerLinkActive="bg-gray-100 text-gray-900" 
               (click)="toggleSidebar()"
               class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg class="mr-4 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Materials
            </a>
            <a routerLink="/recordings" 
               routerLinkActive="bg-gray-100 text-gray-900" 
               (click)="toggleSidebar()"
               class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg class="mr-4 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Recordings
            </a>
            <a routerLink="/meetings" 
               routerLinkActive="bg-gray-100 text-gray-900" 
               (click)="toggleSidebar()"
               class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg class="mr-4 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Meetings
            </a>
            <a *ngIf="isAdmin()" routerLink="/admin" 
               routerLinkActive="bg-gray-100 text-gray-900" 
               (click)="toggleSidebar()"
               class="group flex items-center px-3 py-3 text-base font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <svg class="mr-4 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Panel
            </a>
          </nav>
        </div>
        
        <!-- User info and logout for mobile -->
        <div class="flex-shrink-0 flex border-t border-gray-200 p-6">
          <div class="flex items-center w-full">
            <div class="flex-1">
              <p class="text-sm font-semibold text-gray-900">{{ currentUser?.full_name }}</p>
              <p class="text-xs text-gray-600">{{ currentUser?.email }}</p>
            </div>
            <button (click)="logout()" 
                    class="ml-3 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              Logout
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
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.is_admin === true;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Logout successful, user will be redirected by auth guard
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails on server, clear local data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        // Force reload to clear any cached state
        window.location.href = '/';
      }
    });
  }
}