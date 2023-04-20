import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { GraphMapItem, ItemGraph } from '../../shared';
import { SharedService } from '../../services/shared.service';
import { ApiService } from '../../services/api.service';
import { ANIMATIONS } from '../../animations';

@Component({
    selector: 'app-experience-graph',
    templateUrl: './staff-joiners-graph.component.html',
    styleUrls: ['./staff-joiners-graph.component.scss'],
    animations: ANIMATIONS
})
export class StaffJoinersGraphComponent implements OnInit, OnDestroy {
    public graph4: ItemGraph;
    private sub: Subscription;
    public hasNoData: boolean;
    constructor(private _sharedService: SharedService, private _apiService: ApiService) { }
    ngOnInit() {
        this._sharedService.logNewComponent("staff-joiners-graph");

        this.sub = this._sharedService.items$.subscribe(companies => {
            this.getData(companies);
        });
    }
    ngOnDestroy() {
        this.sub.unsubscribe();
    }
    getData(query) {
        const nuts = query.params[0].regionCode;
        this._apiService.getStaffAttritionData(query.item1, query.item2, query.mode, nuts)
            .then(s => {
                if (s[0].date.length || s[1].date.length) {
                    const items: GraphMapItem[] = [];
                    s[0].date.forEach((title, i) => {
                        items.push({
                            name: title.substr(0, 4),
                            score1: s[0].counts[i]
                        });
                    });
                    s[1].date.forEach((title, i) => {
                        const item = items.find(itm => itm.name == title.substr(0, 4));
                        if (item) {
                            const index = items.indexOf(item);
                            items[index].score2 = s[1].counts[i];
                        } else {
                            items.push({
                                name: title.substr(0, 4),
                                score2: s[1].counts[i]
                            });
                        }
                    });
                    this.graph4 = {
                        title1: query.item1,
                        title2: query.item2,
                        items: items
                    };
                    this.hasNoData = false;
                } else {
                    this.graph4 = null;
                    this.hasNoData = true;
                }
            });
    }

}
