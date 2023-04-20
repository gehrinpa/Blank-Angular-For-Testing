import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryWidgetComponent } from './salary-widget.component';

import { JobPostService } from '../../services/job-post.service';
import { SalaryService } from '../../services/salary.service';
import { WorkforcePlanService } from '../../services/workforce-plan.service';

describe('SalaryWidgetComponent', () => {
    let component: SalaryWidgetComponent;
    let fixture: ComponentFixture<SalaryWidgetComponent>;

    beforeEach(async(() => {
        const jobPostServiceStub = {};

        const salaryServiceStub = {
        };

        const workforcePlanServiceStub = {
        };

        TestBed.configureTestingModule({
            declarations: [ SalaryWidgetComponent ],
            providers: [
                {provide: JobPostService, useValue: jobPostServiceStub},
                {provide: SalaryService, useValue: salaryServiceStub},
                {provide: WorkforcePlanService, useValue: workforcePlanServiceStub}
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SalaryWidgetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
