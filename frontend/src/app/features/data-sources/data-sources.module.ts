import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataSourcesComponent } from './data-sources.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: DataSourcesComponent }
    ])
  ]
})
export class DataSourcesModule { }
