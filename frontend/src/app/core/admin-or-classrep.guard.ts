import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminOrClassRepGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();
    
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Allow access if user is admin or has upload content permission (class rep)
    if (user?.is_admin || user?.can_upload_content) {
      return true;
    }

    // Redirect to dashboard if user doesn't have permission
    this.router.navigate(['/dashboard']);
    return false;
  }
}

