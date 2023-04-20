import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonsModule } from 'ngx-bootstrap';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { ReportsRoutingModule } from './reports-routing.module';
import { SharedModule } from '../shared/shared.module';

import { EducationLevelWidgetComponent } from './education-level-widget/education-level-widget.component';
import { EnquiryDashboardComponent } from './enquiry-dashboard/enquiry-dashboard.component';
import { SalaryWidgetComponent } from './salary-widget/salary-widget.component';
import { TitleCountWidgetComponent } from './title-count-widget/title-count-widget.component';
import { WorkforcePlanDashboardComponent } from './workforce-plan-dashboard/workforce-plan-dashboard.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ButtonsModule,
        TypeaheadModule,
        NgxChartsModule,
        ReportsRoutingModule,
        SharedModule
    ],
    declarations: [
        EducationLevelWidgetComponent,
        EnquiryDashboardComponent,
        SalaryWidgetComponent,
        TitleCountWidgetComponent,
        WorkforcePlanDashboardComponent
    ]
})
export class ReportsModule { }
