import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationChooserMapComponent } from './location-chooser-map.component';

describe('LocationChooserMapComponent', () => {
  let component: LocationChooserMapComponent;
  let fixture: ComponentFixture<LocationChooserMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationChooserMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationChooserMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});