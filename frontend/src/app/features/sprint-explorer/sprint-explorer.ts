import { Component, OnInit, OnDestroy, ViewChild, Renderer2, RendererFactory2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgGridAngular, AgGridModule } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, GridApi, ModuleRegistry, GridOptions } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

import { ApiService, SprintView, SyncedProject } from '../../core/services/api.service';

// Register AG Grid modules if needed
// ModuleRegistry.registerModules([...]);

interface GridIssue {
  key: string;
  summary: string;
  type: string;
  status: string;
  epicName: string;
}

@Component({
  selector: 'app-sprint-explorer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    AgGridModule
  ],
  templateUrl: './sprint-explorer.html',
  styleUrls: ['./sprint-explorer.scss']
})
export class SprintExplorerComponent implements OnInit, OnDestroy {
  // Component state
  public isLoading = false;
  public errorMessage: string | null = null;
  
  // Data
  public projects: SyncedProject[] = [];
  public selectedProjectId: number | null = null;
  public sprints: string[] = [];
  public selectedSprintName: string | null = null;
  public rowData: GridIssue[] = [];

  // Grid API and configuration
  private gridApi: GridApi | null = null;
  private renderer: Renderer2;
  private destroy$ = new Subject<void>();

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  public columnDefs: ColDef[] = [
    { 
      headerName: 'Key', 
      field: 'key',
      width: 120,
      cellRenderer: (params: any) => {
        const link = this.renderer.createElement('a');
        link.href = '#';
        link.textContent = params.value;
        this.renderer.listen(link, 'click', (event: Event) => {
          event.preventDefault();
          this.navigateToIssue(params.value);
        });
        return link;
      }
    },
    { headerName: 'Summary', field: 'summary', flex: 2 },
    { headerName: 'Type', field: 'type', width: 120 },
    { 
      headerName: 'Status', 
      field: 'status',
      width: 140,
      cellClassRules: {
        'status-in-progress': (params: any) => params.value === 'In Progress',
        'status-done': (params: any) => params.value === 'Done',
        'status-todo': (params: any) => params.value === 'To Do'
      }
    },
    { headerName: 'Epic', field: 'epicName', flex: 1.5 }
  ];

  public gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      floatingFilter: true
    },
    suppressMenuHide: true,
    domLayout: 'normal',
    suppressCellFocus: true,
    suppressRowClickSelection: true,
    rowSelection: 'multiple',
    onGridReady: (params: GridReadyEvent) => this.onGridReady(params)
  };

  constructor(
    private apiService: ApiService,
    private rendererFactory: RendererFactory2,
    private router: Router
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // TrackBy functions for better performance
  trackProjectById(index: number, project: SyncedProject): number {
    return project.id;
  }

  trackSprintById(index: number, sprint: string): string {
    return sprint;
  }

  loadProjects(): void {
    this.isLoading = true;
    this.apiService.getSyncedProjects()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (projects) => {
          this.projects = projects || [];
        },
        error: (error) => {
          console.error('Error loading projects:', error);
          this.errorMessage = 'Failed to load projects. Please try again later.';
        }
      });
  }

  onProjectChange(event: MatSelectChange): void {
    this.selectedProjectId = event.value;
    this.selectedSprintName = null;
    this.rowData = [];
    
    if (this.selectedProjectId) {
      this.loadSprints(this.selectedProjectId);
    }
  }

  loadSprints(projectId: number): void {
    this.isLoading = true;
    this.apiService.getSprints(projectId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (sprints) => {
          this.sprints = sprints || [];
        },
        error: (error) => {
          console.error('Error loading sprints:', error);
          this.errorMessage = 'Failed to load sprints. Please try again later.';
        }
      });
  }

  onSprintChange(event: MatSelectChange): void {
    this.selectedSprintName = event.value;
    if (this.selectedProjectId && this.selectedSprintName) {
      this.loadSprintData();
    }
  }

  loadSprintData(): void {
    if (!this.selectedProjectId || !this.selectedSprintName) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.rowData = [];
    
    this.apiService.getSprintView(this.selectedProjectId, this.selectedSprintName)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (sprintView: SprintView) => {
          this.processSprintData(sprintView);
        },
        error: (error) => {
          console.error('Error loading sprint data:', error);
          this.errorMessage = 'Failed to load sprint data. Please try again later.';
        }
      });
  }

  private processSprintData(sprintView: SprintView): void {
    console.log('Processing sprint data:', sprintView);
    
    if (!sprintView) {
      console.error('No sprint view data received');
      this.errorMessage = 'No data available for this sprint.';
      this.rowData = [];
      return;
    }

    const formattedData: GridIssue[] = [];
    let issueCount = 0;

    try {
      // Process epics and their issues
      if (sprintView.epics?.length) {
        console.log(`Processing ${sprintView.epics.length} epics`);
        
        sprintView.epics.forEach((epic, epicIndex) => {
          if (epic.issues?.length) {
            console.log(`Epic ${epicIndex + 1}: ${epic.epicKey} - ${epic.epicName} (${epic.issues.length} issues)`);
            
            epic.issues.forEach(issue => {
              if (issue && issue.key) {  // Basic validation
                formattedData.push({
                  key: issue.key,
                  summary: issue.summary || 'No summary',
                  type: issue.type || 'Unknown',
                  status: issue.status || 'Unknown',
                  epicName: epic.epicKey ? `${epic.epicKey}: ${epic.epicName || 'Unnamed Epic'}` : 'No Epic'
                });
                issueCount++;
              } else {
                console.warn('Skipping invalid issue in epic:', issue);
              }
            });
          } else {
            console.log(`Epic ${epicIndex + 1} has no issues`);
          }
        });
      } else {
        console.log('No epics found in sprint data');
      }

      // Process issues without epics
      if (sprintView.issuesWithoutEpic?.length) {
        console.log(`Processing ${sprintView.issuesWithoutEpic.length} issues without epics`);
        
        sprintView.issuesWithoutEpic.forEach(issue => {
          if (issue && issue.key) {  // Basic validation
            formattedData.push({
              key: issue.key,
              summary: issue.summary || 'No summary',
              type: issue.type || 'Unknown',
              status: issue.status || 'Unknown',
              epicName: 'No Epic'
            });
            issueCount++;
          } else {
            console.warn('Skipping invalid issue without epic:', issue);
          }
        });
      } else {
        console.log('No issues without epics found');
      }

      console.log(`Processed ${issueCount} issues in total`);
      this.rowData = formattedData;
      
      // Auto-size columns after data is loaded
      if (this.gridApi) {
        setTimeout(() => {
          this.gridApi?.sizeColumnsToFit();
        }, 100);
      }
      
    } catch (error) {
      console.error('Error processing sprint data:', error);
      this.errorMessage = 'Error processing sprint data. Please check the console for details.';
      this.rowData = [];
    }
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    
    // Auto-size columns when grid is ready
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    });
  }

  navigateToIssue(issueKey: string): void {
    if (!issueKey) return;
    
    // Navigate to issue detail page or open in new tab
    const url = `https://your-jira-instance.atlassian.net/browse/${issueKey}`;
    window.open(url, '_blank');
  }
}