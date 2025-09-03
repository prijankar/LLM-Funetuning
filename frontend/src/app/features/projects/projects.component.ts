import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <-- ADD for [routerLink]
import { ApiService, DataSource } from '../../core/services/api.service';

// ADD for Angular Material components
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-projects',
  standalone: true,
  // ADD all required modules here
  imports: [
    CommonModule,               // For *ngFor
    RouterModule,               // For [routerLink]
    MatCardModule,              // For <mat-card>
    MatProgressSpinnerModule    // For <mat-spinner>
  ],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  private apiService = inject(ApiService);
  
  isLoading = true;
  public projects: DataSource[] = [];

  ngOnInit(): void {
    this.apiService.getAllDataSources().subscribe(data => {
      this.projects = data.filter(ds => ds.status === 'SYNCED');
      this.isLoading = false;
    });
  }
}