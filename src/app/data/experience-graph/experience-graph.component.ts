import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { GraphMapItem, ItemGraph } from '../../shared';
import { SharedService } from '../../services/shared.service';
import { ApiService } from '../../services/api.service';
import { ANIMATIONS } from '../../animations';

@Component({
    selector: 'app-experience-graph',
    templateUrl: './experience-graph.component.html',
    styleUrls: ['./experience-graph.component.scss'],
    animations: ANIMATIONS
})
export class ExperienceGraphComponent implements OnInit, OnDestroy {
    public graph3: ItemGraph;
    private sub: Subscription;
    public hasNoData: boolean;
    constructor(private _sharedService: SharedService, private _apiService: ApiService) { }
    ngOnInit() {
        this._sharedService.logNewComponent("experience-graph");

        this.sub = this._sharedService.items$.subscribe(companies => {
            this.getData(companies);
        });
    }
    ngOnDestroy() {
        this.sub.unsubscribe();
    }
    getData(query) {
        const nuts = query.params[0].regionCode;
        this._apiService.getExperienceBarChartData(query.item1, query.item2, query.mode, nuts)
            .then(s => {
                const items: GraphMapItem[] = [];
                if (s[0]["date range"].length || s[1]["date range"].length) {
                    s[0]["date range"].forEach((title, i) => {
                        items.push({
                            name: title,
                            score1: s[0].counts[i]
                        });
                    });
                    s[1]["date range"].forEach((title, i) => {
                        const item = items.find(itm => itm.name == title);
                        if (item) {
                            const index = items.indexOf(item);
                            items[index].score2 = s[1].counts[i];
                        } else {
                            items.push({
                                name: title,
                                score2: s[1].counts[i]
                            });
                        }
                    });
                    this.graph3 = {
                        title1: query.item1,
                        title2: query.item2,
                        items: items
                    };
                    this.hasNoData = false;
                } else {
                    this.graph3 = null;
                    this.hasNoData = true;
                }
            });
    }

}
