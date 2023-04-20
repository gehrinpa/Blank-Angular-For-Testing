import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of as observableOf } from 'rxjs';

import { AlertModule, ButtonsModule } from 'ngx-bootstrap';

import { RegionalAnalyticsComponent } from './regional-analytics.component';
import { StubMapComponent, StubJobListComponent, StubGraphMapComponent, StubSearchCompareHeaderComponent } from '../../testing/stubs';
import { ApiService } from '../../services/api.service';
import { SharedService } from '../../services/shared.service';
import { GeodataService } from '../../services/geodata.service';

describe('RegionalAnalyticsComponent', () => {
  let component: RegionalAnalyticsComponent;
  let fixture: ComponentFixture<RegionalAnalyticsComponent>;

  beforeEach(async(() => {
    const sharedServiceStub = {
      mode: 'company',
      searchOptions: {},

      getItems() {
        return ['item1', 'item2'];
      }
    };

    const apiServiceStub = {
      getJobPostings(query, mode, nutsCode, itemNo, page, title, skill) {
        return observableOf({});
      }
    };

    const geodataServiceStub = {
      getRegionNames(region, country) {
        return observableOf([]);
      }
    };

    TestBed.configureTestingModule({
      declarations: [
        RegionalAnalyticsComponent,
        StubGraphMapComponent,
        StubJobListComponent,
        StubMapComponent,
        StubSearchCompareHeaderComponent
      ],
      imports: [
        FormsModule,
        NoopAnimationsModule,
        AlertModule.forRoot(),
        ButtonsModule.forRoot()
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceStub },
        { provide: SharedService, useValue: sharedServiceStub },
        { provide: GeodataService, useValue: geodataServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegionalAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
