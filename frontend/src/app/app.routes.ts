import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { AdminGuard } from './core/admin.guard';
import { AdminOrClassRepGuard } from './core/admin-or-classrep.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'about', loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent) },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/register/register.component').then(m => m.RegisterComponent) },
  { path: 'privacy-policy', loadComponent: () => import('./features/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent) },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'study-groups',
    loadComponent: () => import('./features/study-groups/study-groups.component').then(m => m.StudyGroupsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'study-groups/:id',
    loadComponent: () => import('./features/study-groups/study-group-detail/study-group-detail.component').then(m => m.StudyGroupDetailComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'timetable', 
    loadComponent: () => import('./features/timetable/timetable.component').then(m => m.TimetableComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'learning-hub', 
    loadComponent: () => import('./features/learning-hub/learning-hub.component').then(m => m.LearningHubComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'materials',
    redirectTo: 'learning-hub?tab=materials',
    pathMatch: 'full'
  },
  { 
    path: 'recordings',
    redirectTo: 'learning-hub?tab=recordings',
    pathMatch: 'full'
  },
  { 
    path: 'meetings', 
    loadComponent: () => import('./features/meetings/meetings.component').then(m => m.MeetingsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'course/:id', 
    loadComponent: () => import('./features/course-detail/course-detail.component').then(m => m.CourseDetailComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'content-management', 
    loadComponent: () => import('./features/content-management-hub/content-management-hub.component').then(m => m.ContentManagementHubComponent),
    canActivate: [AdminOrClassRepGuard]
  },
  { 
    path: 'course-management',
    redirectTo: 'content-management?tab=materials',
    pathMatch: 'full'
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AdminGuard]
  },
  { 
    path: 'admin/course-management', 
    redirectTo: 'course-management',
    pathMatch: 'full'
  },
  { 
    path: 'admin/class-rep-management', 
    loadComponent: () => import('./features/class-rep-management/class-rep-management.component').then(m => m.ClassRepManagementComponent),
    canActivate: [AdminGuard]
  },
  { 
    path: 'admin/login-tracking', 
    loadComponent: () => import('./features/login-tracking/login-tracking.component').then(m => m.LoginTrackingComponent),
    canActivate: [AdminGuard]
  },
  { 
    path: 'profile-settings', 
    loadComponent: () => import('./features/profile-settings/profile-settings.component').then(m => m.ProfileSettingsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'account-settings', 
    loadComponent: () => import('./features/account-settings/account-settings.component').then(m => m.AccountSettingsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'announcements', 
    loadComponent: () => import('./features/announcements/announcements.component').then(m => m.AnnouncementsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'course-timeline',
    redirectTo: 'learning-hub?tab=timeline',
    pathMatch: 'full'
  },
  { 
    path: 'course-timeline/:id',
    redirectTo: 'learning-hub?tab=timeline',
    pathMatch: 'full'
  },
  { 
    path: 'content-manager',
    redirectTo: 'content-management',
    pathMatch: 'full'
  },
  { 
    path: 'course-materials', 
    redirectTo: 'learning-hub?tab=materials',
    pathMatch: 'full'
  },
  { 
    path: 'course-materials/:id', 
    redirectTo: 'learning-hub?tab=materials',
    pathMatch: 'full'
  },
  { 
    path: 'pdf', 
    loadComponent: () => import('./features/pdf-viewer/pdf-viewer.component').then(m => m.PdfViewerComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
