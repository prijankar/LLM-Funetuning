import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/mainlayout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Auth routes (login, register)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  // Parent route that contains all protected pages
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { 
        path: 'home',
        loadComponent: () => import('./features/home/home.component')
          .then(m => m.HomeComponent)
      },
      { 
        path: 'chat',
        loadComponent: () => import('./features/chat-interface/chat-interface.component')
          .then(m => m.ChatInterfaceComponent)
      },
      {
        path: 'data-sources',
        loadComponent: () => import('./features/data-sources/data-sources.component')
          .then(m => m.DataSourcesComponent)
      },
      {
        path: 'model-config',
        loadComponent: () => import('./features/model-config/model-config')
          .then(m => m.ModelConfigComponent)
      },

      // Fallback for protected routes
      { path: '**', redirectTo: 'home' }
    ]
  },
  
  // Fallback for all other routes
  { path: '**', redirectTo: '' }
];