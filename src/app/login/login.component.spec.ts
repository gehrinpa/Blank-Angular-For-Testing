/* tslint:disable:no-unused-variable */

import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertModule } from 'ngx-bootstrap';

import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';

describe('Component: Login', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    const routerStub = {
        navigate() {}
    };
    const authServiceStub = {
      login() {},
      logout() {}
    };

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        AlertModule.forRoot()
      ],
      declarations: [ LoginComponent ],
      providers: [
        { provide: Router, useValue: routerStub },
        { provide: AuthService, useValue: authServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
