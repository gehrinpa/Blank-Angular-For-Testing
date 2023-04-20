import { TopEmployersComponent } from './top-employers/top-employers.component';
import { TopAdvertisersComponent } from './top-advertisers/top-advertisers.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AlertModule, CollapseModule, PaginationModule } from 'ngx-bootstrap';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { GraphMapComponent } from './graph-map/graph-map.component';
import { JobListComponent } from './job-list/job-list.component';
import { NewsListComponent } from './news-list/news-list.component';
import { RequestProgressIndicatorComponent } from './request-progress-indicator/request-progress-indicator.component';
import { SearchCompareHeaderComponent } from './search-compare-header/search-compare-header.component';
import { TreeMapComponent } from './tree-map/tree-map.component';
import { LoadingComponent } from './loading/loading.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        AlertModule,
        CollapseModule,
        PaginationModule,
        TypeaheadModule,
        NgxChartsModule
    ],
    declarations: [
        GraphMapComponent,
        JobListComponent,
        NewsListComponent,
        RequestProgressIndicatorComponent,
        SearchCompareHeaderComponent,
        TreeMapComponent,
        TopAdvertisersComponent,
        TopEmployersComponent,
        LoadingComponent,
        NewsListComponent
    ],
    exports: [
        GraphMapComponent,
        JobListComponent,
        NewsListComponent,
        RequestProgressIndicatorComponent,
        SearchCompareHeaderComponent,
        TreeMapComponent,
        LoadingComponent,
        TopAdvertisersComponent,
        TopEmployersComponent,
    ]
})
export class SharedModule { }
