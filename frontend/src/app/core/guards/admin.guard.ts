import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Gebruik de user$ observable om de huidige gebruiker te krijgen
  return authService.user$.pipe(
    map(user => {
      // Gebruik de hasRole() helper-functie. Dit is de juiste manier!
      if (authService.hasRole('ROLE_ADMIN')) {
        return true; // Toegang verleend
      }
      
      // Geen admin, stuur naar de standaard chat-pagina
      router.navigate(['/chat']);
      return false; // Toegang geweigerd
    })
  );
};