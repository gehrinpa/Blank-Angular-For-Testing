import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CourseMappingComponent } from './course-mapping/course-mapping.component';
import { WorkforcePlanEditComponent } from './workforce-plan-edit/workforce-plan-edit.component';
import { WorkforcePlanListComponent } from './workforce-plan-list/workforce-plan-list.component';

import { RequireAuthenticated } from '../services/auth-route.service';

const routes: Routes = [
    { path: 'course-mapping', component: CourseMappingComponent, canActivate: [RequireAuthenticated] },
    { path: 'workforce-planning', component: WorkforcePlanListComponent, canActivate: [RequireAuthenticated] },
    { path: 'workforce-planning/edit/:id', component: WorkforcePlanEditComponent, canActivate: [RequireAuthenticated]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataEntryRoutingModule { }
