import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { empty as observableEmpty } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { ANIMATIONS } from '../animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: ANIMATIONS
})
export class LoginComponent implements OnInit {
  public username: string;
  public password: string;
  public error: string;
  public isLoggingIn: boolean;

  constructor(private _router: Router, private _authService: AuthService) { }

  ngOnInit() {
    // Redirect if already logged in
    console.log('logged in', this._authService.isLoggedIn);
    // clear authentication token
    this._authService.logout();
    if (this._authService.isLoggedIn && !this._authService.isGuest()) {
      this._router.navigateByUrl(this._authService.redirectUrl || '/home');
    }
  }

  login() {
    this.isLoggingIn = true;
    this._authService.login(this.username, this.password).pipe(
      catchError((err, source) => {
        this.isLoggingIn = false;
        this.error = err.error.error ? err.error.error_description : err.message;
        return observableEmpty();
      })).subscribe(s => this._router.navigate([this._authService.redirectUrl || '/home']));
  }

  logout() {
    this._authService.logout().subscribe(s => {
      this._router.navigate(['/home']);
    });
  }
}
