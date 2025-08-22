import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  username: string;
  roles?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private authToken: string | null = null;
  private userSubject = new BehaviorSubject<User | null>(null);
  
  // Public observable for components to subscribe to
  public user$ = this.userSubject.asObservable();
  
  // For backward compatibility
  public get user(): User | null {
    return this.userSubject.value;
  }

  constructor(private http: HttpClient) {
    this.loadAuthState();
  }

  register(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, credentials);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        const token = 'Basic ' + btoa(credentials.username + ':' + credentials.password);
        const user = { username: response.username };
        this.setAuthState({ token, user });
      })
    );
  }

  getAuthToken(): string | null {
    return this.authToken || localStorage.getItem('authToken');
  }

  logout(): void {
    this.setAuthState(null);
  }

  private setAuthState(authData: { token: string; user: User } | null): void {
    if (authData) {
      this.authToken = authData.token;
      this.userSubject.next(authData.user);
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
    } else {
      this.authToken = null;
      this.userSubject.next(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  loadAuthState(): void {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      this.authToken = token;
      try {
        const user = JSON.parse(userStr);
        this.userSubject.next(user);
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        this.setAuthState(null);
      }
    } else {
      this.setAuthState(null);
    }
  }

  isLoggedIn(): boolean {
    return !!(this.authToken || localStorage.getItem('authToken'));
  }
}
