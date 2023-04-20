import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobMappingComponent } from './job-mapping/job-mapping.component';
import { UserListComponent } from './user-list/user-list.component';
import { GroupListComponent } from './groups/group-list/group-list.component';
import { GroupsComponent } from './groups/groups/groups.component';
import { GroupCreateComponent } from './groups/group-create/group-create.component';
import { GroupDetailComponent } from './groups/group-detail/group-detail.component';
import { GroupInfoComponent } from './groups/group-info/group-info.component';
import { GroupEditComponent } from './groups/group-edit/group-edit.component';

const routes: Routes = [
    {
        path: 'job-mapping',
        component: JobMappingComponent
    },
    {
        path: 'user-list',
        component: UserListComponent
    },
    {
        path: 'groups', component: GroupsComponent, children: [
            { path: '', redirectTo: 'list' },
            { path: 'list', component: GroupListComponent },
            { path: 'create', component: GroupCreateComponent },
            { path: ':groupId', component: GroupDetailComponent, children: [
              { path: '', redirectTo: '' },
              { path: 'info', component: GroupInfoComponent },
              { path: 'edit', component: GroupEditComponent },
            ]},
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
