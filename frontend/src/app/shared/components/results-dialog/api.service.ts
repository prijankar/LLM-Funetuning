import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface that matches your backend and form
export interface FineTuneRequest {
  modelId: string;
  epochs: number;
  learningRate: number;
  batchSize: number;
  loraR: number;
  loraAlpha: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8080/api';
  private http = inject(HttpClient);

  checkBackendHealth(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/health`);
  }

  fetchJiraDataDynamic(queryRequest: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/jira/fetch-dynamic`, queryRequest);
  }

  prepareDataForTraining(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/data/prepare`, request);
  }

  // CORRECTED: This now accepts the full request object
  startFineTuning(request: FineTuneRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/finetune/start`, request);
  }
}