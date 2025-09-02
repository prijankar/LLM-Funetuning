import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'http://localhost:8080/api';
  private http = inject(HttpClient);

  fetchJiraDataDynamic(queryRequest: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/jira/fetch-dynamic`, queryRequest);
  }

  prepareDataForTraining(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/data/prepare`, request);
  }

  startFineTuning(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/finetune/start`, request);
  }
}