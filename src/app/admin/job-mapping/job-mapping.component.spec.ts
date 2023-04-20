import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { of as observableOf} from 'rxjs';

import { JobMappingComponent } from './job-mapping.component';

import { StubRequestProgressIndicatorComponent } from '../../testing/stubs';

import { CareersService } from '../../services/careers.service';
import { CompanyService } from '../../services/company.service';
import { SectorService } from '../../services/sector.service';
import { WorkforcePlanService } from '../../services/workforce-plan.service';

describe('JobMappingComponent', () => {
    let component: JobMappingComponent;
    let fixture: ComponentFixture<JobMappingComponent>;

    beforeEach(async(() => {
        const careerServiceStub = {
            list() {
                return observableOf([
                    {id: 1, title: 'Career A'}
                ]);
            }
        };

        const companyServiceStub = {
            search(text) {
                return observableOf([
                    {id: 1, name: 'Company A'}
                ].filter(c => text != '' && c.name.toLowerCase().includes(text)));
            }
        };

        const sectorServiceStub = {
            search(text) {
                return observableOf([
                    {id: 1, name: 'Sector A'}
                ].filter(c => text != '' && c.name.toLowerCase().includes(text)));
            }
        };

        const workforcePlanServiceStub = {};

        TestBed.configureTestingModule({
            declarations: [
                JobMappingComponent,
                StubRequestProgressIndicatorComponent
            ],
            imports: [
                FormsModule,
                TypeaheadModule.forRoot()
            ],
            providers: [
                {provide: CareersService, useValue: careerServiceStub},
                {provide: CompanyService, useValue: companyServiceStub},
                {provide: SectorService, useValue: sectorServiceStub},
                {provide: WorkforcePlanService, useValue: workforcePlanServiceStub}
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JobMappingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
