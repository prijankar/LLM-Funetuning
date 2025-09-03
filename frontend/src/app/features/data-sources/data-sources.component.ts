import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, DataSource } from '../../core/services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { AddSourceDialogComponent } from '../add-source-dialog/add-source-dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-data-sources',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule,
    MatProgressSpinnerModule, 
    MatTooltipModule, 
    MatSnackBarModule, 
    MatChipsModule
  ],
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss']
})
export class DataSourcesComponent implements OnInit {
  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  dataSources: DataSource[] = [];
  displayedColumns: string[] = ['name', 'type', 'projectKey', 'url', 'status', 'actions'];

  ngOnInit(): void {
    this.loadDataSources();
  }

  loadDataSources(): void {
    this.isLoading = true;
    this.apiService.getAllDataSources().subscribe({
      next: (data) => {
        this.dataSources = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching data sources:', err);
        this.isLoading = false;
      }
    });
  }

  testConnection(source: DataSource): void {
    source.status = 'TESTING...'; // Immediate feedback
    this.apiService.testConnection(source.id).subscribe({
      next: () => {
        this.snackBar.open('Connection successful!', 'Close', { duration: 3000 });
        this.loadDataSources(); // Refresh to get the new 'CONNECTED' status
      },
      error: () => {
        this.snackBar.open('Connection failed.', 'Close', { duration: 5000 });
        this.loadDataSources(); // Refresh to get the new 'ERROR' status
      }
    });
  }
    getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'CONNECTED':
        return 'primary';
      case 'SYNCED':
        return 'accent';
      case 'ERROR':
      case 'NOT_CONNECTED':
        return 'warn';
      default:
        return 'accent';
    }
  }

  addDataSource(): void {
    const dialogRef = this.dialog.open(AddSourceDialogComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDataSources();
      }
    });
  }

  syncDataSource(source: DataSource): void {
    source.status = 'SYNCING...'; // Provide immediate visual feedback
    this.apiService.syncDataSource(source.id).subscribe({
      next: (response) => {
        this.snackBar.open(response.message || 'Sync successful!', 'Close', { duration: 3000 });
        this.loadDataSources(); // Refresh the table to show the new 'SYNCED' status
      },
      error: (err) => {
        this.snackBar.open('Sync failed. Check console for details.', 'Close', { duration: 5000 });
        source.status = 'ERROR'; // Revert status on error
      }
    });
  }

  deleteDataSource(source: DataSource): void {
    if (confirm(`Are you sure you want to delete "${source.name}"?`)) {
      this.apiService.deleteDataSource(source.id).subscribe({
        next: () => {
          this.snackBar.open(`"${source.name}" was deleted.`, 'Close', { duration: 3000 });
          this.loadDataSources(); // Refresh the table
        },
        error: (err) => {
          this.snackBar.open('Failed to delete data source.', 'Close', { duration: 5000 });
          console.error('Error deleting data source:', err);
        }
      });
    }
  }

  editDataSource(source: DataSource): void {
    const dialogRef = this.dialog.open(AddSourceDialogComponent, {
    width: '500px',
    disableClose: true,
    data: source // <-- This passes the existing data to the dialog
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.loadDataSources(); // Refresh the table after editing
    }
  });
}

}