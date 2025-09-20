import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService, User } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- Sidebar -->
      <app-sidebar [isSidebarOpen]="isSidebarOpen"></app-sidebar>

      <!-- Main content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top header -->
        <div class="bg-white shadow-sm border-b border-gray-200">
          <div class="px-4 sm:px-6 lg:px-8">
            <div class="py-6 flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-navy-500">{{ pageTitle }}</h1>
                <p class="mt-1 text-sm text-gray-600">{{ pageSubtitle }}</p>
              </div>
              
              <div class="flex items-center space-x-4">
                <!-- Notifications -->
                <div class="relative">
                  <button class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative" aria-label="Notifications">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <!-- <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.5 19.5L9 15H4l5 4.5z" /> -->
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9a6 6 0 10-12 0v.75a8.967 8.967 0 01-2.312 6.022c1.744.68 3.56 1.155 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    <!-- Notification badge -->
                    <span *ngIf="unreadCount > 0" 
                          class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 min-w-[1.25rem] h-5 text-[10px] font-semibold leading-none text-white bg-red-600 rounded-full">
                      {{ unreadCount > 99 ? '99+' : unreadCount }}
                    </span>
                  </button>
                </div>
                
                <!-- User Profile Dropdown -->
                <div class="relative" #profileDropdown>
                  <button (click)="toggleProfileDropdown()" 
                          class="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200">
                    <div class="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                      <img *ngIf="currentUser?.profile_picture" 
                           [src]="getProfilePictureUrl(currentUser?.profile_picture)" 
                           [alt]="(currentUser?.full_name || 'User') + ' profile picture'"
                           class="w-full h-full object-cover">
                      <span *ngIf="!currentUser?.profile_picture" class="text-white font-semibold text-sm">{{ getInitials() }}</span>
                    </div>
                    <div class="hidden md:block text-left">
                      <p class="text-sm font-medium text-gray-900">{{ currentUser?.full_name }}</p>
                      <p class="text-xs text-gray-500">{{ currentUser?.email }}</p>
                    </div>
                    <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <!-- Dropdown Menu -->
                  <div *ngIf="isProfileDropdownOpen" 
                       class="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-50">
                    <div class="px-4 py-3 border-b border-gray-100">
                      <p class="text-sm font-semibold text-gray-900">{{ currentUser?.full_name }}</p>
                      <p class="text-sm text-gray-500">{{ currentUser?.email }}</p>
                      <p class="text-xs text-gray-400 mt-1">{{ currentUser?.registration_number }}</p>
                    </div>
                    
                    <div class="py-2">
                      <button (click)="openProfileSettings()" 
                              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile Settings
                      </button>
                      
                      <button (click)="openAccountSettings()" 
                              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Account Settings
                      </button>
                      
                      <button (click)="openNotifications()" 
                              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9a6 6 0 10-12 0v.75a8.967 8.967 0 01-2.312 6.022c1.744.68 3.56 1.155 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                        Notifications
                      </button>
                    </div>
                    
                    <div class="border-t border-gray-100 py-2">
                      <button (click)="logout()" 
                              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center">
                        <svg class="w-4 h-4 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Mobile menu button -->
                <button (click)="toggleSidebar()" 
                        class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Main content area -->
        <div class="flex-1 overflow-y-auto">
          <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ng-content></ng-content>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PageLayoutComponent implements OnInit {
  @ViewChild('profileDropdown') profileDropdown!: ElementRef;
  
  @Input() pageTitle = '';
  @Input() pageSubtitle = '';
  @Input() isSidebarOpen = false;
  @Input() unreadCount = 0;
  @Output() sidebarToggle = new EventEmitter<boolean>();

  currentUser: User | null = null;
  isProfileDropdownOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.sidebarToggle.emit(this.isSidebarOpen);
  }

  toggleProfileDropdown(): void {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  closeProfileDropdown(): void {
    this.isProfileDropdownOpen = false;
  }

  getInitials(): string {
    if (!this.currentUser?.full_name) return 'U';
    const names = this.currentUser.full_name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  getProfilePictureUrl(profilePicture: string | undefined): string {
    if (!profilePicture) return '';
    
    // If it's already a full URL, return as is
    if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
      return profilePicture;
    }
    
    // If it's a relative path starting with /media/, construct full URL
    if (profilePicture.startsWith('/media/')) {
      const backendUrl = environment.apiUrl.replace('/api', '');
      return `${backendUrl}${profilePicture}`;
    }
    
    // If it's just a filename or relative path, assume it's in media
    const backendUrl = environment.apiUrl.replace('/api', '');
    return `${backendUrl}/media/${profilePicture}`;
  }

  openProfileSettings(): void {
    this.closeProfileDropdown();
    this.router.navigate(['/profile-settings']);
  }

  openAccountSettings(): void {
    this.closeProfileDropdown();
    this.router.navigate(['/account-settings']);
  }

  openNotifications(): void {
    this.closeProfileDropdown();
    // TODO: Implement notifications modal/page
    console.log('Opening notifications...');
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.profileDropdown && !this.profileDropdown.nativeElement.contains(event.target)) {
      this.closeProfileDropdown();
    }
  }
}