import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-lg border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <a routerLink="/dashboard" class="flex-shrink-0 flex items-center space-x-3">
              <img src="/courseorganizerlogo.png" 
                   alt="Course Organizer Logo" 
                   class="h-10 w-auto">
              <h1 class="text-xl font-bold text-primary-600">Course Organizer</h1>
            </a>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <a routerLink="/dashboard" 
                   routerLinkActive="text-primary-600 border-b-2 border-primary-600" 
                   class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                  Dashboard
                </a>
                <a routerLink="/timetable" 
                   routerLinkActive="text-primary-600 border-b-2 border-primary-600" 
                   class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                  Timetable
                </a>
                <a routerLink="/materials" 
                   routerLinkActive="text-primary-600 border-b-2 border-primary-600" 
                   class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                  Materials
                </a>
                <a routerLink="/recordings" 
                   routerLinkActive="text-primary-600 border-b-2 border-primary-600" 
                   class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                  Recordings
                </a>
                <a routerLink="/meetings" 
                   routerLinkActive="text-primary-600 border-b-2 border-primary-600" 
                   class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                  Meetings
                </a>
                <a *ngIf="currentUser?.is_admin" routerLink="/admin" 
                   routerLinkActive="text-primary-600 border-b-2 border-primary-600" 
                   class="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                  Admin
                </a>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <span class="text-sm text-navy-500">{{ currentUser?.full_name }}</span>
              <button (click)="logout()" 
                      class="bg-accent-500 hover:bg-accent-600 text-white px-3 py-1 rounded text-sm transition-colors">
                Logout
              </button>
            </div>
            
            <!-- Mobile menu button -->
            <button (click)="toggleMobileMenu()" 
                    class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile menu -->
      <div *ngIf="isMobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
          <a routerLink="/dashboard" 
             routerLinkActive="text-primary-600 bg-primary-50" 
             class="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium">
            Dashboard
          </a>
          <a routerLink="/timetable" 
             routerLinkActive="text-primary-600 bg-primary-50" 
             class="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium">
            Timetable
          </a>
          <a routerLink="/materials" 
             routerLinkActive="text-primary-600 bg-primary-50" 
             class="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium">
            Materials
          </a>
          <a routerLink="/recordings" 
             routerLinkActive="text-primary-600 bg-primary-50" 
             class="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium">
            Recordings
          </a>
          <a routerLink="/meetings" 
             routerLinkActive="text-primary-600 bg-primary-50" 
             class="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium">
            Meetings
          </a>
          <a *ngIf="currentUser?.is_admin" routerLink="/admin" 
             routerLinkActive="text-primary-600 bg-primary-50" 
             class="text-gray-700 hover:text-primary-600 block px-3 py-2 text-base font-medium">
            Admin
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isMobileMenuOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
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

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}