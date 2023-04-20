import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { SectorService, SectorResult } from './sector.service';

import { environment } from '../../environments/environment';

describe('SectorService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [SectorService]
        });
    });

    it('should be created', inject([SectorService], (service: SectorService) => {
        expect(service).toBeTruthy();
    }));

    it('should send correct params for list', inject([SectorService, HttpTestingController],
        (service: SectorService, httpMock: HttpTestingController) => {

        service.list().subscribe(courses => {
            expect(courses[0].name).toBe('Test Sector');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/sector/`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: [{name: 'Test Sector', id: 1}]});

        httpMock.verify();
    }));

    it('should send correct params for search', inject([SectorService, HttpTestingController],
        (service: SectorService, httpMock: HttpTestingController) => {

        service.search('TEST').subscribe(courses => {
            expect(courses[0].name).toBe('Test Sector');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/sector/search?text=TEST`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: [{name: 'Test Sector', id: 1}]});

        httpMock.verify();
    }));

    it('should send correct params for sector create', inject([SectorService, HttpTestingController],
        (service: SectorService, httpMock: HttpTestingController) => {

        const update: Partial<SectorResult> = {name: 'New Title'};

        service.create(update).subscribe(plan => {
            expect(plan.name).toBe('New Sector');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/sector`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(update);

        req.flush({data: {name: 'New Sector', id: 42}});

        httpMock.verify();
    }));
});
