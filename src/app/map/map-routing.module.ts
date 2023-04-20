import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MapCompareComponent } from './map-compare/map-compare.component';

import { RequireFeaturePermission } from '../services/auth-route.service';
import { LocalDemandComponent } from './local-demand/local-demand.component';
import { RegionalAnalyticsComponent } from './regional-analytics/regional-analytics.component';

const routes: Routes = [
    {
        path: 'compare', component: MapCompareComponent,
        canActivate: [RequireFeaturePermission],
        data: {
            features: ['map-compare']
        }
    }, {
        path: 'local-demand',
        component: LocalDemandComponent,
        canActivate: [RequireFeaturePermission],
        data: {
            features: ['local-demand']
        }
    }, {
        path: 'regional-analytics',
        component: RegionalAnalyticsComponent,
        canActivate: [RequireFeaturePermission],
        data: {
            features: ['regional-analytics']
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MapRoutingModule { }
