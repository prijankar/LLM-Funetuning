import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService, CreateTrainingSetRequest } from '../../core/services/api.service';

// AG Grid Imports
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, GridApi, SelectionChangedEvent, FirstDataRenderedEvent } from 'ag-grid-community';

// Material Imports
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    CommonModule, MatProgressSpinnerModule, AgGridModule,
    MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  templateUrl: './workspace.html',
  styleUrls: ['./workspace.scss']
})
export class WorkspaceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private gridApi!: GridApi;
  private snackBar = inject(MatSnackBar);
  selectedRows: any[] = [];
  
  isLoading = true;
  rowData: any[] = [];
  dataSourceId: number | null = null;

  // Define colDefs inside the constructor where 'this' is available
  colDefs: ColDef[];

  gridOptions: GridOptions = {
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    onSelectionChanged: this.onSelectionChanged.bind(this),
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      floatingFilter: true,
    },
    onFirstDataRendered: this.onFirstDataRendered.bind(this)
  };

  constructor() {
    // --- FIX #2: Initialize colDefs in the constructor ---
    this.colDefs = [
      { 
        headerName: 'Key', 
        field: 'key', 
        width: 150,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        cellRenderer: (params: any) => `<a href="https://qualogycaribbean.atlassian.net/browse/${params.value}" target="_blank">${params.value}</a>`
      },
      { headerName: 'Type', field: 'type', width: 120 },
      { headerName: 'Status', field: 'status', width: 130, cellStyle: this.statusCellStyle },
      { headerName: 'Summary', field: 'summary', flex: 1, minWidth: 200, autoHeight: true, cellStyle: { whiteSpace: 'normal', lineHeight: '1.4', padding: '8px 0' } },
      { headerName: 'Assignee', field: 'assignee', width: 150, valueFormatter: p => p.value?.displayName || 'Unassigned' },
      { headerName: 'Time Spent', field: 'timespent', width: 120, valueFormatter: this.formatTimeSpent },
      { headerName: 'Original Estimate', field: 'originalEstimate', width: 150, valueFormatter: this.formatTimeSpent },
    ];
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.dataSourceId = +idParam;
      this.fetchData(this.dataSourceId);
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  onFirstDataRendered(params: FirstDataRenderedEvent) {
    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }
  }

  fetchData(id: number): void {
    this.isLoading = true;
    this.apiService.getImportedData(id).subscribe({
      next: (data) => {
        this.rowData = data
          .map(item => {
            try {
              const parsed = JSON.parse(item.rawContent);
              return {
                id: item.id, // <-- FIX #1: Include the database ID
                key: parsed?.key || 'N/A',
                type: parsed?.fields?.issuetype?.name || 'Unknown',
                summary: parsed?.fields?.summary || 'No summary',
                status: parsed?.fields?.status?.name || 'No status',
                assignee: parsed?.fields?.assignee,
                timespent: parsed?.fields?.timespent,
                originalEstimate: parsed?.fields?.timeoriginalestimate
              };
            } catch (e) {
              return null;
            }
          })
          .filter(item => item !== null);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.isLoading = false;
      }
    });
  }

  onSelectionChanged(event: SelectionChangedEvent): void {
    this.selectedRows = event.api.getSelectedRows();
  }

  saveSelection(): void {
    const name = prompt("Please enter a name for this training set:", "Jira Training Set");
    if (name && this.dataSourceId) {
      const selectedIds = this.selectedRows.map(row => row.id);
      
      const request: CreateTrainingSetRequest = {
        name: name,
        dataSourceId: this.dataSourceId,
        importedDataIds: selectedIds
      };

      this.apiService.createTrainingSet(request).subscribe({
        next: () => {
          this.snackBar.open(`Training set '${name}' saved successfully!`, 'Close', { duration: 3000 });
          this.gridApi.deselectAll();
        },
        error: (err) => {
          this.snackBar.open('Error saving training set.', 'Close', { duration: 5000 });
          console.error(err);
        }
      });
    }
  }

  formatTimeSpent(params: any): string {
    if (!params.value) return '0m';
    const hours = Math.floor(params.value / 3600);
    const minutes = Math.floor((params.value % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  statusCellStyle(params: any): any {
    if (!params.value) return null;
    const status = params.value.toLowerCase();
    const baseStyle = { padding: '2px 8px', borderRadius: '3px', textAlign: 'center' };

    if (status === 'done') {
      return { ...baseStyle, color: '#006644', backgroundColor: '#e3fcef' };
    } else if (status.includes('progress')) {
      return { ...baseStyle, color: '#0747a6', backgroundColor: '#e3f0ff' };
    } else if (status === 'open' || status.includes('to do')) {
      return { ...baseStyle, color: '#42526e', backgroundColor: '#f4f5f7' };
    }
    return null;
  }
}