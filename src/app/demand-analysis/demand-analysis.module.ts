import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemandAnalysisComponent } from './demand-analysis.component';
import { RouterModule, Routes } from '@angular/router';



export const routes: Routes = [
  { path: '', component: DemandAnalysisComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    DemandAnalysisComponent
  ]
})
export class DemandAnalysisModule { }
