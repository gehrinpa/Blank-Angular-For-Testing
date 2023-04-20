import { MdcIconModule } from '@angular-mdc/web';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatSlideToggleModule } from '@angular/material';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AlertModule, BsDatepickerModule, ButtonsModule, CollapseModule, TabsModule, TooltipModule } from 'ngx-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { LocalDemandComponent } from './local-demand/local-demand.component';
import { LocationChooserMapComponent } from './location-chooser-map/location-chooser-map.component';
import { MapCompareComponent } from './map-compare/map-compare.component';
import { MapRegionDataComponent } from './map-region-data/map-region-data.component';
import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map/map.component';
import { RegionalAnalyticsComponent } from './regional-analytics/regional-analytics.component';
import { TimeSeriesBreakdownComponent } from './time-series-breakdown/time-series-breakdown.component';
import { TitleBreakdownComponent } from './title-breakdown/title-breakdown.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MapRoutingModule,
        AlertModule,
        ButtonsModule,
        BsDatepickerModule.forRoot(), // only module using this
        CollapseModule,
        TooltipModule,
        MdcIconModule,
        LeafletModule,
        MatSlideToggleModule,
        NgxChartsModule,
        SharedModule,
        MatDialogModule,
        TabsModule.forRoot(),
        NgSelectModule
    ],
    declarations: [
        LocalDemandComponent,
        MapComponent,
        MapCompareComponent,
        MapRegionDataComponent,
        RegionalAnalyticsComponent,
        TitleBreakdownComponent,
        TimeSeriesBreakdownComponent,
        LocationChooserMapComponent
    ],
    entryComponents: [
        TitleBreakdownComponent,
        TimeSeriesBreakdownComponent,
        LocationChooserMapComponent
    ]
})
export class MapModule { }
