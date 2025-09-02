import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

// Importeer de benodigde Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';

interface ModelConfig {
  id: string;
  name: string;
  description: string;
  parameters: {
    epochs: number;
    learningRate: number;
    batchSize: number;
    loraR: number;
    loraAlpha: number;
  };
}

@Component({
  selector: 'app-model-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDividerModule
  ],
  templateUrl: './model-config.html',
  styleUrls: ['./model-config.scss']
})
export class ModelConfigComponent {
  // Een lijst van modellen waar de gebruiker uit kan kiezen
  availableModels = [
    { id: 'Qwen/Qwen2-0.5B-Instruct', name: 'Qwen2 0.5B (Snel, voor CPU)' },
    { id: 'mistralai/Mistral-7B-Instruct-v0.2', name: 'Mistral 7B (Krachtig, vereist GPU)' }
  ];

  selectedModel: string = this.availableModels[0].id;
  statusMessage: string = '';

  // Bundel alle hyperparameters in een object
  hyperparameters = {
    epochs: 1,
    learningRate: 0.0002,
    batchSize: 1,
    loraR: 16,
    loraAlpha: 16
  };

  constructor(private apiService: ApiService) {}

  onStartFineTuning(): void {
    this.statusMessage = 'Verzoek om training te starten wordt verstuurd...';
    
    const request = {
      modelId: this.selectedModel,
      ...this.hyperparameters // Voegt alle properties van het object toe
    };
    
    // Roep de backend API aan om de training te starten
    this.apiService.startFineTuning(request).subscribe({
      next: (response: { message: string }) => {
        this.statusMessage = response.message;
        console.log("Antwoord van backend:", response);
      },
      error: (err: any) => {
        this.statusMessage = 'Fout: Kon training niet starten.';
        console.error(err);
      }
    });
  }
}