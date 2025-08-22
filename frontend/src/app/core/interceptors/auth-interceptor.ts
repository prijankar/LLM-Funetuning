import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getAuthToken();

  // Als we een token hebben, voeg het toe aan de request
  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: authToken
      }
    });
    return next(authReq);
  }

  // Als we geen token hebben, stuur de originele request
  return next(req);
};
