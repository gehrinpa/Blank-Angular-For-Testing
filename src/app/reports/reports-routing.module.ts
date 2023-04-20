import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EnquiryDashboardComponent } from './enquiry-dashboard/enquiry-dashboard.component';
import { WorkforcePlanDashboardComponent } from './workforce-plan-dashboard/workforce-plan-dashboard.component';

import { RequireAuthenticated } from '../services/auth-route.service';

const routes: Routes = [
    {
        path: 'enquiry-dashboard',
        canActivate: [RequireAuthenticated],
        component: EnquiryDashboardComponent
    },
    {
        path: 'workforce-plan-dashboard/:id',
        component: WorkforcePlanDashboardComponent,
        canActivate: [RequireAuthenticated]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportsRoutingModule { }
