import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // De URL wijst altijd naar je Spring Boot backend, nooit direct naar Ollama.
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  /**
   * Controleert de status van de Spring Boot backend.
   */
  checkBackendHealth(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.apiUrl}/health`);
  }

  /**
   * Verstuurt het dynamische query-object naar de backend om Jira-data op te halen.
   */
  fetchJiraDataDynamic(queryRequest: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/jira/fetch-dynamic`, queryRequest);
  }

  /**
   * Verstuurt de geselecteerde issue-keys naar de backend om de trainingsdata voor te bereiden.
   */
  prepareDataForTraining(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/data/prepare`, request);
  }

  /**
   * Verstuurt de configuratie om het fine-tuning proces te starten.
   */
  startFineTuning(request: { modelId: string, epochs: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/finetune/start`, request);
  }

  /**
   * Verstuurt een chat-prompt naar de backend, die het doorstuurt naar het getrainde model.
   */
  chatWithModel(prompt: string): Observable<any> {
    return this.http.post(this.apiUrl + '/chat', prompt, {
      headers: { 'Content-Type': 'text/plain' },
      responseType: 'json'
    });
  }
}