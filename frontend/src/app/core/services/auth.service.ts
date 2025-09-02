import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// Interfaces die 1-op-1 overeenkomen met je backend DTO's
export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private router = inject(Router);
  private http = inject(HttpClient);

  // BehaviorSubject zendt de user-status uit naar de hele app
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public user$ = this.userSubject.asObservable();

  // Inloggen via de correcte backend endpoint
  login(credentials: { username: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.accessToken);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.userSubject.next(response.user);
      })
    );
  }

  // Registreren
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // Uitloggen
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.userSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // Helper-functies die de rest van de app gebruikt
  public getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }

  public hasRole(role: string): boolean {
    const user = this.userSubject.value;
    return user ? user.roles.includes(role) : false;
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }
}