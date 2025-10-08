import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PageLayoutComponent } from '../../shared/page-layout/page-layout.component';
import { AuthService } from '../../core/auth.service';

interface LoginStats {
  overview: {
    total_logins: number;
    successful_logins: number;
    failed_logins: number;
    active_sessions: number;
  };
  today: {
    total: number;
    successful: number;
    failed: number;
    unique_users: number;
  };
  week: {
    total: number;
    successful: number;
    unique_users: number;
  };
  month: {
    total: number;
  };
  most_active_users: Array<{
    user__id: number;
    user__email: string;
    user__first_name: string;
    user__last_name: string;
    user__user_type: string;
    login_count: number;
  }>;
  device_breakdown: Array<{
    device_type: string;
    count: number;
  }>;
  browser_breakdown: Array<{
    browser: string;
    count: number;
  }>;
  suspicious_ips: Array<{
    ip_address: string;
    attempt_count: number;
  }>;
  recent_logins: Array<{
    id: number;
    user: {
      id: number;
      email: string;
      name: string;
      user_type: string;
    };
    login_time: string;
    ip_address: string;
    device_type: string;
    browser: string;
    is_active: boolean;
  }>;
}

@Component({
  selector: 'app-login-tracking',
  standalone: true,
  imports: [CommonModule, PageLayoutComponent],
  template: `
    <app-page-layout 
      pageTitle="Login Tracking" 
      pageSubtitle="Monitor user authentication and security"
      [isSidebarOpen]="isSidebarOpen"
      (sidebarToggle)="onSidebarToggle($event)">
      
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Login Tracking Dashboard</h1>
            <p class="text-lg text-gray-600">Monitor user activity, track sessions, and analyze security patterns</p>
          </div>
          <button (click)="loadLoginStats()" 
                  class="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p class="mt-4 text-gray-600">Loading login statistics...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
        <div class="flex items-center space-x-3">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-red-800 font-medium">{{error}}</span>
        </div>
      </div>

      <!-- Stats Content -->
      <div *ngIf="stats && !loading">
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Logins -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900 mb-1">{{stats.overview.total_logins}}</p>
            <p class="text-sm text-gray-600">Total Logins</p>
            <p class="text-xs text-green-600 mt-2">{{stats.overview.successful_logins}} successful</p>
          </div>

          <!-- Active Sessions -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900 mb-1">{{stats.overview.active_sessions}}</p>
            <p class="text-sm text-gray-600">Active Sessions</p>
            <p class="text-xs text-gray-500 mt-2">Currently online</p>
          </div>

          <!-- Today's Logins -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900 mb-1">{{stats.today.total}}</p>
            <p class="text-sm text-gray-600">Today's Logins</p>
            <p class="text-xs text-gray-500 mt-2">{{stats.today.unique_users}} unique users</p>
          </div>

          <!-- Failed Attempts -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900 mb-1">{{stats.overview.failed_logins}}</p>
            <p class="text-sm text-gray-600">Failed Logins</p>
            <p class="text-xs text-red-600 mt-2">{{stats.today.failed}} today</p>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Device Breakdown -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
            <div class="space-y-3">
              <div *ngFor="let device of stats.device_breakdown" class="flex items-center justify-between">
                <div class="flex items-center space-x-3 flex-1">
                  <span class="text-2xl">{{getDeviceIcon(device.device_type)}}</span>
                  <span class="text-sm font-medium text-gray-700">{{device.device_type || 'Unknown'}}</span>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div class="bg-green-600 h-2 rounded-full" 
                         [style.width.%]="getPercentage(device.count, getTotalDevices())"></div>
                  </div>
                  <span class="text-sm font-semibold text-gray-900 w-12 text-right">{{device.count}}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Weekly Summary -->
          <div class="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Weekly Summary</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span class="text-sm font-medium text-gray-700">Total Logins</span>
                <span class="text-2xl font-bold text-gray-900">{{stats.week.total}}</span>
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span class="text-sm font-medium text-gray-700">Successful</span>
                <span class="text-2xl font-bold text-green-600">{{stats.week.successful}}</span>
              </div>
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span class="text-sm font-medium text-gray-700">Unique Users</span>
                <span class="text-2xl font-bold text-purple-600">{{stats.week.unique_users}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Most Active Users -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Most Active Users (Last 7 Days)</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th class="text-right py-3 px-4 text-sm font-semibold text-gray-700">Login Count</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of stats.most_active_users" class="border-b border-gray-100">
                  <td class="py-3 px-4 text-sm text-gray-900">{{user.user__first_name}} {{user.user__last_name}}</td>
                  <td class="py-3 px-4 text-sm text-gray-600">{{user.user__email}}</td>
                  <td class="py-3 px-4">
                    <span class="inline-flex px-2 py-1 rounded-lg text-xs font-medium"
                          [ngClass]="{
                            'bg-blue-100 text-blue-800': user.user__user_type === 'student',
                            'bg-purple-100 text-purple-800': user.user__user_type === 'teacher',
                            'bg-gray-100 text-gray-800': user.user__user_type === 'admin'
                          }">
                      {{user.user__user_type}}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right text-sm font-semibold text-gray-900">{{user.login_count}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Suspicious IPs -->
        <div *ngIf="stats.suspicious_ips.length > 0" class="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
          <div class="flex items-center space-x-2 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 class="text-lg font-semibold text-red-900">Suspicious Activity Detected</h3>
          </div>
          <p class="text-sm text-red-800 mb-4">Multiple failed login attempts from the following IP addresses:</p>
          <div class="space-y-2">
            <div *ngFor="let ip of stats.suspicious_ips" class="flex items-center justify-between p-3 bg-white rounded-xl">
              <span class="text-sm font-mono text-gray-900">{{ip.ip_address}}</span>
              <span class="text-sm font-semibold text-red-600">{{ip.attempt_count}} failed attempts</span>
            </div>
          </div>
        </div>

        <!-- Recent Logins -->
        <div class="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Logins</h3>
          <div class="space-y-3">
            <div *ngFor="let login of stats.recent_logins" 
                 class="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                     [ngClass]="{
                       'bg-green-100': login.is_active,
                       'bg-gray-100': !login.is_active
                     }">
                  <svg class="w-5 h-5" 
                       [ngClass]="{
                         'text-green-600': login.is_active,
                         'text-gray-600': !login.is_active
                       }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{login.user.name}}</p>
                  <p class="text-xs text-gray-600">{{login.user.email}}</p>
                </div>
              </div>
              <div class="flex items-center space-x-6 text-sm text-gray-600">
                <div class="flex items-center space-x-2">
                  <span>{{getDeviceIcon(login.device_type)}}</span>
                  <span>{{login.device_type}}</span>
                </div>
                <div class="text-xs">
                  {{formatDate(login.login_time)}}
                </div>
                <div *ngIf="login.is_active" class="flex items-center space-x-1 text-green-600">
                  <div class="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span class="text-xs font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-page-layout>
  `,
  styles: []
})
export class LoginTrackingComponent implements OnInit {
  stats: LoginStats | null = null;
  loading = false;
  error: string | null = null;
  isSidebarOpen = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLoginStats();
  }

  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
  }

  loadLoginStats(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`
    });

    this.http.get<LoginStats>('/api/directory/auth/login-stats/', { headers })
      .subscribe({
        next: (data) => {
          this.stats = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading login stats:', error);
          this.error = 'Failed to load login statistics. Please try again.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  getDeviceIcon(deviceType: string): string {
    const type = (deviceType || '').toLowerCase();
    if (type.includes('mobile')) return '📱';
    if (type.includes('tablet')) return '📲';
    if (type.includes('desktop')) return '💻';
    return '🖥️';
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }

  getTotalDevices(): number {
    if (!this.stats) return 0;
    return this.stats.device_breakdown.reduce((sum, device) => sum + device.count, 0);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
}

