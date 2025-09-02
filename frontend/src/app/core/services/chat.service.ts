import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface Message {
  content: string;
  timestamp: Date;
  sender: 'user' | 'bot';
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = 'http://localhost:8080/api/chat';
  private http = inject(HttpClient);

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  
  clearChat(): void {
    this.messagesSubject.next([]);
  }
  sendMessage(prompt: string): Observable<string> {
    const userMessage: Message = { content: prompt, sender: 'user', timestamp: new Date() };
    this.messagesSubject.next([...this.messagesSubject.value, userMessage]);

    // De backend verwacht een ruwe string, maar als JSON. We sturen het als een object.
    const requestBody = { prompt: prompt };
    
    // De backend geeft een ruwe string terug, dus responseType 'text'.
    return this.http.post(this.apiUrl, requestBody, { responseType: 'text' }).pipe(
      tap(botResponse => {
        const botMessage: Message = { content: botResponse, sender: 'bot', timestamp: new Date() };
        this.messagesSubject.next([...this.messagesSubject.value, botMessage]);
      })
    );
  }
}