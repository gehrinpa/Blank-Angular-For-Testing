/* tslint:disable:no-unused-variable */

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { GraphMapComponent } from './graph-map.component';

describe('Component: GraphMap', () => {
    let component: GraphMapComponent;
    let fixture: ComponentFixture<GraphMapComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NgxChartsModule
            ],
            declarations: [GraphMapComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GraphMapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
