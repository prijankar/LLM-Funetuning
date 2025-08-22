import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../shared/components/results-dialog/api.service';
import { Observable, catchError, of } from 'rxjs';

interface ChatResponse {
  response: string;
}

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './chat-interface.html',
})
export class ChatInterfaceComponent {
  prompt: string = '';
  response: string = '';
  isLoading: boolean = false;

  constructor(private apiService: ApiService) {}

  sendPrompt(): void {
    if (!this.prompt.trim()) return;
    
    this.isLoading = true;
    this.response = '';
    
    const formattedPrompt = `<s>[INST] Analyseer de volgende Jira story en geef een schatting van de benodigde tijd in uren.\n\n${this.prompt} [/INST]`;

    this.apiService.chatWithModel(formattedPrompt).pipe(
      catchError((error: Error) => {
        console.error('Error calling chatWithModel:', error);
        this.response = 'Fout bij het communiceren met het model.';
        this.isLoading = false;
        return of({ response: '' });
      })
    ).subscribe({
      next: (res: ChatResponse) => {
        this.response = res?.response || 'Geen antwoord ontvangen van het model.';
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error in subscription:', error);
        this.response = 'Er is een fout opgetreden bij het verwerken van het verzoek.';
        this.isLoading = false;
      }
    });
  }
}