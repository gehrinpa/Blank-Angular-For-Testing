import { Component, OnInit } from '@angular/core';
import { Map } from 'leaflet';

import { SharedService } from '../../services/shared.service';
import { ApiService } from '../../services/api.service';
import { ANIMATIONS } from '../../animations';
import { TreeMapItem, RegionType } from '../../shared';

@Component({
    selector: 'app-map-compare',
    templateUrl: './map-compare.component.html',
    styleUrls: ['./map-compare.component.scss'],
    animations: ANIMATIONS
})
export class MapCompareComponent implements OnInit {
    public nutsLevel = RegionType.NUTS3;
    public heatMapEnabled: boolean = false;
    public choroplethEnabled: boolean = true;
    private maps: Map[] = [];
    private _syncMaps: boolean = true;

    // Collapsible sections
    public optionsCollapsed = true;

    constructor(private _sharedService: SharedService,
        private _apiService: ApiService) {
            this.nutsLevel = this._sharedService.nutsLevel;
        }
    ngOnInit() {
        this._sharedService.logNewComponent("map-compare");
    }
    get syncMaps() {
        return this._syncMaps;
    }
    set syncMaps(value) {
        this._syncMaps = value;
        if (this._syncMaps) {
            this.enableMapSync();
        } else {
            this.disableMapSync();
        }
    }
    changeNuts($event) {
        this.nutsLevel = parseInt($event);
        this._sharedService.nutsLevel = this.nutsLevel;
    }
    mapsLoaded(map: Map) {
        this.maps.push(map);
        if (this.maps.length == 2) {
            this.enableMapSync();
        }
    }
    enableMapSync() {
        this.maps[0]['sync'](this.maps[1]);
        this.maps[1]['sync'](this.maps[0]);
    }
    disableMapSync() {
        this.maps[0]['unsync'](this.maps[1]);
        this.maps[1]['unsync'](this.maps[0]);
    }
}
