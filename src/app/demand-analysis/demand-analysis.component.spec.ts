import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandAnalysisComponent } from './demand-analysis.component';

describe('DemandAnalysisComponent', () => {
  let component: DemandAnalysisComponent;
  let fixture: ComponentFixture<DemandAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DemandAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DemandAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
