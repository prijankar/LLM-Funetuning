import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  checkBackendHealth(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/health`, {
      withCredentials: true // stuur cookies mee
    });
  }

  fetchJiraDataDynamic(queryRequest: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/jira/fetch-dynamic`, queryRequest, {
      withCredentials: true // heel belangrijk!
    });
  }

  prepareDataForTraining(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/data/prepare`, request, {
      withCredentials: true
    });
  }

  startFineTuning(request: { modelId: string; epochs: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/finetune/start`, request, {
      withCredentials: true
    });
  }
}