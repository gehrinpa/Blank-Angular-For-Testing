import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap';

import { JobMarketComponent } from './job-market.component';
import { SampleJobAdvertsComponent } from './sample-job-adverts/sample-job-adverts.component';
import { SharedModule } from '../shared/shared.module';

export const routes: Routes = [
  { path: '', component: JobMarketComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatSlideToggleModule,
    NgxChartsModule,
    FormsModule,
    TypeaheadModule,
    NgSelectModule,
    ModalModule,
    SharedModule
  ],
  declarations: [
    JobMarketComponent,
    SampleJobAdvertsComponent
  ]
})
export class JobMarketModule { }
