import { Component, Directive, Input, HostListener } from '@angular/core';

// tslint:disable-next-line:component-selector
@Component({selector: 'router-outlet', template: ''})
export class RouterOutletStubComponent {}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[routerLink]'
})
export class RouterLinkStubDirective {
  @Input() routerLink: any;
  navigatedTo: any = null;

  @HostListener('click') onClick() {
    this.navigatedTo = this.routerLink;
  }
}

export class RouterStub {
  navigateByUrl(url: string) { return Promise.resolve(true); }
  navigate(commands) { return Promise.resolve(true); }
}
