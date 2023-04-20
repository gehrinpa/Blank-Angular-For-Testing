import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { ButtonsModule } from 'ngx-bootstrap';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { of as observableOf } from 'rxjs';

import { CourseService } from '../../services/course.service';
import { JobPostService } from '../../services/job-post.service';
import { SalaryService } from '../../services/salary.service';
import { SectorService } from '../../services/sector.service';
import { WorkforcePlanService } from '../../services/workforce-plan.service';

import { EducationLevelWidgetComponent } from '../education-level-widget/education-level-widget.component';
import { SalaryWidgetComponent } from '../salary-widget/salary-widget.component';
import { TitleCountWidgetComponent } from '../title-count-widget/title-count-widget.component';

import { WorkforcePlanDashboardComponent } from './workforce-plan-dashboard.component';

import { RouterLinkStubDirective } from '../../testing/router-stubs';
import { StubRequestProgressIndicatorComponent } from '../../testing/stubs';

describe('WorkforcePlanDashboardComponent', () => {
    let component: WorkforcePlanDashboardComponent;
    let fixture: ComponentFixture<WorkforcePlanDashboardComponent>;

    beforeEach(async(() => {
        const activatedRouteStub = {
            paramMap: observableOf()
        };

        const courseServiceStub = {
            getEnrollmentByLevel: () => observableOf({})
        };

        const jobPostServiceStub = {};
        const salaryServiceStub = {};
        const sectorServiceStub = {};
        const workforcePlanServiceStub = {
            listDistinctJobFamilies: () => observableOf([])
        };

        TestBed.configureTestingModule({
            declarations: [
                RouterLinkStubDirective,
                WorkforcePlanDashboardComponent,
                StubRequestProgressIndicatorComponent,
                EducationLevelWidgetComponent,
                SalaryWidgetComponent,
                TitleCountWidgetComponent
            ],
            imports: [
                FormsModule,
                NoopAnimationsModule,
                NgxChartsModule,
                ButtonsModule.forRoot()
            ],
            providers: [
                {provide: ActivatedRoute, useValue: activatedRouteStub},
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
        fixture = TestBed.createComponent(WorkforcePlanDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
