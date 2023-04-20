import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { JobPostService } from './job-post.service';
import { AuthService } from './auth.service';

import { environment } from '../../environments/environment';

describe('JobPostService', () => {
    beforeEach(() => {
        const authServiceStub = {
            canViewRegionData() { return true; },
            canViewSector() { return true; }
        };

        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [
                JobPostService,
                { provide: AuthService, useValue: authServiceStub }
            ]
        });
    });

    it('should be created', inject([JobPostService], (service: JobPostService) => {
        expect(service).toBeTruthy();
    }));

    it('should map valid date range to quarters', inject([JobPostService, HttpTestingController],
        (service: JobPostService, httpMock: HttpTestingController) => {

        // single quarter
        service.getValidQuarterRange().subscribe(({min, max}) => {
            expect(min).toEqual([2018, 1]);
            expect(max).toEqual([2018, 1]);
        });

        let req = httpMock.expectOne(`${environment.localJobsApiUrl}/valid-dates/`);
        req.flush({results: {min: '2018-01-01T00:00:00', max: '2018-03-31T00:00:00'}});

        // multiple quarters
        service.getValidQuarterRange().subscribe(({min, max}) => {
            expect(min).toEqual([2017, 3]);
            expect(max).toEqual([2018, 1]);
        });

        req = httpMock.expectOne(`${environment.localJobsApiUrl}/valid-dates/`);
        req.flush({results: {min: '2017-07-01T00:00:00', max: '2018-03-31T00:00:00'}});

        // partial quarters (min in last year)
        service.getValidQuarterRange().subscribe(({min, max}) => {
            expect(min).toEqual([2018, 1]);
            expect(max).toEqual([2018, 1]);
        });

        req = httpMock.expectOne(`${environment.localJobsApiUrl}/valid-dates/`);
        req.flush({results: {min: '2017-11-01T00:00:00', max: '2018-04-31T00:00:00'}});

        // partial quarters (max in next year)
        service.getValidQuarterRange().subscribe(({min, max}) => {
            expect(min).toEqual([2017, 4]);
            expect(max).toEqual([2017, 4]);
        });

        req = httpMock.expectOne(`${environment.localJobsApiUrl}/valid-dates/`);
        req.flush({results: {min: '2017-10-01T00:00:00', max: '2018-01-31T00:00:00'}});

        // no valid quarters
        service.getValidQuarterRange().subscribe(({min, max}) => {
            expect(min).toBeNull();
            expect(max).toBeNull();
        });

        req = httpMock.expectOne(`${environment.localJobsApiUrl}/valid-dates/`);
        req.flush({results: {min: '2018-01-01T00:00:00', max: '2018-01-31T00:00:00'}});
    }));
});
