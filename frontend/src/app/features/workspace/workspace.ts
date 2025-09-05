import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService, JiraProjectMetadata } from '../../core/services/api.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// AG Grid Imports

import { ColDef, GridOptions, GridReadyEvent, GridApi, FirstDataRenderedEvent } from 'ag-grid-community';

// Material Imports
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AgGridModule } from 'ag-grid-angular';


@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    AgGridModule
  ],
  templateUrl: './workspace.html',
  styleUrls: ['./workspace.scss']
})
export class WorkspaceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private gridApi!: GridApi;

  isLoading = true;
  rowData: any[] = [];

  dataSourceId: number | null = null;

  colDefs: ColDef[] = [
    { 
      headerName: 'Key', 
      field: 'key', 
      sortable: true, 
      filter: true,
      width: 150,
      cellRenderer: (params: any) => {
        return `<a href="https://qualogycaribbean.atlassian.net/browse/${params.value}" target="_blank">${params.value}</a>`;
      }
    },
    { 
      headerName: 'Type', 
      field: 'type', 
      sortable: true, 
      filter: true,
      width: 120
    },
    { 
      headerName: 'Status', 
      field: 'status', 
      sortable: true, 
      filter: true,
      width: 130,
      cellStyle: (params: any): any => {
        if (!params.value) return { color: 'inherit', backgroundColor: 'inherit' };
        const status = params.value.toLowerCase();
        
        if (status === 'done') {
          return { 
            color: '#006644',
            backgroundColor: '#e3fcef',
            fontWeight: 'bold',
            padding: '2px 8px',
            borderRadius: '3px',
            textAlign: 'center'
          };
        } else if (status.includes('progress')) {
          return {
            color: '#0747a6',
            backgroundColor: '#e3f0ff',
            fontWeight: 'bold',
            padding: '2px 8px',
            borderRadius: '3px',
            textAlign: 'center'
          };
        } else if (status === 'open' || status.includes('to do')) {
          return {
            color: '#42526e',
            backgroundColor: '#f4f5f7',
            fontWeight: 'bold',
            padding: '2px 8px',
            borderRadius: '3px',
            textAlign: 'center'
          };
        }
        
        return {
          color: '#000000',
          backgroundColor: '#f0f0f0',
          fontWeight: 'bold',
          padding: '2px 8px',
          borderRadius: '3px',
          textAlign: 'center'
        };
      }
    },
    { 
      headerName: 'Summary', 
      field: 'summary', 
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 200,
      cellStyle: { 
        whiteSpace: 'normal',
        lineHeight: '1.4',
        padding: '8px 0'
      },
      autoHeight: true
    },
    { 
      headerName: 'Assignee', 
      field: 'assignee', 
      sortable: true,
      filter: true,
      width: 150,
      valueFormatter: (params: any) => {
        return params.value?.displayName || 'Unassigned';
      }
    },
    { 
      headerName: 'Time Spent', 
      field: 'timespent', 
      sortable: true,
      width: 120,
      valueFormatter: (params: any) => {
        if (!params.value) return '0m';
        const hours = Math.floor(params.value / 3600);
        const minutes = Math.floor((params.value % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      },
      comparator: (valueA: number, valueB: number) => (valueA || 0) - (valueB || 0)
    }
  ];

  gridOptions: GridOptions = {
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    suppressCellFocus: true,
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      floatingFilter: true,
      menuTabs: ['filterMenuTab']
    },
    onFirstDataRendered: this.onFirstDataRendered.bind(this)
  };

  constructor() { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const dataSourceId = +idParam;
      this.dataSourceId = dataSourceId;
      this.fetchData(dataSourceId);
    }
  }

  onGridReady(params: GridReadyEvent) {
    console.log('AG Grid ready');
    this.gridApi = params.api;
    // We'll handle sizing after data is loaded
  }

  onFirstDataRendered(params: FirstDataRenderedEvent) {
    console.log('AG Grid first data rendered');
    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
      // Ensure the grid is properly sized after a small delay
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.resetRowHeights();
          this.gridApi.sizeColumnsToFit();
        }
      }, 100);
    }
  }

  fetchData(id: number): void {
    this.isLoading = true;
    console.log('Fetching data for source ID:', id);

    this.apiService.getImportedData(id).subscribe({
      next: (data) => {
        console.log('Raw API response length:', data?.length);
        
        try {
          // Flatten the data for AG Grid
          this.rowData = data.map(item => {
            try {
              const parsed = typeof item.rawContent === 'string' 
                ? JSON.parse(item.rawContent) 
                : item.rawContent;
              
              return {
                key: parsed?.key || 'N/A',
                type: parsed?.fields?.issuetype?.name || 'Unknown',
                summary: parsed?.fields?.summary || 'No summary',
                status: parsed?.fields?.status?.name || 'No status',
                assignee: parsed?.fields?.assignee,
                timespent: parsed?.fields?.timespent
              };
            } catch (parseError) {
              console.error('Error parsing item:', item, parseError);
              return null;
            }
          }).filter(item => item !== null); // Remove any null items from failed parses

          console.log('Processed rowData length:', this.rowData.length);
          if (this.rowData.length > 0) {
            console.log('First row sample:', JSON.stringify(this.rowData[0], null, 2));
          }
          
          // Force Angular change detection
          setTimeout(() => {
            this.rowData = [...this.rowData]; // This will trigger change detection
          });
        } catch (error) {
          console.error('Error processing data:', error);
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.rowData = [];
      },
      complete: () => {
        this.isLoading = false;
        console.log('Data loading completed. Loading state:', this.isLoading);
      }
    });
  }
}
