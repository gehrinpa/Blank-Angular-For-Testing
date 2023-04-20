import { Routes, RouterModule } from '@angular/router';
import { HomeComponent,
    DataComponent,
    LoginComponent,
    SkillsCloudsComponent,
    SkillsGraphComponent,
    CareersCloudsComponent,
    CareersGraphComponent,
    ExperienceGraphComponent,
    StaffJoinersGraphComponent } from './';

import { RequireFeaturePermission } from './services/auth-route.service';

export const routes: Routes = [
    { path: '', redirectTo: "/home", pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'logout', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    {
        path: 'map',
        loadChildren: './map/map.module#MapModule'
    },
    {
      path: 'job-market',
      loadChildren: './job-market/job-market.module#JobMarketModule'
    },
    {
      path: 'demand-analysis',
      loadChildren: './demand-analysis/demand-analysis.module#DemandAnalysisModule'
    },
    {
        path: 'data',
        component: DataComponent,
        canActivate: [RequireFeaturePermission],
        canActivateChild: [RequireFeaturePermission],
        data: {
            features: ['data-graphs']
        },
        children: [
            { path: 'careers-clouds', component: CareersCloudsComponent },
            { path: 'careers-graph', component: CareersGraphComponent },
            { path: 'experience-graph', component: ExperienceGraphComponent },
            { path: 'skills-clouds', component: SkillsCloudsComponent },
            { path: 'skills-graph', component: SkillsGraphComponent },
            { path: 'staff-joiners-graph', component: StaffJoinersGraphComponent }
        ]
    }, {
        path: 'data-entry',
        loadChildren: './data-entry/data-entry.module#DataEntryModule'
    }, {
        path: 'reports',
        loadChildren: './reports/reports.module#ReportsModule'
    }, {
        path: 'admin',
        loadChildren: './admin/admin.module#AdminModule'
    },
    {
        path: 'skill-dna',
        loadChildren: './skill-dna/skill-dna.module#SkillDnaModule'
    }
];

export const routing = RouterModule.forRoot(routes);
