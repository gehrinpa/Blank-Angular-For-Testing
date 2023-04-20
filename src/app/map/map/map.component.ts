import {
    Component, OnInit, OnChanges, ElementRef, OnDestroy, Input, Output, EventEmitter, NgZone, KeyValueDiffer,
    KeyValueDiffers, DoCheck, ComponentFactoryResolver, ComponentRef, Injector
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { ApiService } from '../../services/api.service';
import { GeodataService, GeoDataResult, RegionBoundsResult } from '../../services/geodata.service';
import { SharedService } from '../../services/shared.service';
import { RegionType, SearchParameters } from '../../shared';

import { control, Control, FeatureGroup, Map, tileLayer, geoJSON, GeoJSON, heatLayer, Layer, Popup, LeafletEvent } from 'leaflet';
import 'leaflet-draw';
import 'leaflet.fullscreen';
import 'types.leaflet.heat';
import 'leaflet.sync';
import { Feature } from 'geojson';

export interface RegionProperties {
    dataKey: string;
    name: string;
    count: number;
    fraction: number;

    [id: string]: any;
}

export interface LayerDataChangeEvent {
    layer: GeoJSON;
    properties: RegionProperties;
    no: number;
}

@Component({
    selector: 'app-map',
    templateUrl: 'map.component.html',
    styleUrls: ['map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy, OnChanges, DoCheck {
    @Input() itemNo: number;
    @Input() heatMapEnabled = false;
    @Input() choroplethEnabled = true;
    @Input() dataSource = "people";
    @Input() searchParams: SearchParameters = {};
    @Input() categories: string[] = [];
    @Input() regionType = RegionType.NUTS3;
    @Input() sicCode: boolean = false;

    @Output() mapLoaded = new EventEmitter<Map>();
    @Output() layerDataChanged = new EventEmitter();
    @Output() choroplethChanged = new EventEmitter<GeoDataResult>();

    private profiles = [];
    private heatLayer: any;
    private sub: Subscription;
    private fillOpacity = 0.7;
    public options = {
        layers: [
            tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright"> \
                OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                maxZoom: 15
            })
        ],
        zoom: 6,
        center: [54, -3]
    };
    public map: Map;
    private mapClicked = 0;
    private countryBounds: RegionBoundsResult = null;
    private geometryLayers: { [id: string]: GeoJSON } = {};
    private geoRegionType: RegionType = 0;
    private choroplethData: GeoDataResult = null;
    private searchParamsDiffer: KeyValueDiffer<string, any> = null;

    private popupComponentRef: ComponentRef<{}> = null;

    constructor(private ngZone: NgZone, private element: ElementRef, private keyValueDiffers: KeyValueDiffers,
        private resolver: ComponentFactoryResolver, private injector: Injector,
        private _apiService: ApiService,
        private _geodataService: GeodataService,
        private _sharedService: SharedService) {

        this.searchParamsDiffer = this.keyValueDiffers.find(this.searchParams).create();
    }

    ngOnInit() {
        this.calcRegionType();
    }

    ngOnDestroy() {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }

    ngOnChanges() {
        if (this.map) {
            this.setMapData(this._sharedService.getItems()[this.itemNo - 1]);
        }
    }

    ngDoCheck() {
        const diff = this.searchParamsDiffer.diff(this.searchParams);
        // ignore any changes before map load as the map will use the current params on load
        if (this.map && diff) {
            this.setMapData(this._sharedService.getItems()[this.itemNo - 1]);
        }

        // check popup
        if (this.popupComponentRef) {
            this.popupComponentRef.changeDetectorRef.detectChanges();
        }
    }

    onMapReady(map: Map) {
        // MASSIVE HACK
        // Our map instance is missng the properties that leaflet.sync adds
        // So manually copy them over
        for (const p in Map.prototype) {
            if (!(p in map)) {
                map[p] = Map.prototype[p];
            }
        }

        this.map = map;

        const windowWidth = window.innerWidth;
        if (windowWidth >= 768) {
            const drawnItems = new FeatureGroup([]);
            const drawControl = new Control.Draw({
                edit: {
                    featureGroup: drawnItems
                }
            });

            this.map.addControl(control.fullscreen())
                .addLayer(drawnItems)
                .addControl(drawControl)
                .on('draw:created', function (e: any) {
                    // let type = e.layerType,
                    const layer = e.layer;
                    drawnItems.addLayer(layer);
                });
        }

        this.mapLoaded.emit(map);

        // Load gemometry bounds
        this._geodataService.getRegionBounds().subscribe(data => {
            this.countryBounds = data;
            this.loadGeometry();
        });

        // update loaded geometry on map move/zoom
        this.map.on('moveend', () => this.loadGeometry());
        this.map.on('zoomend', () => this.loadGeometry());

        // subscribe to search
        this.sub = this._sharedService.items$.subscribe((query: any) => {
            if (this.itemNo == 1) {
                this.setMapData(query.item1);
            } else {
                this.setMapData(query.item2);
            }
        });
    }

    isFullscreen(): boolean {
        if (this.map == undefined) { return false; }
        return this.map['_isFullscreen'] || false; // isFullscreen(); //missing?
    }

    openPopup(layer: Layer, component, options = {}) {
        const popup = new Popup(options, layer);

        // get center of layer if possible
        let latlng = (this.map as Map).getCenter();
        if (layer['getBounds']) {
            latlng = layer['getBounds']().getCenter();
        }

        popup.setLatLng(latlng);

        // create component
        if (this.popupComponentRef) {
            this.popupComponentRef.destroy();
        }

        const compFactory = this.resolver.resolveComponentFactory(component);
        this.popupComponentRef = compFactory.create(this.injector);

        // add to popup
        const div = document.createElement('div');
        div.appendChild(this.popupComponentRef.location.nativeElement);
        popup.setContent(div);

        this.map.openPopup(popup);

        return this.popupComponentRef;
    }

    private getChoroplethData(query) {
        let searchParams = Object.assign({}, this.searchParams);
        searchParams.regionType = this.regionType;
        searchParams = this._sharedService.getSearchParams(this.itemNo, searchParams);

        let geoData: Observable<GeoDataResult>;

        if (this.dataSource == 'people') {
            geoData = this._geodataService.getPeopleGeoData(searchParams);
        } else if (this.dataSource == 'jobs') {
            geoData = this._geodataService.getLiveJobGeoData(searchParams);
        } else if (this.dataSource == "jobs-la" && searchParams.startDate && searchParams.endDate) {
            geoData = this._geodataService.getJobGeoData(searchParams, this.categories, this.sicCode);
        } else {
            return;
        }

        geoData.subscribe(data => {
            this.choroplethData = data;
            this.choroplethChanged.emit(data);
            Object.keys(this.geometryLayers).forEach(country => this.updateChoroplethData(country));
        });
    }

    private getHeatMap(query) {
        return new Observable(observer => {
            this._apiService.getProfileMarkers(query, this._sharedService.mode, this.itemNo).then(data => {
                const lat_lngs = [];
                for (let i = 0; i < data.current_company.length; i++) {
                    this.profiles.push({
                        current_company: data.current_company[i],
                        job_title: data.jobtitle[i],
                        lat_lng: data.latlngs[i],
                        name: data.name[i],
                        profile_picture_url: data.profile_picture_url[i]
                    });
                    lat_lngs.push([data.latlngs[i][0], data.latlngs[i][1]]);
                }
                observer.next(lat_lngs);
            });
        });
    }

    private setMapData(query) {
        this.calcRegionType();

        if (!query && !this.categories.length) {
            return;
        }

        if (this.choroplethEnabled) {
            this.getChoroplethData(query);
        } else {
            this.removeGeometry();
        }

        if (this.heatMapEnabled) {
            this.getHeatMap(query).subscribe((s: any) => {
                const layer = heatLayer(s, { radius: 25, max: 1 });
                this.replaceLayer(this.heatLayer, layer);
                this.heatLayer = layer;
            });
        } else {
            if (this.map.hasLayer(this.heatLayer)) {
                this.map.removeLayer(this.heatLayer);
            }
        }
    }

    private onFeatureClick(e: LeafletEvent) {
        this.mapClicked += 1;
        setTimeout(() => {
            if (this.mapClicked == 1) {
                this.mapClicked = 0;
                const layer = e.target;
                layer.bringToFront();

                this.ngZone.run(() => this.layerDataChanged.emit({
                    layer,
                    properties: layer.feature.properties,
                    no: this.itemNo
                }));
            }
        }, 300);
    }

    private onFeatureDoubleClick(e: LeafletEvent) {
        this.mapClicked = 0;
        this.map.fitBounds(e.target.getBounds());
    }

    private onFeatureHover(e: LeafletEvent) {
        const layer = e.target;
        layer.bringToFront();
        layer.setStyle({
            weight: 2,
            color: '#666',
            dashArray: '3',
            fillOpacity: 1
        });
    }

    private onFeatureHoverOut(e: LeafletEvent) {
        e.target.setStyle(this.style(e.target.feature));
    }

    private onEachFeature(feature, layer: Layer) {
        layer.on({
            click: (e) => this.onFeatureClick(e),
            dblclick: (e) => this.onFeatureDoubleClick(e),
            mouseover: (e) => this.onFeatureHover(e),
            mouseout: (e) => this.onFeatureHoverOut(e)
        });
    }

    private style(feature) {
        let fillColor = '#00000000';
        if (!isNaN(feature.properties.fraction)) {
            fillColor = this.getColor(feature.properties.fraction);
        }

        return {
            fillColor: fillColor,
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: feature.properties.count > 0 ? this.fillOpacity : 0
        };
    }

    private getColor(d) {
        const colours = [
            { r: 0xff, g: 0xff, b: 0xb2 },
            { r: 0xfe, g: 0xd9, b: 0x76 },
            { r: 0xfe, g: 0xb2, b: 0x4c },
            { r: 0xfd, g: 0x8d, b: 0x3c },
            { r: 0xf0, g: 0x3b, b: 0x20 },
            { r: 0xbd, g: 0x00, b: 0x26 }];

        // get two colours to blend
        const scaled = d * (colours.length - 1);
        const col0 = colours[Math.floor(scaled)];
        const col1 = colours[Math.ceil(scaled)];

        // blend colours
        const blend = scaled - Math.floor(scaled);

        const r = col0.r * (1.0 - blend) + col1.r * blend;
        const g = col0.g * (1.0 - blend) + col1.g * blend;
        const b = col0.b * (1.0 - blend) + col1.b * blend;

        const toHex = n => {
            const ret = Math.round(n).toString(16);
            return ret.length == 1 ? '0' + ret : ret;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    private replaceLayer(oldLayer, newLayer) {
        const map = this.map;
        if (map.hasLayer(oldLayer)) {
            map.removeLayer(oldLayer);
        }

        map.addLayer(newLayer);
    }

    private loadGeometry() {
        if (!this.countryBounds || !this.choroplethEnabled) {
            return;
        }
        const mapBounds = this.map.getBounds();

        for (const country of Object.keys(this.countryBounds)) {

            if (mapBounds.intersects(this.countryBounds[country])) {

                if (country in this.geometryLayers) {
                    // Already loaded
                    if (!this.map.hasLayer(this.geometryLayers[country])) {
                        this.map.addLayer(this.geometryLayers[country]);
                    }
                    continue;
                }

                this._geodataService.getRegionGeometry(this.regionType, country).subscribe(data => {
                    // Prevent loading duplicates
                    if (country in this.geometryLayers) {
                        return;
                    }

                    this.geometryLayers[country] = geoJSON(data, {
                        style: feature => this.style(feature),
                        onEachFeature: (feature, layer) => this.onEachFeature(feature, layer)
                    });
                    this.map.addLayer(this.geometryLayers[country]);
                    this.updateChoroplethData(country);
                });
            }
        }
    }

    private removeGeometry() {
        // remove layers
        Object.keys(this.geometryLayers).map(k => this.geometryLayers[k]).forEach(layer => {
            this.map.removeLayer(layer);
        });
    }

    public clearCloroplethData() {
        Object.keys(this.geometryLayers)
            .map(key => this.geometryLayers[key])
            .forEach(geo => {
                geo.eachLayer(layer => {
                    const geolayer = layer as GeoJSON;
                    const feature = geolayer.feature as Feature<any>;
                    feature.properties.count = 0;
                    feature.properties.fraction = 0;
                    geolayer.setStyle({
                        fillColor: this.getColor(feature.properties.fraction),
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0
                    });
                });
            });
    }

    private updateChoroplethData(country) {
        if (!this.choroplethData) {
            return;
        }

        this.geometryLayers[country].eachLayer(layer => {
            const geoLayer = layer as GeoJSON;
            const feature = geoLayer.feature as Feature<any>;
            const key = feature.properties.dataKey;
            const data = this.choroplethData;

            feature.properties = { dataKey: key, name: feature.properties.name };

            feature.properties.count = data.regionCounts[key] || 0;
            feature.properties.fraction = Math.log(feature.properties.count + 1) / Math.log(data.max + 1);

            if (data.regionData) {
                feature.properties = Object.assign(feature.properties, data.regionData[key]);
            }

            geoLayer.setStyle(this.style(feature));
        });
    }

    private calcRegionType() {
        // Reset loaded geometry on region type change
        if (this.geoRegionType != this.regionType) {
            this.removeGeometry();
            this.geometryLayers = {};
        }

        this.geoRegionType = this.regionType;
        this.loadGeometry();
    }
}
