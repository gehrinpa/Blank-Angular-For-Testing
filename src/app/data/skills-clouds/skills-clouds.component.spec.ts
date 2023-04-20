/* tslint:disable:no-unused-variable */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AlertModule, PaginationModule } from 'ngx-bootstrap';

import { SkillsCloudsComponent } from './skills-clouds.component';

import { ApiService } from '../../services/api.service';
import { SharedService } from '../../services/shared.service';
import { SkillsService } from '../../services/skills.service';

import { StubJobListComponent, StubGraphMapComponent, StubTreeMapComponent } from '../../testing/stubs';

describe('Component: SkillsClouds', () => {
    let component: SkillsCloudsComponent;
    let fixture: ComponentFixture<SkillsCloudsComponent>;

    beforeEach(() => {
        const apiServiceStub = {};
        const skillsServiceStub = {};

        TestBed.configureTestingModule({
            declarations: [
                SkillsCloudsComponent,
                StubGraphMapComponent,
                StubJobListComponent,
                StubTreeMapComponent
            ],
            imports: [
                HttpClientTestingModule,
                NoopAnimationsModule,
                AlertModule.forRoot(),
                PaginationModule.forRoot()
            ],
            providers: [
                SharedService,
                { provide: ApiService, useValue: apiServiceStub },
                { provide: SkillsService, useValue: skillsServiceStub }
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SkillsCloudsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
