import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertModule, TypeaheadModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { of as observableOf } from 'rxjs';
import XLSX from 'xlsx';

import { WorkforcePlanEditComponent, JobRow } from './workforce-plan-edit.component';

import { CourseService } from '../../services/course.service';
import { WorkforcePlanService, WorkforcePlanStatus, WorkforcePlanType, WorkforcePlanResult } from '../../services/workforce-plan.service';

import { StubRequestProgressIndicatorComponent } from '../../testing/stubs';
import { RouterLinkStubDirective } from '../../testing/router-stubs';

const emptyRow: JobRow = {
    id: 0,
    functionalArea: '',
    title: '',
    jobSpec: '',
    jobFamily: '',
    skills: [],

    currentHeadcount: 0,
    year1Headcount: 0,
    year2Headcount: 0,
    year3Headcount: 0,
    forecastAttrition: 0,

    internal: 0,
    apprentice: 0,
    graduate: 0,
    experienced: 0,
    contract: 0
};

const mockPlan: WorkforcePlanResult = {
    id: 1,
    name: 'Plan',
    status: WorkforcePlanStatus.Live,
    type: WorkforcePlanType.Plan,
    sectorId: 1,
    sectorName: 'A Sector',
    dateCreated: '2018-01-01'
};

describe('WorkforcePlanEditComponent', () => {
    let component: WorkforcePlanEditComponent;
    let fixture: ComponentFixture<WorkforcePlanEditComponent>;

    let workforcePlanCreateRoleSpy: jasmine.Spy;
    let workforcePlanUpdateRoleSpy: jasmine.Spy;

    beforeEach(async(() => {
        const activatedRouteStub = {
            paramMap : observableOf()
        };

        const courseServiceStub = {
            searchCourseSkills(text) {
                return observableOf([{name: 'A Skill'}]);
            }
        };

        const workforcePlanServiceStub = {
            listRolesForPlan: () => observableOf([
                {title: 'Title A', functionalArea: 'Area A'},
                {title: 'Title B', functionalArea: 'Area 51'},
                {title: 'Title C', functionalArea: 'Area A'}
            ]),
            list: () => observableOf([
                {planId: 1}
            ]),

            createRole: d => observableOf(d),
            update: (id, d) => observableOf(d),
            updateRole: (id, d) => observableOf(d)
        };

        workforcePlanCreateRoleSpy = spyOn(workforcePlanServiceStub, 'createRole').and.callThrough();
        workforcePlanUpdateRoleSpy = spyOn(workforcePlanServiceStub, 'updateRole').and.callThrough();

        TestBed.configureTestingModule({
            declarations: [
                RouterLinkStubDirective,
                WorkforcePlanEditComponent,
                StubRequestProgressIndicatorComponent
            ],
            imports: [
                FormsModule,
                AlertModule.forRoot(),
                TypeaheadModule.forRoot(),
                NgSelectModule
            ],
            providers: [
                {provide: ActivatedRoute, useValue: activatedRouteStub},
                {provide: CourseService, useValue: courseServiceStub},
                {provide: WorkforcePlanService, useValue: workforcePlanServiceStub}
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WorkforcePlanEditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should setup skill typeahead correctly', fakeAsync(() => {
        let skills = null;
        component.skillItems.subscribe(s => skills = s);

        // initial value
        expect(skills).toEqual([]);

        component.skillSubject.next('skill');

        // debounce
        tick(200);
        expect(skills).toEqual(['A Skill']);
    }));

    // TODO: on load?
    /*it('should load data on company change', () => {
        component.areas = [];
        component.companySelected({item: {id: 1, name: 'Company A'}} as any);

        expect(component.areas.length).toBe(2);
        expect(component.areas[0].roles.length).toBe(2);
        expect(component.areas[1].roles.length).toBe(1);
    });*/

    it('should validate row on change', () => {
        // invalid
        const rowA: JobRow = Object.assign({}, emptyRow);
        rowA.year3Headcount = 10;
        rowA.title = 'Role A';

        // valid
        const rowC: JobRow = Object.assign({}, emptyRow);
        rowC.year3Headcount = 11;
        rowC.apprentice = 5;
        rowC.graduate = 1;
        rowC.experienced = 3;
        rowC.contract = 2;
        rowC.title = 'Role C';

        component.rowChanged(rowA);
        expect(rowA.modified).toBeTruthy('row should be marked as modified');
        expect(rowA.errors).not.toBeNull('first row should have one error');
        expect(rowA.errors.length).toBe(1, 'first row should have one error');

        component.rowChanged(rowC);
        expect(rowC.modified).toBeTruthy('row should be marked as modified');
        expect(rowC.errors).toBeNull('third row should have no errors');
    });

    it('should calculate totals', () => {
        // valid
        const row: JobRow = Object.assign({}, emptyRow);
        row.currentHeadcount = 1;
        row.year1Headcount = 2;
        row.year2Headcount = 3;
        row.year3Headcount = 4;
        row.forecastAttrition = 5;

        const area = {
            name: 'Area',
            roles: [row, row, row]
        };

        expect(component.calcTotal(area, 'currentHeadcount')).toBe(3);
        expect(component.calcTotal(area, 'year3Headcount')).toBe(12);
        expect(component.calcTotal(area, 'netChange')).toBe(9); // (4 - 1) * 3
        expect(component.calcTotal(area, 'totalHiringDemand')).toBe(24); // ((4 - 1) + 5) * 3
    });

    it('should export a speadsheet', () => {
        const rowA: JobRow = Object.assign({}, emptyRow);
        rowA.id = 1;

        const rowB: JobRow = Object.assign({}, emptyRow);
        rowB.id = 2;
        rowB.year3Headcount = 11;
        rowB.apprentice = 5;
        rowB.graduate = 1;
        rowB.experienced = 3;
        rowB.contract = 2;
        rowB.title = 'Role';

        component.selectedPlan = mockPlan;
        component.areas = [
            {
                name: 'Area A',
                roles: [rowA, rowB]
            },
            {
                name: 'Area B',
                roles: [rowA]
            }
        ];

        const spy = spyOn(XLSX, 'writeFile').and.callFake((workbook, filename) => {
            expect(workbook.SheetNames.length).toBe(1);

            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            // valid range
            expect(sheet['!ref']).toBe('A1:Q9');

            let row = 1;

            for (const area of component.areas) {
                const areaNameCell = XLSX.utils.encode_cell({r: row, c: 1});
                const areaTotalCell = XLSX.utils.encode_cell({r: row + area.roles.length + 1, c: 1});

                expect(sheet[areaNameCell].v).toBe(area.name);
                expect(sheet[areaTotalCell].v).toBe('Sub Total ' + area.name);

                row += area.roles.length + 3;
            }

        });

        component.exportSpreadsheet();
        expect(spy.calls.count()).toBe(1, 'writeFile should be called once');
    });

    it('should not save if there are invalid rows', () => {
        // invalid
        const invalidRow: JobRow = Object.assign({}, emptyRow);
        invalidRow.id = 1;
        invalidRow.year3Headcount = 10;
        invalidRow.title = 'Bad Role';
        invalidRow.modified = true;

        // valid
        const validRow: JobRow = Object.assign({}, emptyRow);
        validRow.id = 2;
        validRow.year3Headcount = 11;
        validRow.apprentice = 5;
        validRow.graduate = 1;
        validRow.experienced = 3;
        validRow.contract = 2;
        validRow.title = 'Good Role';
        validRow.modified = true;

        component.areas = [
            {
                name: 'Area',
                roles: [validRow, invalidRow]
            }
        ];

        component.saveChanges();

        expect(workforcePlanUpdateRoleSpy.calls.count()).toBe(0);
    });

    it('should only save modified rows', () => {
        // invalid
        const invalidRow: JobRow = Object.assign({}, emptyRow);
        invalidRow.id = 1;
        invalidRow.year3Headcount = 10;
        invalidRow.title = 'Bad Role';
        invalidRow.modified = false;

        // valid
        const validRow: JobRow = Object.assign({}, emptyRow);
        validRow.id = 2;
        validRow.year3Headcount = 11;
        validRow.apprentice = 5;
        validRow.graduate = 1;
        validRow.experienced = 3;
        validRow.contract = 2;
        validRow.title = 'Good Role';
        validRow.modified = true;

        component.areas = [
            {
                name: 'Area',
                roles: [validRow, invalidRow]
            }
        ];

        component.selectedPlan = mockPlan;

        component.saveChanges();

        expect(workforcePlanUpdateRoleSpy.calls.count()).toBe(1);
    });

    it('should create rows without an id', () => {
        const validRow: JobRow = Object.assign({}, emptyRow);
        validRow.id = 0;
        validRow.year3Headcount = 11;
        validRow.apprentice = 5;
        validRow.graduate = 1;
        validRow.experienced = 3;
        validRow.contract = 2;
        validRow.title = 'Good Role';
        validRow.modified = true;

        component.areas = [
            {
                name: 'Area',
                roles: [validRow]
            }
        ];

        component.selectedPlan = mockPlan;

        component.saveChanges();

        expect(workforcePlanCreateRoleSpy.calls.count()).toBe(1);
        expect(workforcePlanUpdateRoleSpy.calls.count()).toBe(0);
    });
});
