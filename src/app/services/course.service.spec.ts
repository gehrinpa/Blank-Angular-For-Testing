import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CourseService, CourseResult } from './course.service';

import { environment } from '../../environments/environment';

describe('CourseService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CourseService],
            imports: [HttpClientTestingModule]
        });
    });

    it('should be created', inject([CourseService], (service: CourseService) => {
        expect(service).toBeTruthy();
    }));

    it('should send correct params for get', inject([CourseService, HttpTestingController],
        (service: CourseService, httpMock: HttpTestingController) => {

        service.get(42).subscribe(course => {
            expect(course.title).toBe('Test Course');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/course/42`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: {title: 'Test Course', id: 42}});

        httpMock.verify();
    }));

    it('should send correct params for course search', inject([CourseService, HttpTestingController],
        (service: CourseService, httpMock: HttpTestingController) => {

        service.search('TEST').subscribe(courses => {
            expect(courses[0].title).toBe('Test Course A');
        });

        let req = httpMock.expectOne(`${environment.apiUrl}/api/course/search?text=TEST`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: [{title: 'Test Course A', id: 1}]});

        // with provider id
        service.search('TEST', 42).subscribe(courses => {
            expect(courses[0].title).toBe('Test Course B');
        });

        req = httpMock.expectOne(`${environment.apiUrl}/api/course/search?text=TEST&providerId=42`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: [{title: 'Test Course B', id: 1}]});

        httpMock.verify();
    }));

    it('should send correct params for provider search', inject([CourseService, HttpTestingController],
        (service: CourseService, httpMock: HttpTestingController) => {

        service.searchProviders('TEST').subscribe(courses => {
            expect(courses[0].name).toBe('Test Provider');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/courseProvider/search?text=TEST`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: [{name: 'Test Provider', id: 1}]});

        httpMock.verify();
    }));

    it('should send correct params for skill search', inject([CourseService, HttpTestingController],
        (service: CourseService, httpMock: HttpTestingController) => {

        service.searchCourseSkills('TEST').subscribe(courses => {
            expect(courses[0].name).toBe('Test Skill');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/skill/search?text=TEST`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: [{name: 'Test Skill', id: 1}]});

        httpMock.verify();
    }));

    it('should send correct params for persona list', inject([CourseService, HttpTestingController],
        (service: CourseService, httpMock: HttpTestingController) => {

        service.listCoursePersonas('TEST').subscribe(courses => {
            expect(courses[0].name).toBe('Test Persona');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/coursePersona?courseTypeKey=TEST`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: [{name: 'Test Persona', id: 1}]});

        httpMock.verify();
    }));

    it('should send correct params for role list', inject([CourseService, HttpTestingController],
        (service: CourseService, httpMock: HttpTestingController) => {

        service.listCourseRoles('TEST').subscribe(courses => {
            expect(courses[0].name).toBe('Test Role');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/courseRole?courseTypeKey=TEST`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: [{name: 'Test Role', id: 1}]});

        httpMock.verify();
    }));

    it('should send correct params for course list at provider', inject([CourseService, HttpTestingController],
        (service: CourseService, httpMock: HttpTestingController) => {

        service.listAtProvider(42).subscribe(courses => {
            expect(courses[0].title).toBe('Test Course A');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/course/atProvider/42`);
        expect(req.request.method).toEqual('GET');

        req.flush({data: [{title: 'Test Course A', id: 1}]});

        httpMock.verify();
    }));

    it('should send correct params for course create', inject([CourseService, HttpTestingController],
        (service: CourseService, httpMock: HttpTestingController) => {

        const update: Partial<CourseResult> = {title: 'New Title'};
        const patch = [{op: 'replace', path: '/title', value: 'New Title'}];

        service.create(update).subscribe(course => {
            expect(course.title).toBe('New Title');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/course`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(update);

        req.flush({data: {title: 'New Title', id: 42}});

        httpMock.verify();
    }));

    it('should send correct params for course update', inject([CourseService, HttpTestingController],
        (service: CourseService, httpMock: HttpTestingController) => {

        const update: Partial<CourseResult> = {title: 'New Title'};
        const patch = [{op: 'replace', path: '/title', value: 'New Title'}];

        service.update(42, update).subscribe(course => {
            expect(course.title).toBe('New Title');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/api/course/42`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(patch);

        req.flush({data: {title: 'New Title', id: 42}});

        httpMock.verify();
    }));
});
