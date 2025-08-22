import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private authToken: string | null = null;

  constructor(private http: HttpClient) { }

  register(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, credentials, { responseType: 'text' });
  }

  login(credentials: any): Observable<any> {
    // 1. Maak de Basic Auth token
    const token = 'Basic ' + btoa(credentials.username + ':' + credentials.password);
    const headers = new HttpHeaders({ Authorization: token });
    
    // 2. Roep het /profile endpoint aan met de token
    return this.http.get(`${this.apiUrl}/profile`, { headers }).pipe(
      tap(() => {
        // 3. Sla de token op na een succesvolle login
        this.authToken = token;
      })
    );
  }

  // Nieuwe functie voor de interceptor
  getAuthToken(): string | null {
    return this.authToken;
  }

  logout(): void {
    this.authToken = null;
    // Hier zou je ook kunnen navigeren naar de login-pagina
  }

  isLoggedIn(): boolean {
    return !!this.authToken;
  }
}