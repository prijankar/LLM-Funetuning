import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
// Importeer Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { take } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  credentials = { username: '', password: '' };
  errorMessage: string = '';
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // If already logged in, redirect to returnUrl or default
    if (this.authService.isLoggedIn()) {
      this.navigateToReturnUrl();
    }
  }

  onLogin(): void {
    if (this.isLoading) return;
    
    this.errorMessage = '';
    this.isLoading = true;
    
    this.authService.login(this.credentials).pipe(take(1)).subscribe({
      next: (response) => {
        console.log('Login successful, user:', response);
        this.navigateToReturnUrl();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Inloggen mislukt. Controleer je gebruikersnaam en wachtwoord.';
        console.error('Login error:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private navigateToReturnUrl(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/data-sources';
    this.router.navigateByUrl(returnUrl).catch(() => {
      this.router.navigate(['/data-sources']);
    });
  }
}
