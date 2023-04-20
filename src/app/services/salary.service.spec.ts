import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { SalaryService, SalaryPeriod } from './salary.service';
import { SearchParameters, RegionType } from '../shared';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

describe('SalaryService', () => {
    beforeEach(() => {
        const authServiceStub = {
            canViewSector() { return true; }
        };
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [
                SalaryService,
                { provide: AuthService, useValue: authServiceStub }
            ]
        });
    });

    it('should be created', inject([SalaryService], (service: SalaryService) => {
        expect(service).toBeTruthy();
    }));

    it('should correctly format dates for job salaries', inject([SalaryService, HttpTestingController],
        (service: SalaryService, httpMock: HttpTestingController) => {

        const searchParams: SearchParameters = {
            regionType: RegionType.NUTS1,
            startDate: new Date(Date.UTC(1993, 5, 26)),
            endDate: new Date(1995, 2, 8),
        };

        service.getJobSalaries(searchParams, SalaryPeriod.Year).subscribe(data => {});

        const req = httpMock.expectOne(r => {
            return r.url == `${environment.localJobsApiUrl}/salaries/`;
        });

        expect(req.request.params.get('start_date')).toBe('1993-06-26');
        expect(req.request.params.get('end_date')).toBe('1995-03-08');
        req.flush({});

        httpMock.verify();
      }));
});
