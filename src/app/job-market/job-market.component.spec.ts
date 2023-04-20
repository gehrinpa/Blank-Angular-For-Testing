import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobMarketComponent } from './job-market.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

describe('JobMarketComponent', () => {
  let component: JobMarketComponent;
  let fixture: ComponentFixture<JobMarketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobMarketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
