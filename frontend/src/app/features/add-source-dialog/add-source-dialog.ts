import { Component, OnInit, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService, CreateDataSourceRequest, DataSource } from '../../core/services/api.service';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Material Imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from "@app/shared/shared.module";

import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-add-source-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSelectModule,
    SharedModule, MatChipsModule  
],
  templateUrl: './add-source-dialog.html',
  styleUrls: ['./add-source-dialog.scss']
})
export class AddSourceDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  public dialogRef = inject(MatDialogRef<AddSourceDialogComponent>);

  dataSourceForm: FormGroup;
  isEditMode = false;
  isTesting = false;
  connectionStatus: 'UNTESTED' | 'SUCCESS' | 'FAILED' = 'UNTESTED';
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: DataSource) {
    this.isEditMode = !!this.data;

    this.dataSourceForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.f['type'].valueChanges.subscribe(type => {
      this.updateFormForType(type);
    });

    if (this.isEditMode) {
      this.dataSourceForm.patchValue({
        name: this.data.name,
        type: this.data.type,
      });

      if (this.data.type === 'JIRA') {
        const details = JSON.parse(this.data.connectionDetails);
        this.dataSourceForm.patchValue({
          jiraUrl: details.url,
          projectKey: details.projectKey, // Use correct 'projectKey'
          jiraEmail: details.email,
          jiraToken: details.token,
        });
      }
    }
  }
    onTestConnection(): void {
      if (!this.dataSourceForm.valid) return;

      this.isTesting = true;
      this.connectionStatus = 'UNTESTED';
      const formValue = this.dataSourceForm.value;
      const testRequest = {
          url: formValue.jiraUrl,
          email: formValue.jiraEmail,
          token: formValue.jiraToken,
          projectKey: formValue.projectKey
      };

      this.apiService.testJiraConnection(testRequest).subscribe({
          next: () => {
              this.connectionStatus = 'SUCCESS';
              this.isTesting = false;
          },
          error: () => {
              this.connectionStatus = 'FAILED';
              this.isTesting = false;
          }
      });
  }
  get f() { return this.dataSourceForm.controls; }

  updateFormForType(type: string | null): void {
    this.dataSourceForm.removeControl('jiraUrl');
    this.dataSourceForm.removeControl('jiraEmail');
    this.dataSourceForm.removeControl('jiraToken');
    this.dataSourceForm.removeControl('projectKey'); 

    if (type === 'JIRA') {
      this.dataSourceForm.addControl('jiraUrl', this.fb.control('', Validators.required));
      this.dataSourceForm.addControl('projectKey', this.fb.control('', Validators.required)); // This is correct
      this.dataSourceForm.addControl('jiraEmail', this.fb.control('', [Validators.required, Validators.email]));
      this.dataSourceForm.addControl('jiraToken', this.fb.control('', Validators.required));
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  onEdit(): void {
    // Enable all form fields for editing
    this.dataSourceForm.enable();
  }
  onSave(): void {
    if (this.dataSourceForm.invalid || this.connectionStatus !== 'SUCCESS') {
      return;
    }
    const formValue = this.dataSourceForm.value;
    let connectionDetails = {};

    if (formValue.type === 'JIRA') {
      connectionDetails = {
        url: formValue.jiraUrl,
        email: formValue.jiraEmail,
        token: formValue.jiraToken,
        projectKey: formValue.projectKey // CORRECTED: Was 'projectKeY'
      };
    }

    const request: CreateDataSourceRequest = {
      name: formValue.name,
      type: formValue.type,
      connectionDetails: JSON.stringify(connectionDetails)
    };

    
    if (this.isEditMode) {
      this.apiService.updateDataSource(this.data.id, request).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (err) => console.error('Failed to update data source', err)
      });
    } else {
      this.apiService.createDataSource(request).subscribe({
        next: (res) => this.dialogRef.close(res),
        error: (err) => console.error('Failed to create data source', err)
      });
    }
    
  }
}