import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CollapseModule, TypeaheadModule } from 'ngx-bootstrap';
import { of as observableOf } from 'rxjs';

import { SearchCompareHeaderComponent } from './search-compare-header.component';

import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SharedService } from '../../services/shared.service';
import { StubRequestProgressIndicatorComponent } from '../../testing/stubs';

describe('SearchCompareHeaderComponent', () => {
    let component: SearchCompareHeaderComponent;
    let fixture: ComponentFixture<SearchCompareHeaderComponent>;

    beforeEach(async(() => {
        const apiServiceStub = {};
        const authServiceStub = {};
        const sharedServiceStub = {
            searchOptions$: observableOf({}),
            items$: observableOf({}),
            setItems() {},
            getSearchVisible() { return observableOf(true); }
        };

        TestBed.configureTestingModule({
            declarations: [
                SearchCompareHeaderComponent,
                StubRequestProgressIndicatorComponent
            ],
            imports: [
                FormsModule,
                CollapseModule.forRoot(),
                TypeaheadModule.forRoot(),
            ],
            providers: [
                { provide: SharedService, useValue: sharedServiceStub},
                { provide: ApiService, useValue: apiServiceStub },
                { provide: AuthService, useValue: authServiceStub }
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchCompareHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
