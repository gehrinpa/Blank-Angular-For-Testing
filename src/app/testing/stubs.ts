import { Component, Input, Output, EventEmitter } from "@angular/core";
import { GraphMapItem, RegionType, SearchParameters } from "../shared";
import { TreeMapItem } from "../shared/tree-map-item";
import { SearchOptions } from "../services/shared.service";


@Component({
    selector: 'app-graph-map',
    template: '',
})
export class StubGraphMapComponent {
    @Input() title1: string;
    @Input() title2: string;
    @Input() bars: string;
    @Input() height: number;
    @Input() items: GraphMapItem[];
    @Input() relativeScaleButton: boolean;
}

@Component({
    selector: 'app-job-list',
    template: '',
})
export class StubJobListComponent {
    @Input() public title: string;
    @Input() public subtitle: string;
    @Input() public jobs: any[];
    @Input() public totalItems: number;

    @Output() pageChanged = new EventEmitter();
}

@Component({
    selector: 'app-map',
    template: ''
})
export class StubMapComponent {
    @Input() itemNo: number;
    @Input() heatMapEnabled: boolean;
    @Input() choroplethEnabled: boolean;
    @Input() dataSource: string;
    @Input() searchParams: SearchParameters;
    @Input() regionType: RegionType;

    @Output() mapLoaded = new EventEmitter();
    @Output() layerDataChanged = new EventEmitter();
    @Output() choroplethChanged = new EventEmitter();
}

@Component({
    selector: 'app-map-region-data',
    template: ''
})
export class StubMapRegionDataComponent {
    @Input() regionType: RegionType;
    @Input() itemNo: number;
    @Input() heatMapEnabled: boolean;
    @Input() choroplethEnabled: boolean;

    @Output() mapLoaded = new EventEmitter();
}

@Component({
    selector: 'app-request-progress-indicator',
    template: ''
})
export class StubRequestProgressIndicatorComponent {
}

@Component({
    selector: 'app-search-compare-header',
    template: ''
})
export class StubSearchCompareHeaderComponent {
    @Input() searchOptions: SearchOptions = {};
}

@Component({
  selector: 'app-tree-map',
  template: ''
})
export class StubTreeMapComponent {
  @Input() items: TreeMapItem[];
  @Input() title: string;
  @Output() select = new EventEmitter();
}
