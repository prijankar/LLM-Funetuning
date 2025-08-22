import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  credentials = { username: '', password: '' };
  statusMessage: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.statusMessage = '';
    this.isError = false;
    
    this.authService.register(this.credentials).subscribe({
      next: (response: any) => {
        this.isError = false;
        this.statusMessage = 'Registratie succesvol! U wordt doorgestuurd naar de login-pagina...';
        // Wacht 2 seconden en navigeer dan naar de login-pagina
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: any) => {
        this.isError = true;
        this.isLoading = false;
        this.statusMessage = err.error?.message || 'Registratie mislukt. Gebruikersnaam is mogelijk al in gebruik.';
        console.error(err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}