import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService, RegistrationData } from '@course-organizer/shared';

// Custom validator for registration number format
function registrationNumberValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  
  // Format: GPR3/XXXXXX/2025 or similar
  const pattern = /^[A-Z]{1,4}\d{0,2}\/\d{1,6}\/\d{4}$/;
  if (!pattern.test(value)) {
    return { invalidFormat: true };
  }
  return null;
}

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
  standalone: false,
})
export class RegistrationPage implements OnInit {
  registrationForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    this.registrationForm = this.formBuilder.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      registration_number: ['', [Validators.required, registrationNumberValidator]],
      phone_number: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirm_password');
    
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value 
      ? null 
      : { passwordMismatch: true };
  }

  async ngOnInit() {
    // Check if already authenticated
    const isAuth = await this.authService.isAuthenticated();
    if (isAuth) {
      this.router.navigate(['/tabs'], { replaceUrl: true });
    }
  }

  async register() {
    if (this.registrationForm.invalid) {
      this.showToast('Please fill in all fields correctly', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Registering...',
      spinner: 'crescent'
    });
    await loading.present();

    const formData = this.registrationForm.value;
    const registrationData: RegistrationData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      registration_number: formData.registration_number,
      phone_number: formData.phone_number,
      password: formData.password,
      confirm_password: formData.confirm_password
    };

    this.authService.register(registrationData).subscribe({
      next: async (response: any) => {
        await loading.dismiss();
        this.showToast('Registration successful! Please wait for admin approval.', 'success');
        // Navigate to login after a delay
        setTimeout(() => {
          this.router.navigate(['/login'], { replaceUrl: true });
        }, 2000);
      },
      error: async (error: any) => {
        await loading.dismiss();
        const message = error?.error?.message || error?.error?.detail || 'Registration failed. Please try again.';
        this.showToast(message, 'danger');
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
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

