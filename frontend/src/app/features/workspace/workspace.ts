import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService, JiraProjectMetadata } from '../../core/services/api.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// AG Grid Imports
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, GridApi } from 'ag-grid-community';

// Material Imports
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
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
    { headerName: 'Type', field: 'type', checkboxSelection: true, headerCheckboxSelection: true },
    { headerName: 'Key', field: 'key', sortable: true },
    { headerName: 'Summary', field: 'summary', sortable: true, flex: 1 },
    { headerName: 'Status', field: 'status', sortable: true },
  ];

  gridOptions: GridOptions = {
    rowSelection: 'multiple',
    suppressRowClickSelection: true
  };

  filterForm: FormGroup;
  availableStatuses: string[] = [];
  availableIssueTypes: string[] = [];

  constructor() {
    this.filterForm = this.fb.group({
      status: [null],
      issueTypes: [[]]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const dataSourceId = +idParam;
      this.dataSourceId = dataSourceId;

      this.apiService.getJiraMetadata(dataSourceId).subscribe(metadata => {
        this.availableStatuses = metadata.statuses;
        this.availableIssueTypes = metadata.issueTypes;
        this.fetchData(dataSourceId);
      });

      this.filterForm.valueChanges.subscribe(filters => {
        this.applyFilters(filters);
      });
    }
  }

  onGridReady(params: GridReadyEvent) {
    console.log('AG Grid ready');
    this.gridApi = params.api;
    setTimeout(() => {
      if (this.gridApi) {
        this.gridApi.sizeColumnsToFit();
        console.log('Grid columns resized to fit');
      }
    });
  }

  fetchData(id: number): void {
    this.isLoading = true;
    console.log('Fetching data for source ID:', id);

    this.apiService.getImportedData(id).subscribe({
      next: (data) => {
        console.log('Raw API response:', data);

        // Flatten de data zodat AG Grid het direct kan gebruiken
        this.rowData = data.map(item => {
          const parsed = JSON.parse(item.rawContent);
          return {
            key: parsed.key,
            type: parsed.fields?.issuetype?.name || '',
            summary: parsed.fields?.summary || '',
            status: parsed.fields?.status?.name || ''
          };
        });

        console.log('Flattened rowData:', this.rowData);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(filters: any): void {
    if (!this.gridApi) return;

    const filterModel: any = {};

    if (filters.status) {
      filterModel['status'] = {
        type: 'equals',
        filter: filters.status
      };
    }

    if (filters.issueTypes && filters.issueTypes.length > 0) {
      filterModel['type'] = {
        operator: 'OR',
        conditions: filters.issueTypes.map((type: string) => ({
          type: 'equals',
          filter: type
        }))
      };
    }

    this.gridApi.setFilterModel(filterModel);
  }
}
