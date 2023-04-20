import { NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AlertModule, ButtonsModule, CollapseModule, ModalModule, PaginationModule, TooltipModule, TabsModule } from 'ngx-bootstrap';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead'; // if imported above the suggestion list does not appear

import { MdcDrawerModule, MdcListModule, MdcIconModule } from '@angular-mdc/web';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { AppComponent, HomeComponent, DataComponent,
    LoginComponent, SkillsCloudsComponent, CareersCloudsComponent, SkillsGraphComponent,
    CareersGraphComponent, ExperienceGraphComponent, StaffJoinersGraphComponent } from './';
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { RequireAuthenticated, RequireFeaturePermission } from './services/auth-route.service';
import { CareersService } from './services/careers.service';
import { SharedService } from './services/shared.service';
import { SkillsService } from './services/skills.service';
import { GeodataService } from './services/geodata.service';
import { JobMarketService } from './services/job-market.service';

import { routing } from './app.routing';

import { AuthHttpInterceptor } from './http-interceptor';

import { SharedModule } from './shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatSlideToggleModule } from '@angular/material';


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        routing,
        HttpClientModule,
        FormsModule,
        NgSelectModule,
        AlertModule.forRoot(),
        ButtonsModule.forRoot(),
        CollapseModule.forRoot(),
        // BsDatepickerModule.forRoot(),
        ModalModule.forRoot(),
        PaginationModule.forRoot(),
        TooltipModule.forRoot(),
        TabsModule.forRoot(),
        TypeaheadModule.forRoot(),
        MdcDrawerModule,
        MdcIconModule,
        MdcListModule,
        MatSlideToggleModule,
        NgxChartsModule,
        SharedModule
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        DataComponent,
        LoginComponent,
        SkillsCloudsComponent,
        CareersCloudsComponent,
        SkillsGraphComponent,
        CareersGraphComponent,
        ExperienceGraphComponent,
        StaffJoinersGraphComponent
    ],
    providers: [
        ApiService,
        AuthService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthHttpInterceptor,
            multi: true
        },
        CareersService,
        RequireAuthenticated,
        RequireFeaturePermission,
        SharedService,
        SkillsService,
        GeodataService,
        JobMarketService
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule { }
