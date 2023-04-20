import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TypeaheadModule, BsModalService, ModalModule, TooltipModule } from 'ngx-bootstrap';
import { of as observableOf } from 'rxjs';

import { WorkforcePlanListComponent } from './workforce-plan-list.component';

import { CompanyService } from '../../services/company.service';
import { SectorService } from '../../services/sector.service';
import { WorkforcePlanService } from '../../services/workforce-plan.service';

import { StubRequestProgressIndicatorComponent } from '../../testing/stubs';
import { RouterLinkStubDirective } from '../../testing/router-stubs';

describe('WorkforcePlanListComponent', () => {
    let component: WorkforcePlanListComponent;
    let fixture: ComponentFixture<WorkforcePlanListComponent>;
    let modalShowSpy: jasmine.Spy;

    let companyCreateSpy: jasmine.Spy;

    beforeEach(async(() => {
        const companyServiceStub = {
            search(text) {
                return observableOf([
                    {id: 1, name: 'Company A'}
                ].filter(c => text != '' && c.name.toLowerCase().includes(text)));
            },
            create: d => observableOf(Object.assign({id: 1}, d)),
        };

        const sectorServiceStub = {
            list(text) {
                return observableOf([
                    {id: 1, name: 'Sector A'}
                ]);
            },
            search(text) {
                return observableOf([
                    {id: 1, name: 'Sector A'}
                ].filter(c => text != '' && c.name.toLowerCase().includes(text)));
            },
            create: d => observableOf(Object.assign({id: 1}, d)),
        };

        const workforcePlanServiceStub = {
            list: () => observableOf([
                {planId: 1}
            ])
        };

        companyCreateSpy = spyOn(companyServiceStub, 'create').and.callThrough();

        TestBed.configureTestingModule({
            declarations: [
                RouterLinkStubDirective,
                WorkforcePlanListComponent,
                StubRequestProgressIndicatorComponent
            ],
            imports: [
                FormsModule,
                ModalModule.forRoot(),
                TooltipModule.forRoot(),
                TypeaheadModule.forRoot()
            ],
            providers: [
                {provide: CompanyService, useValue: companyServiceStub},
                {provide: SectorService, useValue: sectorServiceStub},
                {provide: WorkforcePlanService, useValue: workforcePlanServiceStub}
            ]
        })
        .compileComponents();

        // modal spy
        const modalService = TestBed.get(BsModalService);
        modalShowSpy = spyOn(modalService, 'show').and.callThrough();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WorkforcePlanListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should setup company typeahead correctly', () => {
        component.companyTypeahead.subscribe(results => {
            expect(results).toEqual([]);
        });

        component.companyFilterText = 'comp';
        component.companyTypeahead.subscribe(results => {
            expect(results).toEqual([{id: 1, name: 'Company A'}]);
        });
    });

    it('should create company on company save', () => {
        const form: any = {
            value: {
                name: 'New Company'
            }
        };

        // show the modal
        const createCompanyBtn = fixture.nativeElement.querySelector(".card .btn:first-child");
        createCompanyBtn.click();
        expect(modalShowSpy.calls.count()).toBe(1);

        component.createCompanySubmit(form);

        expect(companyCreateSpy.calls.count()).toBe(1);
        // expect(component.selectedCompany.name).toBe(form.value.name);
    });
});
