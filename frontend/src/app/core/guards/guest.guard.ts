import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // If the user is already logged in, redirect them to the main page.
    router.navigate(['/chat']); 
    // Block access to the login/register page.
    return false; 
  }

  // If the user is not logged in (a "guest"), allow access.
  return true; 
};