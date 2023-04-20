/* tslint:disable:no-unused-variable */

import { TestBed, async, inject, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AlertModule } from 'ngx-bootstrap';

import { SkillsGraphComponent } from './skills-graph.component';
import { SharedService } from '../../services/shared.service';
import { SkillsService } from '../../services/skills.service';
import { StubGraphMapComponent } from '../../testing/stubs';

describe('Component: SkillsGraph', () => {
  let component: SkillsGraphComponent;
  let fixture: ComponentFixture<SkillsGraphComponent>;

  beforeEach(async(() => {
    const skillsServiceStub = {};

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        AlertModule.forRoot()
      ],
      providers: [
        SharedService,
        { provide: SkillsService, useValue: skillsServiceStub }
      ],
      declarations: [SkillsGraphComponent, StubGraphMapComponent]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
