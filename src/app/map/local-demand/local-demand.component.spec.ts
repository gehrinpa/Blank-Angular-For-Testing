import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AlertModule, ButtonsModule, CollapseModule, BsDatepickerModule } from 'ngx-bootstrap';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { LocalDemandComponent } from './local-demand.component';
import { TitleBreakdownComponent } from '../title-breakdown/title-breakdown.component';

import { AuthService } from '../../services/auth.service';
import { SalaryService } from '../../services/salary.service';
import { SharedService } from '../../services/shared.service';
import { SkillsService } from '../../services/skills.service';

import { StubMapComponent, StubGraphMapComponent, StubSearchCompareHeaderComponent } from '../../testing/stubs';

describe('LocalDemandComponent', () => {
  let component: LocalDemandComponent;
  let fixture: ComponentFixture<LocalDemandComponent>;

  beforeEach(async(() => {
    const authServiceStub = {
        canViewAnyRegionData() { return true; }
    };

    const salaryServiceStub = {
    };

    const sharedServiceStub = {
      searchOptions: {},
    };

    const skillsServiceStub = {
    };

    TestBed.configureTestingModule({
      declarations: [
        LocalDemandComponent,
        StubGraphMapComponent,
        StubMapComponent,
        TitleBreakdownComponent,
        StubSearchCompareHeaderComponent
      ],
      imports: [
        FormsModule,
        NoopAnimationsModule,
        AlertModule.forRoot(),
        ButtonsModule.forRoot(),
        CollapseModule.forRoot(),
        BsDatepickerModule.forRoot(),
        NgxChartsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: SalaryService, useValue: salaryServiceStub },
        { provide: SharedService, useValue: sharedServiceStub },
        { provide: SkillsService, useValue: skillsServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalDemandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
