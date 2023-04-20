import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertModule, TooltipModule } from 'ngx-bootstrap';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NgSelectModule } from '@ng-select/ng-select';

import { DataEntryRoutingModule } from './data-entry-routing.module';
import { SharedModule } from '../shared/shared.module';

import { CourseMappingComponent } from './course-mapping/course-mapping.component';
import { WorkforcePlanEditComponent } from './workforce-plan-edit/workforce-plan-edit.component';
import { WorkforcePlanListComponent } from './workforce-plan-list/workforce-plan-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AlertModule,
    TooltipModule,
    TypeaheadModule,
    NgSelectModule,
    DataEntryRoutingModule,
    SharedModule
  ],
  declarations: [
    CourseMappingComponent,
    WorkforcePlanEditComponent,
    WorkforcePlanListComponent
  ]
})
export class DataEntryModule { }
