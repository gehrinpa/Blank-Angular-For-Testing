import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of as observableOf } from 'rxjs';

import { EducationLevelWidgetComponent } from './education-level-widget.component';

import { CourseService } from '../../services/course.service';

describe('EducationLevelWidgetComponent', () => {
    let component: EducationLevelWidgetComponent;
    let fixture: ComponentFixture<EducationLevelWidgetComponent>;

    beforeEach(async(() => {
        const courseServiceStub = {
            getEnrollmentByLevel: () => observableOf({})
        };

        TestBed.configureTestingModule({
            declarations: [ EducationLevelWidgetComponent ],
            providers: [
                {provide: CourseService, useValue: courseServiceStub}
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EducationLevelWidgetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
