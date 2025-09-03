import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

// Material Imports
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatProgressSpinnerModule, 
    MatCheckboxModule, MatFormFieldModule, MatSelectModule
  ],
  templateUrl: './workspace.html',
  styleUrls: ['./workspace.scss']
})
export class WorkspaceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);

  isLoading = true;
  dataSourceId: number | null = null;
  tableData: any[] = [];
  displayedColumns: string[] = ['select', 'key', 'summary'];

  filterForm: FormGroup;

  // We'll populate these from a metadata endpoint later
  availableStatuses = ['To Do', 'In Progress', 'Done'];
  availableIssueTypes = ['Bug', 'Story', 'Task'];

  constructor() {
    this.filterForm = this.fb.group({
      status: [null],
      issueTypes: [null]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.dataSourceId = +idParam;
      this.fetchData(); // Initial data fetch

      // When the form values change, re-fetch the data
      this.filterForm.valueChanges.pipe(
        debounceTime(500), // Wait for 500ms after the user stops typing
        distinctUntilChanged()
      ).subscribe(() => {
        this.fetchData();
      });
    }
  }

  fetchData(): void {
    if (!this.dataSourceId) return;

    this.isLoading = true;
    const filters = this.filterForm.value;
    
    this.apiService.queryJiraIssues(this.dataSourceId, filters).subscribe(data => {
      this.tableData = data;
      this.isLoading = false;
    });
  }
}