import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, DataSource } from '../../core/services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { AddSourceDialogComponent } from '../add-source-dialog/add-source-dialog';

// Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-data-sources',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss']
})
export class DataSourcesComponent implements OnInit {
  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);

  isLoading = true;
  dataSources: DataSource[] = [];
  displayedColumns: string[] = ['name', 'type', 'status', 'actions'];

  ngOnInit(): void {
    this.loadDataSources();
  }

  loadDataSources(): void {
    this.isLoading = true;
    this.apiService.getAllDataSources().subscribe({
      next: (data: DataSource[]) => {
        this.dataSources = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching data sources:', err);
        this.isLoading = false;
      }
    });
  }

  addDataSource(): void {
    const dialogRef = this.dialog.open(AddSourceDialogComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      // If the dialog returned a result (the new data source),
      // we refresh the table to show the new entry.
      if (result) {
        this.loadDataSources();
      }
    });
  }
}