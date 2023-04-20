import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleCountWidgetComponent } from './title-count-widget.component';

import { JobPostService } from '../../services/job-post.service';
import { WorkforcePlanService } from '../../services/workforce-plan.service';

describe('TitleCountWidgetComponent', () => {
    let component: TitleCountWidgetComponent;
    let fixture: ComponentFixture<TitleCountWidgetComponent>;

    beforeEach(async(() => {
        const jobPostServiceStub = {
        };

        const workforcePlanServiceStub = {
        };

        TestBed.configureTestingModule({
            declarations: [ TitleCountWidgetComponent ],
            providers: [
                {provide: JobPostService, useValue: jobPostServiceStub},
                {provide: WorkforcePlanService, useValue: workforcePlanServiceStub}
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TitleCountWidgetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
