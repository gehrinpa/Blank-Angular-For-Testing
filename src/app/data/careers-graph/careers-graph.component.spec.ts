/* tslint:disable:no-unused-variable */

import { TestBed, async, inject, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AlertModule } from 'ngx-bootstrap';

import { CareersGraphComponent } from './careers-graph.component';
import { SharedService } from '../../services/shared.service';
import { CareersService } from '../../services/careers.service';
import { StubGraphMapComponent } from '../../testing/stubs';

describe('Component: CareersGraph', () => {
  let component: CareersGraphComponent;
  let fixture: ComponentFixture<CareersGraphComponent>;

  beforeEach(async(() => {
    const careersServiceStub = {};

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        AlertModule.forRoot()
      ],
      providers: [
        SharedService,
        { provide: CareersService, useValue: careersServiceStub }
      ],
      declarations: [CareersGraphComponent, StubGraphMapComponent]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CareersGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
