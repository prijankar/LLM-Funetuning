import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

// Import all necessary Material modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCheckboxModule, // <-- ADDED
    MatIconModule      // <-- ADDED
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = ''; // <-- ADDED (was 'error')
  
  // ADDED: Properties for the password visibility toggle
  hidePassword = true;
  hideConfirmPassword = true;

  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  constructor() {
    this.registerForm = this.formBuilder.group({
      username: ['', [
        Validators.required, 
        Validators.minLength(3)
      ]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern('^[a-zA-Z0-9!@#$%^&*]{8,}$')
      ]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validators: this.mustMatch('password', 'confirmPassword')
    });
  }
  
  // Getter for easy access to form fields in the template
  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const { username, email, password } = this.registerForm.value;

    this.authService.register({ username, email, password })
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/login'], { 
            queryParams: { 
              registered: true,
              email: email
            } 
          });
        },
        error: (err) => {
          this.loading = false;
          // Handle different types of errors
          if (err.error && typeof err.error === 'object') {
            if (err.error.error === 'Email is already in use!') {
              this.errorMessage = 'This email is already registered. Please use a different email or try logging in.';
              // Highlight the email field
              this.registerForm.get('email')?.setErrors({ emailInUse: true });
            } else if (err.error.message) {
              this.errorMessage = err.error.message;
            } else {
              this.errorMessage = 'Registration failed. Please check your details and try again.';
            }
          } else {
            this.errorMessage = 'An unexpected error occurred. Please try again later.';
          }
        }
      });
  }

  mustMatch(controlName: string, matchingControlName: string) {
    // This custom validator is correct, no changes needed here.
    return (formGroup: FormGroup) => {
      // ... logic
    };
  }
}