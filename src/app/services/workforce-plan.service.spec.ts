import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { WorkforcePlanService, WorkforcePlanResult, WorkforcePlanRoleResult } from './workforce-plan.service';
import { environment } from '../../environments/environment';

describe('WorkforcePlanService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [WorkforcePlanService]
        });
    });

    it('should be created', inject([WorkforcePlanService], (service: WorkforcePlanService) => {
        expect(service).toBeTruthy();
    }));

    it('should send correct params for get', inject([WorkforcePlanService, HttpTestingController],
        (service: WorkforcePlanService, httpMock: HttpTestingController) => {

        service.get(42).subscribe(plan => {
            expect(plan.companyId).toBe(1);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/workforcePlan/42`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: {companyId: 1, id: 42}});

        httpMock.verify();
    }));

    it('should send correct params for getRole', inject([WorkforcePlanService, HttpTestingController],
        (service: WorkforcePlanService, httpMock: HttpTestingController) => {

        service.getRole(42).subscribe(plan => {
            expect(plan.title).toBe('Test Title');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/workforcePlanRole/42`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: {title: 'Test Title', id: 42}});

        httpMock.verify();
    }));

    it('should send correct params for plan list', inject([WorkforcePlanService, HttpTestingController],
        (service: WorkforcePlanService, httpMock: HttpTestingController) => {

        service.list(null).subscribe(plans => {
            expect(plans[0].id).toBe(1);
        });

        let req = httpMock.expectOne(`${environment.apiUrl}/api/workforcePlan/`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: [{id: 1}]});

        // sector
        service.list(42).subscribe(plans => {
            expect(plans[0].id).toBe(1);
        });

        req = httpMock.expectOne(`${environment.apiUrl}/api/workforcePlan/?sector=42`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: [{id: 1}]});

        httpMock.verify();

        // company
        service.list(null, 42).subscribe(plans => {
            expect(plans[0].id).toBe(1);
        });

        req = httpMock.expectOne(`${environment.apiUrl}/api/workforcePlan/?company=42`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: [{id: 1}]});

        httpMock.verify();
    }));

    it('should send correct params for plan create', inject([WorkforcePlanService, HttpTestingController],
        (service: WorkforcePlanService, httpMock: HttpTestingController) => {

        const update: Partial<WorkforcePlanResult> = {companyId: 10};

        service.create(update).subscribe(plan => {
            expect(plan.companyId).toBe(10);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/workforcePlan`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(update);

        req.flush({data: {companyId: 10, id: 42}});

        httpMock.verify();
    }));

    it('should send correct params for plan role create', inject([WorkforcePlanService, HttpTestingController],
        (service: WorkforcePlanService, httpMock: HttpTestingController) => {

        const update: Partial<WorkforcePlanRoleResult> = {title: 'New Title'};

        service.createRole(update).subscribe(plan => {
            expect(plan.title).toBe('New Title');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/workforcePlanRole`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(update);

        req.flush({data: {title: 'New Title', id: 42}});

        httpMock.verify();
    }));

    it('should send correct params for plan update', inject([WorkforcePlanService, HttpTestingController],
        (service: WorkforcePlanService, httpMock: HttpTestingController) => {

        const update: Partial<WorkforcePlanResult> = {companyId: 10};
        const patch = [{op: 'replace', path: '/companyId', value: 10}];

        service.update(42, update).subscribe(plan => {
            expect(plan.companyId).toBe(10);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/workforcePlan/42`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(patch);

        req.flush({data: {companyId: 10, id: 42}});

        httpMock.verify();
    }));

    it('should send correct params for plan role update', inject([WorkforcePlanService, HttpTestingController],
        (service: WorkforcePlanService, httpMock: HttpTestingController) => {

        const update: Partial<WorkforcePlanRoleResult> = {title: 'New Title'};
        const patch = [{op: 'replace', path: '/title', value: 'New Title'}];

        service.updateRole(42, update).subscribe(plan => {
            expect(plan.title).toBe('New Title');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/workforcePlanRole/42`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(patch);

        req.flush({data: {title: 'New Title', id: 42}});

        httpMock.verify();
    }));

    it('should send correct params for plan copy', inject([WorkforcePlanService, HttpTestingController],
        (service: WorkforcePlanService, httpMock: HttpTestingController) => {

        service.copyFromCompany(1, 2).subscribe(plan => {
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/workforcePlan/copy?fromCompany=1&toCompany=2`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({});

        req.flush({});

        httpMock.verify();
    }));
});
