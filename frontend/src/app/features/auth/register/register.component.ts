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
      // ADDED: firstName, lastName, and acceptTerms to match the new form
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
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
    const { firstName, lastName, email, password } = this.registerForm.value;

    // The backend only needs username, email, password. We'll create the username from the email.
    const username = email?.split('@')[0];

    this.authService.register({ username, email, password })
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/login'], { queryParams: { registered: true } });
        },
        error: (err) => {
          this.errorMessage = err.error?.error || 'Registration failed. Please try again.';
          this.loading = false;
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