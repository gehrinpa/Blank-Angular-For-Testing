/* tslint:disable:no-unused-variable */

import { TestBed, async, inject, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of as observableOf } from 'rxjs';

import { DataComponent } from './data.component';
import { SharedService } from '../services/shared.service';
import { GeodataService } from '../services/geodata.service';
import { StubSearchCompareHeaderComponent } from '../testing/stubs';

describe('Component: Data', () => {
  let component: DataComponent;
  let fixture: ComponentFixture<DataComponent>;

  beforeEach(async(() => {
    const geodataServiceStub = {
      getRegionNames() { return observableOf([]); }
    };

    const sharedServiceStub = {
      getItems() {
        return [ 'item1', 'item2' ];
      },

      setItems(item1, item2, mode) {},

      mode: 'company',
      nutsLevel: 1,
      nutsRegion: 'UK',
      searchOptions: {}
    };

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: SharedService, useValue: sharedServiceStub },
        { provide: GeodataService, useValue: geodataServiceStub }
      ],
      declarations: [
          DataComponent,
          StubSearchCompareHeaderComponent
        ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
