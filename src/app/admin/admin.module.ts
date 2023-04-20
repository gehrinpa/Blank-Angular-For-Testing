import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

import { AlertModule, TooltipModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '../shared/shared.module';

import { JobMappingComponent } from './job-mapping/job-mapping.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserEditComponent } from './user-edit/user-edit.component';

import { GroupsComponent } from './groups/groups/groups.component';
import { GroupListComponent } from './groups/group-list/group-list.component';
import { GroupDetailComponent } from './groups/group-detail/group-detail.component';
import { GroupCreateComponent } from './groups/group-create/group-create.component';
import { GroupEditComponent } from './groups/group-edit/group-edit.component';
import { GroupInfoComponent } from './groups/group-info/group-info.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        TypeaheadModule,
        AdminRoutingModule,
        SharedModule,
        AlertModule,
        TooltipModule,
        NgSelectModule
    ],
    declarations: [
        JobMappingComponent,
        UserListComponent,
        UserEditComponent,

        GroupsComponent,
        GroupListComponent,
        GroupDetailComponent,
        GroupCreateComponent,
        GroupEditComponent,
        GroupInfoComponent
    ]
})
export class AdminModule { }
