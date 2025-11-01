import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { AuthService, User } from '@course-organizer/shared';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {
  currentUser: User | null = null;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    // Refresh user data
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });

    // If not authenticated, redirect to login
    const isAuth = await this.authService.isAuthenticated();
    if (!isAuth) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  getInitials(): string {
    if (!this.currentUser) return '';
    const first = this.currentUser.first_name?.charAt(0) || '';
    const last = this.currentUser.last_name?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          handler: () => {
            this.authService.logout().subscribe({
              next: () => {
                this.router.navigate(['/login'], { replaceUrl: true });
              },
              error: () => {
                // Even if logout fails, redirect to login
                this.router.navigate(['/login'], { replaceUrl: true });
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }
}

