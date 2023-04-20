import { Component, OnChanges, OnInit, NgZone } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Feature } from 'geojson';
import { Control, control, FeatureGroup, GeoJSON, geoJSON, Layer, LeafletEvent, Map, tileLayer } from 'leaflet';
import { RegionType } from 'src/app/shared';
import { GeoDataResult, GeodataService, RegionBoundsResult } from './../../services/geodata.service';

@Component({
  selector: 'app-location-chooser-map',
  templateUrl: './location-chooser-map.component.html',
  styleUrls: ['./location-chooser-map.component.scss']
})
export class LocationChooserMapComponent implements OnInit, OnChanges {

  regionTypes = RegionType;
  public regionType = RegionType.NUTS3;

  private map: Map;

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

  private countryBounds: RegionBoundsResult = null;
  private choroplethData: GeoDataResult = null;
  private geometryLayers: { [id: string]: GeoJSON } = {};
  private mapClicked = 0;

  constructor(private _geodataService: GeodataService,
    private dialogRef: MatDialogRef<LocationChooserMapComponent>,
    private zone: NgZone) { }

  ngOnChanges(): void {
    this.loadGeometry();
  }

  ngOnInit() {
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

    // Load gemometry bounds
    this._geodataService.getRegionBounds().subscribe(data => {
      this.countryBounds = data;
      this.loadGeometry();
    });

    // update loaded geometry on map move/zoom
    this.map.on('moveend', () => this.loadGeometry());
    this.map.on('zoomend', () => this.loadGeometry());
  }

  public regionTypeChanged() {
    this.removeGeometry();
    this.loadGeometry();
  }

  private removeGeometry() {
    // remove layers
    Object.keys(this.geometryLayers).map(k => this.geometryLayers[k]).forEach(layer => {
        this.map.removeLayer(layer);
    });

    this.geometryLayers = {};
}

  private loadGeometry() {
    if (!this.countryBounds) {
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

  private onEachFeature(feature, layer: Layer) {
    layer.on({
      click: (e) => this.onFeatureClick(e),
      dblclick: (e) => this.onFeatureDoubleClick(e),
      mouseover: (e) => this.onFeatureHover(e),
      mouseout: (e) => this.onFeatureHoverOut(e)
    });
  }

  private onFeatureClick(e: LeafletEvent) {
    this.mapClicked += 1;
    setTimeout(() => {
      if (this.mapClicked == 1) {
        this.mapClicked = 0;
        const layer = e.target;
        layer.bringToFront();

        this.zone.run(() => this.dialogRef.close({ regionType: this.regionType, ...layer.feature.properties }));
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

  private style(feature) {
    const fillColor = '#7f7f7f';
    return {
      fillColor: fillColor,
      weight: 2,
      opacity: 1,
      color: fillColor,
      dashArray: '3',
      fillOpacity: .5
    };
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

}
