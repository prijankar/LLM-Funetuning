import { Component, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  isLoggedIn = false;
  username: string | null = null;
  // We hebben maar één subscription nodig
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // CORRECTIE: Gebruik alleen de user$ observable.
    // Deze ene stream vertelt ons of iemand is ingelogd ÉN wie het is.
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user; // '!!user' maakt true als user bestaat, anders false
      this.username = user?.username || null;
    });
  }

  toggleMenu(): void {
    this.toggleSidebar.emit();
  }

  onLogout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}