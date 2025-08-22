import { Routes, Router, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { MainLayoutComponent } from './layout/main-layout';
import { DataSourcesComponent } from './features/data-sources/data-sources';
import { ModelConfigComponent } from './features/model-config/model-config';
import { ChatInterfaceComponent } from './features/chat-interface/chat-interface';
import { AuthService } from './core/services/auth.service';

export const routes: Routes = [
  // Routes die geen menu hebben
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Routes die WEL het menu moeten hebben
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [() => {
      const authService = inject(AuthService);
      const router = inject(Router);
      
      if (authService.isLoggedIn()) {
        return true;
      }
      
      // Redirect to login if not authenticated
      return router.navigate(['/login']);
    }],
    children: [
      { path: '', redirectTo: 'data-sources', pathMatch: 'full' },
      { path: 'data-sources', component: DataSourcesComponent },
      { path: 'model-config', component: ModelConfigComponent },
      { path: 'chat-interface', component: ChatInterfaceComponent }
      // De /logout route is hier correct verwijderd
    ]
  },

  { path: '**', redirectTo: '/login' }
];
