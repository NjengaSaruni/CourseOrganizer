import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '@course-organizer/shared';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async ngOnInit() {
    // Check if already authenticated
    const isAuth = await this.authService.isAuthenticated();
    if (isAuth) {
      this.router.navigate(['/tabs'], { replaceUrl: true });
    }
  }

  async login() {
    if (this.loginForm.invalid) {
      this.showToast('Please fill in all fields correctly', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Logging in...',
      spinner: 'crescent'
    });
    await loading.present();

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: async (success: boolean) => {
        await loading.dismiss();
        if (success) {
          this.showToast('Login successful!', 'success');
          this.router.navigate(['/tabs'], { replaceUrl: true });
        }
      },
      error: async (error: any) => {
        await loading.dismiss();
        const message = error?.error?.message || error?.error?.detail || 'Login failed. Please try again.';
        this.showToast(message, 'danger');
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/registration']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}

