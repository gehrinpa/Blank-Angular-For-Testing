import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AlertModule, CollapseModule } from 'ngx-bootstrap';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { TitleBreakdownComponent } from './title-breakdown.component';

import { SalaryService } from '../../services/salary.service';
import { SharedService } from '../../services/shared.service';
import { SkillsService } from '../../services/skills.service';

import { StubGraphMapComponent } from '../../testing/stubs';

describe('TitleBreakdownComponent', () => {
    let component: TitleBreakdownComponent;
    let fixture: ComponentFixture<TitleBreakdownComponent>;

    beforeEach(async(() => {
        const sharedServiceStub = {
            searchOptions: {},
        };

        const salaryServiceStub = {};
        const skillsServiceStub = {};

        TestBed.configureTestingModule({
            declarations: [
                TitleBreakdownComponent,
                StubGraphMapComponent
            ],
            imports: [
                FormsModule,
                NoopAnimationsModule,
                AlertModule.forRoot(),
                CollapseModule.forRoot(),
                NgxChartsModule
            ],
            providers: [
                { provide: SharedService, useValue: sharedServiceStub },
                { provide: SalaryService, useValue: salaryServiceStub },
                { provide: SkillsService, useValue: skillsServiceStub },
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TitleBreakdownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
