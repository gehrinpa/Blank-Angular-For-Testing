import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { SharedService } from '../services/shared.service';
import { GeodataService } from '../services/geodata.service';
import { ANIMATIONS } from '../animations';

@Component({
    selector: 'app-data',
    templateUrl: './data.component.html',
    styleUrls: ['./data.component.scss'],
    animations: ANIMATIONS
})
export class DataComponent implements OnInit {
    public nutsLevel: number;
    public nutsRegion: string = "UK";
    public nutsItems: { id: string, name: string }[];
    constructor(private _sharedService: SharedService, private geodataService: GeodataService) { }
    ngOnInit() {
        this.nutsLevel = this._sharedService.nutsLevel;
        this.geodataService.getRegionNames(this._sharedService.nutsLevel)
            .subscribe(s => {
                this.nutsItems = s;
                this.nutsRegion = this._sharedService.nutsRegion;
            });
    }

    changeNuts() {
        this._sharedService.nutsLevel = this.nutsLevel;
        this.geodataService.getRegionNames(+this.nutsLevel)
            .subscribe(s => this.nutsItems = s);
    }
    changeNutsRegion() {
        const nutsName = this.nutsItems.find(s => s.id == this.nutsRegion).name;

        this._sharedService.setRegion(this.nutsRegion, nutsName, this.nutsLevel);
    }
    resetNuts() {
        this.nutsRegion = "UK";
        this.nutsItems = [];
        this.nutsLevel = 0;

        this._sharedService.setRegion(this.nutsRegion, "UK", this.nutsLevel);
    }
}
