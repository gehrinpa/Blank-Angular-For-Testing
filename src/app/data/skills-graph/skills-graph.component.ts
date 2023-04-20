import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin as observableForkJoin, Subscription, Observable } from 'rxjs';

import { GraphMapItem, ItemGraph } from '../../shared';
import { SharedService } from '../../services/shared.service';
import { SkillsService } from '../../services/skills.service';
import { ANIMATIONS } from '../../animations';

@Component({
    selector: 'app-skills-graph',
    templateUrl: './skills-graph.component.html',
    styleUrls: ['./skills-graph.component.scss'],
    animations: ANIMATIONS
})
export class SkillsGraphComponent implements OnInit, OnDestroy {
    public graph1: ItemGraph;
    private sub: Subscription;
    public hasNoData: boolean;
    constructor(private _sharedService: SharedService, private skillsService: SkillsService) { }
    ngOnInit() {
        this._sharedService.logNewComponent("skills-graph");

        this.sub = this._sharedService.items$.subscribe(companies => {
            this.getData(companies);
        });
    }
    ngOnDestroy() {
        this.sub.unsubscribe();
    }
    getData(query) {
        const observable = observableForkJoin(
            this.skillsService.getSkillsBarChartData(query.params[0]),
            this.skillsService.getSkillsBarChartData(query.params[1])
        );

        observable.subscribe(s => {
            const items: GraphMapItem[] = [];
            if (s[0].skill_names.length || s[1].skill_names.length) {
                s[0].skill_names.forEach((skill, i) => {
                    items.push({
                        name: skill,
                        score1: s[0].skill_counts[i]
                    });
                });
                s[1].skill_names.forEach((skill, i) => {
                    const item = items.find(itm => itm.name == skill);
                    if (item) {
                        const index = items.indexOf(item);
                        items[index].score2 = s[1].skill_counts[i];
                    } else {
                        items.push({
                            name: skill,
                            score2: s[1].skill_counts[i]
                        });
                    }
                });
                this.graph1 = {
                    title1: query.item1,
                    title2: query.item2,
                    items: items
                };
                this.hasNoData = false;
            } else {
                this.graph1 = null;
                this.hasNoData = true;
            }
        });
    }
}
