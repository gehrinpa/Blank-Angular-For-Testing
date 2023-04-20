/* tslint:disable:no-unused-variable */

import { TestBed, async, inject, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AlertModule, PaginationModule } from 'ngx-bootstrap';
import { of as observableOf, throwError } from 'rxjs';

import { CareersCloudsComponent } from './careers-clouds.component';
import { SharedService } from '../../services/shared.service';
import { ApiService } from '../../services/api.service';
import { CareersService } from '../../services/careers.service';
import { StubJobListComponent, StubGraphMapComponent, StubTreeMapComponent } from '../../testing/stubs';

describe('Component: CareersClouds', () => {
    let component: CareersCloudsComponent;
    let fixture: ComponentFixture<CareersCloudsComponent>;
    let sharedService: SharedService;

    let getCareerCloudSpy: jasmine.Spy;
    let getJobPostingsSpy: jasmine.Spy;
    let getJobHistogramSpy: jasmine.Spy;

    beforeEach(async(() => {
        const apiServiceStub = {
            getJobPostings: () => observableOf([]),
            getJobHistogram: () => observableOf({
                histogram: {'Title': 1}
            })
        };
        const careersServiceStub = {
            getCareerCloud: p => observableOf({
                title_names: ['Title'],
                title_counts: [1]
            })
        };

        getCareerCloudSpy = spyOn(careersServiceStub, 'getCareerCloud').and.callThrough();
        getJobPostingsSpy = spyOn(apiServiceStub, 'getJobPostings').and.callThrough();
        getJobHistogramSpy = spyOn(apiServiceStub, 'getJobHistogram').and.callThrough();

        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                NoopAnimationsModule,
                AlertModule.forRoot(),
                PaginationModule.forRoot()
            ],
            providers: [
                SharedService,
                { provide: ApiService, useValue: apiServiceStub },
                { provide: CareersService, useValue: careersServiceStub }
            ],
            declarations: [
                CareersCloudsComponent,
                StubGraphMapComponent,
                StubJobListComponent,
                StubTreeMapComponent
            ]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CareersCloudsComponent);
        sharedService = TestBed.get(SharedService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // TODO: validate that the correct params are passed

    it('should update data on search', () => {
        sharedService.setItems('company1', 'company2', 'company');

        // two clouds
        expect(getCareerCloudSpy.calls.count()).toBe(2, 'get cloud');
        expect(getJobPostingsSpy.calls.count()).toBe(2, 'get jobs');
        expect(getJobHistogramSpy.calls.count()).toBe(2, 'get job histogram');
    });

    it('should update job data on treemap selection', () => {
        sharedService.setItems('company1', 'company2', 'company');
        component.onTreemapSelect(1, [{row: 1}]);

        // initial load for both clouds + update
        expect(getJobPostingsSpy.calls.count()).toBe(3, 'get jobs');
        expect(getJobHistogramSpy.calls.count()).toBe(3, 'get job histogram');
    });

    it('should update job data on page change', () => {
        sharedService.setItems('company1', 'company2', 'company');
        component.jobPageChanged(1, {page: 2});

        // initial load for both clouds + update
        expect(getJobPostingsSpy.calls.count()).toBe(3, 'get jobs');
        expect(getJobHistogramSpy.calls.count()).toBe(3, 'get job histogram');
    });
});
