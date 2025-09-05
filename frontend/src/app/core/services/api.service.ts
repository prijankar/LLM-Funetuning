import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- INTERFACES ---
export interface DataSource {
  id: number;
  name: string;
  type: string;
  connectionDetails: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  url?: string; 
  projectKey?: string; 
}

export interface CreateDataSourceRequest {
  name: string;
  type: string;
  connectionDetails: string;
}
export interface SyncedProject {
  id: number;
  name: string;
  type: string;
  status: string;
}
export interface FineTuneRequest {
  modelId: string;
  epochs: number;
  learningRate: number;
  batchSize: number;
  loraR: number;
  loraAlpha: number;
}
export interface JiraProjectMetadata {
  issueTypes: string[];
  statuses: string[];
}

// --- SERVICE CLASS ---
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8080/api';
  private http = inject(HttpClient);

  // --- DATA SOURCE METHODS ---
  getAllDataSources(): Observable<DataSource[]> {
    return this.http.get<DataSource[]>(`${this.apiUrl}/data-sources`);
  }

  createDataSource(request: CreateDataSourceRequest): Observable<DataSource> {
    return this.http.post<DataSource>(`${this.apiUrl}/data-sources`, request);
  }

  // --- OTHER METHODS ---
  prepareDataForTraining(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/data/prepare`, request);
  }

  startFineTuning(request: FineTuneRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/finetune/start`, request);
  }
    // ADDING  THIS METHOD FOR SYNCING
  syncDataSource(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/data-sources/${id}/sync`, {});
  }

  // ADDING THIS METHOD FOR DELETING
  deleteDataSource(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/data-sources/${id}`);
  }

  // ADDING THIS METHOD FOR UPDATING ...
  updateDataSource(id: number, request: CreateDataSourceRequest): Observable<DataSource> {
  return this.http.put<DataSource>(`${this.apiUrl}/data-sources/${id}`, request);
}

// ADDING THIS METHOD FOR GETTING SYNCED PROJECTS
getSyncedProjects(): Observable<DataSource[]> {
  return this.http.get<DataSource[]>(`${this.apiUrl}/data-sources/synced`);
}

// ADDING THIS METHOD FOR TESTING JIRA CONNECTION IN DIALOG
testJiraConnection(request: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/data-sources/test-connection`, request);
}

// ADDING THIS METHOD FOR GETTING IMPORTED DATA
getImportedData(id: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/workspace/imported-data/${id}`);
}

// ADDING THIS METHOD FOR GETTING IMPORTED DATA
queryJiraIssues(id: number, filters: any): Observable<any[]> {
  return this.http.post<any[]>(`${this.apiUrl}/workspace/query/${id}`, filters);  
}

// ADDING THIS METHOD FOR TESTING JIRA CONNECTION IN DATA-SOURCE
testConnection(id: number): Observable<any> {
  // You will need to create a corresponding backend endpoint for this
  return this.http.post(`${this.apiUrl}/data-sources/${id}/test-connection`, {});
}

// ADDING THIS METHOD FOR GETTING JIRA METADATA
getJiraMetadata(id: number): Observable<JiraProjectMetadata> {
  return this.http.get<JiraProjectMetadata>(`${this.apiUrl}/workspace/metadata/${id}`);
}



}