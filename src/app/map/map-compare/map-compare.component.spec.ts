/* tslint:disable:no-unused-variable */

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { MapCompareComponent } from './map-compare.component';
import { SharedService } from '../../services/shared.service';
import { ApiService } from '../../services/api.service';
import { StubMapRegionDataComponent, StubSearchCompareHeaderComponent } from '../../testing/stubs';

describe('Component: MapCompare', () => {
  let component: MapCompareComponent;
  let fixture: ComponentFixture<MapCompareComponent>;

  beforeEach(async(() => {
    const mockApiService = {};

    const sharedServiceStub = {
      logNewComponent() {},
      mode: 'company',
      nutsLevel: 1,
      searchOptions: {}
    };

    TestBed.configureTestingModule({
      imports: [
        FormsModule
      ],
      providers: [
        { provide: SharedService, useValue: sharedServiceStub },
        { provide: ApiService, useValue: mockApiService }
      ],
      declarations: [
          MapCompareComponent,
          StubMapRegionDataComponent,
          StubSearchCompareHeaderComponent
        ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
