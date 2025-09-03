import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() 
  set isCollapsed(value: boolean) {
    this._isCollapsed = value;
  }
  get isCollapsed(): boolean {
    return this._isCollapsed;
  }
  private _isCollapsed = false;
  
  @Input() isMobileView = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  
  isPinned = false;
  menuItems: MenuItem[] = [
    { label: 'Home', icon: 'home', path: '/home' },
    { label: 'Data Bronnen', icon: 'storage', path: '/data-sources' },
    { label: 'Projects', icon: 'assignment', path: '/projects' },
    { label: 'Model Configuratie', icon: 'tune', path: '/model-config' },
    { label: 'Chat Interface', icon: 'chat_bubble', path: '/chat' },
    
  ];

  constructor() {}

  togglePin(event: Event): void {
    event.stopPropagation();
    this.isPinned = !this.isPinned;
  }
}
