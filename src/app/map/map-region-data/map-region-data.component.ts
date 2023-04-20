import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';

import { SharedService } from '../../services/shared.service';
import { SkillsService } from '../../services/skills.service';
import { ANIMATIONS } from '../../animations';
import { TreeMapItem, RegionType } from '../../shared';

@Component({
    selector: 'app-map-region-data',
    templateUrl: './map-region-data.component.html',
    styleUrls: ['./map-region-data.component.scss'],
    animations: ANIMATIONS
})
export class MapRegionDataComponent implements OnInit, OnDestroy  {
    @Input() regionType: RegionType;
    @Input() itemNo: number;
    @Input() heatMapEnabled: boolean;
    @Input() choroplethEnabled: boolean;

    @Output() mapLoaded = new EventEmitter();

    public mapHeader: string;
    private oldMapHeader: string;

    // Region data
    public regionDataCollapsed = true;
    public regionData: any;
    public skills: TreeMapItem[];

    private itemSub: Subscription;

    constructor(private _sharedService: SharedService,
        private skillsService: SkillsService) {
            this.regionType = this._sharedService.nutsLevel;
        }

    ngOnInit() {
        this.mapHeader = this._sharedService[`item${this.itemNo}`];
        this.itemSub = this._sharedService.items$.subscribe(q => {
            this.mapHeader = q[`item${this.itemNo}`];
            //this.regionData = undefined;
            if(this.oldMapHeader != this.mapHeader){
                this.regionData = undefined;
                this.regionDataCollapsed = true;
                this.oldMapHeader = this.mapHeader;
                this.skills = [];
            }
        });
    }
    ngOnDestroy() {
        this.itemSub.unsubscribe();
    }

    setData($event) {
        if ($event) {
            const mapId = $event.no;

            this.regionData = $event.properties;
            this._sharedService.setRegion(this.regionData.dataKey, this.regionData.name, this.regionType);

            const params = this._sharedService.getSearchParams(mapId);

            this.skillsService.getSkillCloud(params)
            .subscribe(data => {
                this.skills = data.skill_names.map(s => ({ name: s }));
                this.skillsService.getSkillDescriptions(data.skill_names)
                    .subscribe((descriptions: any[]) => {
                        this.skills.forEach(skill => {
                            descriptions.forEach(description => {
                                if (skill.name.toLowerCase() == description.name.toLowerCase()) {
                                    skill.description = description.text;
                                }
                            });
                        });
                    });
            });
        } else {
            this.regionData = null;
            this.skills = null;
        }
    }
}
