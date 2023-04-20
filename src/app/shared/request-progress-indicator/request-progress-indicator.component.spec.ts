import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of as observableOf } from 'rxjs';

import { RequestProgressIndicatorComponent } from './request-progress-indicator.component';

import { SharedService } from '../../services/shared.service';

describe('RequestProgressIndicatorComponent', () => {
    let component: RequestProgressIndicatorComponent;
    let fixture: ComponentFixture<RequestProgressIndicatorComponent>;

    beforeEach(async(() => {
        const sharedServiceStub = {
            getRequestsInProgress() { return observableOf(0); },
        };
        TestBed.configureTestingModule({
            declarations: [ RequestProgressIndicatorComponent ],
            providers: [
                { provide: SharedService, useValue: sharedServiceStub }
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RequestProgressIndicatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
