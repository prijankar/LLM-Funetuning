import { Component, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './mainlayout.html',
  styleUrls: ['./mainlayout.scss']
})
export class MainLayoutComponent {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;
  
  isSidebarCollapsed = false;
  isMobileView = false;
  private mobileQuery: MediaQueryList;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.mobileQuery = window.matchMedia('(max-width: 768px)');
    this.isMobileView = this.mobileQuery.matches;
    
    // Handle mobile view changes
    this.mobileQuery.addEventListener('change', (e) => {
      this.isMobileView = e.matches;
      // Auto-collapse in mobile view when screen size changes
      if (this.isMobileView) {
        this.isSidebarCollapsed = true;
      }
    });
  }

  toggleSidebar(): void {
    console.log('Toggling sidebar. Current state:', this.isSidebarCollapsed);
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    console.log('New state:', this.isSidebarCollapsed);
    // Force change detection
    setTimeout(() => {
      console.log('After change detection:', this.isSidebarCollapsed);
    });
  }

  // Close sidebar when clicking outside in mobile view
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const sidebar = document.querySelector('.sidebar-container');
    const menuButton = document.querySelector('.menu-button');
    
    if (this.isMobileView && 
        !this.isSidebarCollapsed && 
        !sidebar?.contains(target) && 
        !menuButton?.contains(target)) {
      this.isSidebarCollapsed = true;
    }
  }
}