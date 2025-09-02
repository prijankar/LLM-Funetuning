import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="home-container">
      <mat-card class="welcome-card">
        <mat-card-header>
          <div mat-card-avatar class="header-icon">
            <mat-icon>home</mat-icon>
          </div>
          <mat-card-title>Welcome to Our Application</mat-card-title>
          <mat-card-subtitle>Manage your data and models efficiently</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="content">
            <p>Get started by exploring the different sections of the application using the sidebar menu.</p>
            
            <div class="features">
              <div class="feature">
                <mat-icon color="primary">storage</mat-icon>
                <h3>Data Sources</h3>
                <p>Manage and connect to your data sources</p>
              </div>
              
              <div class="feature">
                <mat-icon color="primary">tune</mat-icon>
                <h3>Model Configuration</h3>
                <p>Configure and train your models</p>
              </div>
              
              <div class="feature">
                <mat-icon color="primary">chat_bubble</mat-icon>
                <h3>Chat Interface</h3>
                <p>Interact with your models</p>
              </div>
            </div>
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary">
            <mat-icon>rocket_launch</mat-icon>
            Get Started
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .welcome-card {
      max-width: 800px;
      margin: 0 auto;
      overflow: hidden;
    }
    
    .header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #e3f2fd;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      
      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #1976d2;
      }
    }
    
    .content {
      padding: 16px 0;
      
      p {
        font-size: 16px;
        line-height: 1.6;
        color: rgba(0, 0, 0, 0.7);
      }
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-top: 32px;
      
      .feature {
        text-align: center;
        padding: 20px;
        border-radius: 8px;
        background-color: #f9f9f9;
        transition: transform 0.2s, box-shadow 0.2s;
        
        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          margin-bottom: 12px;
        }
        
        h3 {
          margin: 12px 0 8px;
          color: #333;
        }
        
        p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
      }
    }
    
    mat-card-actions {
      display: flex;
      justify-content: center;
      padding: 16px;
      
      button {
        padding: 0 24px;
        
        mat-icon {
          margin-right: 8px;
        }
      }
    }
    
    @media (max-width: 600px) {
      .home-container {
        padding: 12px;
      }
      
      .features {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent { }
