import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin as observableForkJoin, Subscription, Observable } from 'rxjs';

import { GraphMapItem, ItemGraph } from '../../shared';
import { SharedService } from '../../services/shared.service';
import { CareersService } from '../../services/careers.service';
import { ANIMATIONS } from '../../animations';

@Component({
    selector: 'app-careers-graph',
    templateUrl: './careers-graph.component.html',
    styleUrls: ['./careers-graph.component.scss'],
    animations: ANIMATIONS
})
export class CareersGraphComponent implements OnInit, OnDestroy {
    public graph2: ItemGraph;
    private sub: Subscription;
    public hasNoData = true;

    constructor(private _sharedService: SharedService, private careersService: CareersService) { }

    ngOnInit() {
        this._sharedService.logNewComponent("careers-graph");

        this.sub = this._sharedService.items$.subscribe(companies => {
            this.getData(companies);
        });
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    getData(query) {
        observableForkJoin(
            this.careersService.getCareersBarChartData(query.params[0]),
            this.careersService.getCareersBarChartData(query.params[1])
        ).subscribe(s => {
            const items: GraphMapItem[] = [];

            if (s[0].title_names.length || s[1].title_names.length) {
                s[0].title_names.forEach((title, i) => {
                    items.push({
                        name: title,
                        score1: s[0].title_counts[i]
                    });
                });
                s[1].title_names.forEach((title, i) => {
                    const item = items.find(itm => itm.name == title);
                    if (item) {
                        const index = items.indexOf(item);
                        items[index].score2 = s[1].title_counts[i];
                    } else {
                        items.push({
                            name: title,
                            score2: s[1].title_counts[i]
                        });
                    }
                });
                this.graph2 = {
                    title1: query.item1,
                    title2: query.item2,
                    items: items
                };
                this.hasNoData = false;
            } else {
                this.graph2 = null;
                this.hasNoData = true;
            }
        });
    }

}
