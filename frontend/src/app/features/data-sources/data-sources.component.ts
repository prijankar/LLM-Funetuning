import { Component, ChangeDetectorRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/components/results-dialog/api.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';

// Importeer alle benodigde Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
@Component({
  selector: 'app-data-sources',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatTableModule, MatCheckboxModule, MatSelectModule
  ],
  templateUrl: './data-sources.component.html',
  styleUrls: ['./data-sources.component.scss']
})
export class DataSourcesComponent {
  // Credentials
  jiraUrl: string = '';
  jiraEmail: string = '';
  jiraToken: string = '';

  // Properties voor de Dynamic Query Builder
  projectKey: string = 'HKBHER';
  availableStatuses: string[] = ['To Do', 'In Progress', 'Done'];
  selectedStatuses: string[] = ['Done'];
  availableFields: string[] = ['summary', 'description', 'status', 'issuetype', 'reporter', 'assignee', 'timespent', 'customfield_10035'];
  selectedFields: string[] = ['summary', 'status', 'timespent'];

  // Properties voor de state en de tabel
  issues: any[] = [];
  statusMessage: string = '';
  displayedColumns: string[] = [];
  selection = new SelectionModel<any>(true, []);

  constructor(
    @Inject(ApiService) private apiService: ApiService, 
    private cdr: ChangeDetectorRef, 
    private router: Router
  ) {}

  onFetchData(): void {
    this.statusMessage = 'Data ophalen...';
    this.issues = [];
    this.selection.clear();

    const queryRequest = {
      url: this.jiraUrl.trim(),
      email: this.jiraEmail.trim(),
      token: this.jiraToken.trim(),
      projectKey: this.projectKey.trim(),
      statuses: this.selectedStatuses,
      fieldsToReturn: this.selectedFields
    };

    this.apiService.fetchJiraDataDynamic(queryRequest).subscribe({
      next: (response: any) => {
        // VERWIJDERD: Geen JSON.parse() nodig
        this.issues = response.issues;
        if (this.issues && this.issues.length > 0) {
          this.displayedColumns = ['select', 'key', ...this.selectedFields];
          this.statusMessage = `${this.issues.length} issue(s) gevonden.`;
        } else {
          this.issues = [];
          this.statusMessage = 'Geen issues gevonden voor de opgegeven criteria.';
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.statusMessage = 'Fout bij het ophalen van data.';
        console.error(err);
      }
    });
  }
  
  // Functies voor de selectie-checkboxes
  isAllSelected() {
    return this.selection.selected.length === this.issues.length;
  }

  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.issues.forEach(row => this.selection.select(row));
  }
  
  prepareSelectedData(): void {
    const selectedKeys = this.selection.selected.map(issue => issue.key);
    this.statusMessage = `Bezig met voorbereiden van ${selectedKeys.length} issue(s)...`;
    
    const request = {
        url: this.jiraUrl.trim(),
        email: this.jiraEmail.trim(),
        token: this.jiraToken.trim(),
        selectedKeys: selectedKeys,
        fieldsToReturn: this.selectedFields
    };

    this.apiService.prepareDataForTraining(request).subscribe({
        next: (response: { message: string }) => {
            this.statusMessage = response.message;
        },
        error: (err: any) => {
            this.statusMessage = 'Fout bij voorbereiden van data.';
            console.error(err);
        }
    });
  }
}