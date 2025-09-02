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
}

export interface CreateDataSourceRequest {
  name: string;
  type: string;
  connectionDetails: string;
}

export interface FineTuneRequest {
  modelId: string;
  epochs: number;
  learningRate: number;
  batchSize: number;
  loraR: number;
  loraAlpha: number;
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
}