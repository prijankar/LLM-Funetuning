import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService, CreateDataSourceRequest } from '../../core/services/api.service';

// Material Dialog Imports
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-source-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSelectModule
  ],
  templateUrl: './add-source-dialog.html',
  styleUrls: ['./add-source-dialog.scss']
})
export class AddSourceDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  public dialogRef = inject(MatDialogRef<AddSourceDialogComponent>);

  dataSourceForm: FormGroup;

  constructor() {
    // The form starts with only the common fields
    this.dataSourceForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Listen for changes in the 'type' dropdown to add/remove fields
    this.dataSourceForm.get('type')?.valueChanges.subscribe(type => {
      this.updateFormForType(type);
    });
  }

  get f() { return this.dataSourceForm.controls; }

  updateFormForType(type: string | null): void {
    // Always remove old controls first
    this.dataSourceForm.removeControl('jiraUrl');
    this.dataSourceForm.removeControl('jiraEmail');
    this.dataSourceForm.removeControl('jiraToken');

    // If type is JIRA, add the specific controls
    if (type === 'JIRA') {
      this.dataSourceForm.addControl('jiraUrl', this.fb.control('', Validators.required));
      this.dataSourceForm.addControl('jiraEmail', this.fb.control('', [Validators.required, Validators.email]));
      this.dataSourceForm.addControl('jiraToken', this.fb.control('', Validators.required));
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.dataSourceForm.invalid) {
      return;
    }

    const formValue = this.dataSourceForm.value;
    let connectionDetails = {};

    // Build the connectionDetails JSON based on the type
    if (formValue.type === 'JIRA') {
      connectionDetails = {
        url: formValue.jiraUrl,
        email: formValue.jiraEmail,
        token: formValue.jiraToken
      };
    }

    const request: CreateDataSourceRequest = {
      name: formValue.name,
      type: formValue.type,
      // Convert the details object to a JSON string for the backend
      connectionDetails: JSON.stringify(connectionDetails)
    };

    this.apiService.createDataSource(request).subscribe({
      next: (newDataSource) => {
        this.dialogRef.close(newDataSource);
      },
      error: (err) => console.error('Failed to create data source', err)
    });
  }
}