import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

interface LoginData {
  username?: string;
  email?: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  statusMessage = '';
  isError = false;
  submitted = false;
  private returnUrl = '/';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.statusMessage = '';
    this.isError = false;

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { usernameOrEmail, password } = this.loginForm.value;

    // Create the login payload
    const loginData: LoginData = {
      password: password
    };

    // Set either username or email based on input
    if (usernameOrEmail.includes('@')) {
      loginData.email = usernameOrEmail;
    } else {
      loginData.username = usernameOrEmail;
    }

    console.log('Login attempt with:', loginData);

    this.authService.login(loginData).subscribe({
      next: () => {
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (error) => {
        this.isLoading = false;
        this.isError = true;
        
        if (error.status === 401) {
          this.statusMessage = 'Invalid email/username or password. Please try again.';
        } else if (error.status === 0) {
          this.statusMessage = 'Unable to connect to the server. Please check your connection.';
        } else {
          this.statusMessage = error.error?.message || 'Login failed. Please try again later.';
        }
        
        console.error('Login error:', error);
      }
    });
  }
}