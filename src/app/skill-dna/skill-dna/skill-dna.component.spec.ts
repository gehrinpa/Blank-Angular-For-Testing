import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillDnaComponent } from './skill-dna.component';

describe('SkillDnaComponent', () => {
  let component: SkillDnaComponent;
  let fixture: ComponentFixture<SkillDnaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkillDnaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillDnaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
