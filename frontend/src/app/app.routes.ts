import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';
import { AdminGuard } from './core/admin.guard';

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
    path: 'materials', 
    loadComponent: () => import('./features/materials/materials.component').then(m => m.MaterialsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'recordings', 
    loadComponent: () => import('./features/recordings/recordings.component').then(m => m.RecordingsComponent),
    canActivate: [AuthGuard]
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
    path: 'admin', 
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AdminGuard]
  },
  { 
    path: 'admin/course-management', 
    loadComponent: () => import('./features/course-management/course-management.component').then(m => m.CourseManagementComponent),
    canActivate: [AdminGuard]
  },
  { 
    path: 'admin/class-rep-management', 
    loadComponent: () => import('./features/class-rep-management/class-rep-management.component').then(m => m.ClassRepManagementComponent),
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
    loadComponent: () => import('./features/course-timeline/course-timeline.component').then(m => m.CourseTimelineComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'course-timeline/:id', 
    loadComponent: () => import('./features/course-timeline/course-timeline.component').then(m => m.CourseTimelineComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'content-manager', 
    loadComponent: () => import('./features/course-content-manager/course-content-manager-new.component').then(m => m.CourseContentManagerNewComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'course-materials', 
    loadComponent: () => import('./features/course-materials/course-materials.component').then(m => m.CourseMaterialsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'course-materials/:id', 
    loadComponent: () => import('./features/course-materials/course-materials.component').then(m => m.CourseMaterialsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'pdf', 
    loadComponent: () => import('./features/pdf-viewer/pdf-viewer.component').then(m => m.PdfViewerComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
