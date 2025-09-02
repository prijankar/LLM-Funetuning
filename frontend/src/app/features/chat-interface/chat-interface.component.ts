import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatService, Message } from '../../core/services/chat.service'; // MessageSender is niet meer nodig
import { Subscription } from 'rxjs';

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
  templateUrl: './chat-interface.component.html',
  styleUrls: ['./chat-interface.component.scss']
})
export class ChatInterfaceComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  newMessage = '';
  isLoading = false;
  private messagesSubscription: Subscription | undefined;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // CORRECTIE: Abonneer op de messages$ observable om de berichten te ontvangen
    this.messagesSubscription = this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    this.isLoading = true;
    const prompt = this.newMessage;
    this.newMessage = ''; // Maak inputveld leeg

    this.chatService.sendMessage(prompt).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isLoading = false;
        // Optioneel: toon een foutmelding
      }
    });
  }

  clearChat(): void {
    // CORRECTIE: De methode heet nu clearChat()
    this.chatService.clearChat();
  }

  ngOnDestroy(): void {
    // Goede gewoonte: unsubscriben om memory leaks te voorkomen
    this.messagesSubscription?.unsubscribe();
  }
}