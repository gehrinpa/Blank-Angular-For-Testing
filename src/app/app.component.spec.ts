/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CollapseModule } from 'ngx-bootstrap';

import { MdcDrawerModule, MdcIconModule, MdcListModule } from '@angular-mdc/web';

import { AppComponent } from './app.component';

import { SharedService } from './services/shared.service';
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';

describe('App: GeekTalentInsightApp', () => {
  beforeEach(async(() => {
    const mockApiService = {};
    const mockAuthService = {};

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),

        CollapseModule.forRoot(),
        MdcDrawerModule,
        MdcIconModule,
        MdcListModule
      ],
      providers: [
        SharedService,
        { provide: ApiService, useValue: mockApiService },
        { provide: AuthService, useValue: mockAuthService }
      ],
      declarations: [AppComponent]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
