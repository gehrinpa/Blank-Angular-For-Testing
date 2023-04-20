/* tslint:disable:no-unused-variable */

import { TestBed, async, inject, ComponentFixture } from '@angular/core/testing';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { MapComponent } from './map.component';

import { ApiService } from '../../services/api.service';
import { GeodataService } from '../../services/geodata.service';
import { SharedService } from '../../services/shared.service';

describe('Component: Map', () => {
    let component: MapComponent;
    let fixture: ComponentFixture<MapComponent>;

    beforeEach(async(() => {
        const apiServiceStub = {};
        const geodataServiceStub = {};
        const sharedServiceStub = {};

        TestBed.configureTestingModule({
            declarations: [MapComponent],
            imports: [
                LeafletModule
            ],
            providers: [
                { provide: ApiService, useValue: apiServiceStub },
                { provide: GeodataService, useValue: geodataServiceStub },
                { provide: SharedService, useValue: sharedServiceStub }
            ]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
