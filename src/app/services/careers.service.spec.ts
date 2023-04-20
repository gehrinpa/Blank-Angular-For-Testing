import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CareersService } from './careers.service';
import { SearchParameters } from '../shared';
import { environment } from '../../environments/environment';

describe('CareersService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CareersService],
            imports: [HttpClientTestingModule]
        });
    });

    it('should be created', inject([CareersService], (service: CareersService) => {
        expect(service).toBeTruthy();
    }));

    it('should send correct params for list', inject([CareersService, HttpTestingController],
        (service: CareersService, httpMock: HttpTestingController) => {

        service.list().subscribe(careers => {
            expect(careers[0].title).toBe('Test Career');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/career/`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: [{title: 'Test Career', id: 1}]});

        httpMock.verify();
    }));

    it('should send correct params for career cloud', inject([CareersService, HttpTestingController],
        (service: CareersService, httpMock: HttpTestingController) => {

        const company = 'CompanyName.website';
        const searchParams: SearchParameters = { company };

        service.getCareerCloud(searchParams).subscribe(data => {});

        // const req = httpMock.expectOne(`${environment.analyticsUrl}/careercloud`);
        const req = httpMock.expectOne(r => r.url == `${environment.analyticsUrl}/careercloud`);

        expect(req.request.params.get('query')).toBe(`+current_company_l:"${company}"`);
        expect(req.request.params.get('nuts')).toBe('UK');
        req.flush({});

        httpMock.verify();
    }));

    it('should send correct params for career chart', inject([CareersService, HttpTestingController],
        (service: CareersService, httpMock: HttpTestingController) => {

        const company = 'CompanyName.website';
        const searchParams: SearchParameters = { company, regionCode: 'UKC' };

        service.getCareersBarChartData(searchParams).subscribe(data => {});

        // const req = httpMock.expectOne(`${environment.analyticsUrl}/careercloud`);
        const req = httpMock.expectOne(r => r.url == `${environment.analyticsUrl}/careercloud`);

        expect(req.request.params.get('query')).toBe(`+current_company_l:"${company}"`);
        expect(req.request.params.get('nuts')).toBe('UKC');
        // expect(req.request.params.get('rank')).toBe('rawfreq');
        req.flush({});

        httpMock.verify();
    }));
});
