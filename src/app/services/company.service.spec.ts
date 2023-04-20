import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CompanyService, CompanyResult } from './company.service';

import { environment } from '../../environments/environment';

describe('CompanyService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CompanyService]
        });
    });

    it('should be created', inject([CompanyService], (service: CompanyService) => {
        expect(service).toBeTruthy();
    }));

    it('should send correct params for list', inject([CompanyService, HttpTestingController],
        (service: CompanyService, httpMock: HttpTestingController) => {

        service.list().subscribe(courses => {
            expect(courses[0].name).toBe('Test Company');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/company/`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: [{name: 'Test Company', id: 1}]});

        httpMock.verify();
    }));

    it('should send correct params for search', inject([CompanyService, HttpTestingController],
        (service: CompanyService, httpMock: HttpTestingController) => {

        service.search('TEST').subscribe(courses => {
            expect(courses[0].name).toBe('Test Company');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/company/search?text=TEST`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: [{name: 'Test Company', id: 1}]});

        httpMock.verify();
    }));

    it('should send correct params for company create', inject([CompanyService, HttpTestingController],
        (service: CompanyService, httpMock: HttpTestingController) => {

        const update: Partial<CompanyResult> = {name: 'New Title'};

        service.create(update).subscribe(plan => {
            expect(plan.name).toBe('New Company');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/company`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(update);

        req.flush({data: {name: 'New Company', id: 42}});

        httpMock.verify();
    }));
});
