import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ButtonsModule } from 'ngx-bootstrap';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { of as observableOf } from 'rxjs';

import { CourseService } from '../../services/course.service';
import { JobPostService } from '../../services/job-post.service';
import { SalaryService } from '../../services/salary.service';
import { SectorService } from '../../services/sector.service';
import { WorkforcePlanService, WorkforcePlanStatus } from '../../services/workforce-plan.service';

import { EnquiryDashboardComponent } from './enquiry-dashboard.component';
import { StubRequestProgressIndicatorComponent } from '../../testing/stubs';
import { EducationLevelWidgetComponent } from '../education-level-widget/education-level-widget.component';
import { SalaryWidgetComponent } from '../salary-widget/salary-widget.component';
import { TitleCountWidgetComponent } from '../title-count-widget/title-count-widget.component';

describe('EnquiryDashboardComponent', () => {
    let component: EnquiryDashboardComponent;
    let fixture: ComponentFixture<EnquiryDashboardComponent>;

    beforeEach(async(() => {
        const courseServiceStub = {
            getEnrollmentByLevel: () => observableOf({})
        };

        const jobPostServiceStub = {};
        const salaryServiceStub = {};

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
                {id: 1, status: WorkforcePlanStatus.Live, targetDate: null}
            ]),

            listDistinctJobFamilies: () => observableOf([])
        };

        TestBed.configureTestingModule({
            declarations: [
                EnquiryDashboardComponent,
                StubRequestProgressIndicatorComponent,
                EducationLevelWidgetComponent,
                SalaryWidgetComponent,
                TitleCountWidgetComponent,
            ],
            imports: [
                FormsModule,
                NoopAnimationsModule,
                ButtonsModule.forRoot(),
                TypeaheadModule.forRoot(),
                NgxChartsModule
            ],
            providers: [
                {provide: CourseService, useValue: courseServiceStub},
                {provide: JobPostService, useValue: jobPostServiceStub},
                {provide: SalaryService, useValue: salaryServiceStub},
                {provide: SectorService, useValue: sectorServiceStub},
                {provide: WorkforcePlanService, useValue: workforcePlanServiceStub}
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EnquiryDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
