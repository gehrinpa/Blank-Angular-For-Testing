/* tslint:disable:no-unused-variable */

import { TestBed, async, inject, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AlertModule } from 'ngx-bootstrap';

import { StaffJoinersGraphComponent } from './staff-joiners-graph.component';

import { ApiService } from '../../services/api.service';
import { SharedService } from '../../services/shared.service';

import { StubGraphMapComponent } from '../../testing/stubs';

describe('Component: StaffAttrition', () => {
    let component: StaffJoinersGraphComponent;
    let fixture: ComponentFixture<StaffJoinersGraphComponent>;

    beforeEach(async(() => {
        const apiServiceStub = {};

        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                NoopAnimationsModule,
                AlertModule.forRoot(),
            ],
            providers: [
                SharedService,
                { provide: ApiService, useValue: apiServiceStub }
            ],
            declarations: [
                StaffJoinersGraphComponent,
                StubGraphMapComponent
            ]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StaffJoinersGraphComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
