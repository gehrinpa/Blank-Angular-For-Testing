import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlertModule, CollapseModule, TooltipModule } from 'ngx-bootstrap';

import { MapRegionDataComponent } from './map-region-data.component';
import { SharedService } from '../../services/shared.service';
import { SkillsService } from '../../services/skills.service';
import { StubMapComponent } from '../../testing/stubs';

describe('MapRegionDataComponent', () => {
  let component: MapRegionDataComponent;
  let fixture: ComponentFixture<MapRegionDataComponent>;

  beforeEach(async(() => {
    const skillsServiceStub = {};

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,

        AlertModule.forRoot(),
        CollapseModule.forRoot(),
        TooltipModule.forRoot()
      ],
      providers: [
        SharedService,
        { provide: SkillsService, useValue: skillsServiceStub }
      ],
      declarations: [ MapRegionDataComponent, StubMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapRegionDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
