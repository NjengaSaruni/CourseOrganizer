import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/register/register.component').then(m => m.RegisterComponent) },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
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
    path: 'admin', 
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
