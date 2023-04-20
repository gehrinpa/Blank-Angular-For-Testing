import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TypeaheadMatch, BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { CompanySearchResult, CompanyService, CompanyUpdate, CompanyResult } from '../../services/company.service';
import { SectorSearchResult, SectorService, SectorResult } from '../../services/sector.service';
import { WorkforcePlanService, WorkforcePlanResult, WorkforcePlanType, WorkforcePlanStatus } from '../../services/workforce-plan.service';

@Component({
    selector: 'app-workforce-plan-list',
    templateUrl: './workforce-plan-list.component.html',
    styleUrls: ['./workforce-plan-list.component.scss']
})
export class WorkforcePlanListComponent implements OnInit {
    // sector typeahead
    sectorFilterText = '';
    sectorTypeahead: Observable<SectorSearchResult[]>;
    selectedSector?: SectorSearchResult = null;

    // company typeahead
    companyFilterText = '';
    companyTypeahead: Observable<CompanySearchResult[]>;
    selectedCompany?: CompanySearchResult = null;

    planType?: WorkforcePlanType = null;
    planStatus?: WorkforcePlanStatus = null;

    plans: WorkforcePlanResult[] = [];
    filteredPlans: WorkforcePlanResult[] = [];

    icons = {
        [WorkforcePlanType.Plan]: 'description',
        [WorkforcePlanType.Scenario]: 'gps_fixed',
        [WorkforcePlanType.Enquiry]: 'phone'
    };

    badgeModifier = {
        [WorkforcePlanStatus.Live]: 'badge-success',
        [WorkforcePlanStatus.Draft]: 'badge-danger',
        [WorkforcePlanStatus.Archived]: 'badge-secondary'
    };

    allCompanies: CompanyResult[] = [];
    allSectors: SectorResult[] = [];

    // modals
    createCompanyModalRef: BsModalRef;

    @ViewChild('createPlanTargetModalTemplate') createPlanTargetModalTemplate: TemplateRef<any>;
    createPlanTargetModalRef: BsModalRef;
    @ViewChild('createPlanSectorModalTemplate') createPlanSelectSectorModalTemplate: TemplateRef<any>;
    @ViewChild('createPlanCompanyModalTemplate') createPlanSelectCompanyModalTemplate: TemplateRef<any>;
    createPlanSelectModalRef: BsModalRef;
    @ViewChild('createPlanModalTemplate') createPlanModalTemplate: TemplateRef<any>;
    createPlanModalRef: BsModalRef;

    createPlanSector?: SectorResult = null;
    createPlanCompany?: CompanyResult = null;

    constructor(private modalService: BsModalService, private companyService: CompanyService, private sectorService: SectorService,
        private workforcePlanService: WorkforcePlanService) { }

    ngOnInit() {
        this.sectorTypeahead = Observable.create(observer => {
            observer.next(this.sectorFilterText);
        }).pipe(
            switchMap((token: string) => this.sectorService.search(token)),
            catchError(e => observableOf([]))
        );

        this.companyTypeahead = Observable.create(observer => {
            observer.next(this.companyFilterText);
        }).pipe(
            switchMap((token: string) => this.companyService.search(token, this.selectedSector ? this.selectedSector.id : null)),
            catchError(e => observableOf([]))
        );

        this.updatePlanList();
    }

    sectorSelected(event: TypeaheadMatch) {
        this.selectedSector = event.item;
        this.updatePlanList();
    }

    sectorChange() {
        if (this.selectedSector != null && this.sectorFilterText == '') {
            this.selectedSector = null;
            this.updatePlanList();
        }
    }

    companySelected(event: TypeaheadMatch) {
        this.selectedCompany = event.item;
        this.updatePlanList();
    }

    companyChange() {
        if (this.selectedCompany != null && this.companyFilterText == '') {
            this.selectedCompany = null;
            this.updatePlanList();
        }
    }

    planTypeChanged() {
        console.log(this.planType);
        this.filterPlanList();
    }

    planStatusChanged() {
        this.filterPlanList();
    }

    openCreateCompanyModal(template: TemplateRef<any>) {
        this.sectorService.list().subscribe(sectors => {
            this.allSectors = sectors;
            this.createCompanyModalRef = this.modalService.show(template);
        });
    }

    createCompanySubmit(form: NgForm) {
        const company: Partial<CompanyUpdate> = {
            name: form.value.name,
            sectorId: form.value.sector,

            address1: form.value.address1,
            address2: form.value.address2,
            county: form.value.county,
            town: form.value.town,
            postcode: form.value.postcode,

            contactName: form.value.contactName,
            contactEmail: form.value.contactEmail,
            contactPhone: form.value.contactPhone
        };
        this.companyService.create(company).subscribe(data => {
            this.createCompanyModalRef.hide();
        });
    }

    openCreatePlanTargetModal() {
        this.createPlanTargetModalRef = this.modalService.show(this.createPlanTargetModalTemplate);
    }

    openCreatePlanSelectSectorModal() {
        this.createPlanSector = null;
        this.createPlanCompany = null;

        this.sectorService.list().subscribe(sectors => {
            this.allSectors = sectors;
            this.createPlanTargetModalRef.hide();
            this.createPlanSelectModalRef = this.modalService.show(this.createPlanSelectSectorModalTemplate);
        });
    }

    openCreatePlanSelectCompanyModal() {
        this.createPlanSector = null;
        this.createPlanCompany = null;

        this.companyService.list().subscribe(companies => {
            this.allCompanies = companies;
            this.createPlanTargetModalRef.hide();
            this.createPlanSelectModalRef = this.modalService.show(this.createPlanSelectCompanyModalTemplate);
        });
    }

    createPlanSelectBack() {
        this.createPlanSelectModalRef.hide();
        this.openCreatePlanTargetModal();
    }

    openCreatePlanModal() {
        this.createPlanSelectModalRef.hide();
        this.createPlanModalRef = this.modalService.show(this.createPlanModalTemplate);
    }

    createPlanBack() {
        this.createPlanModalRef.hide();

        if (this.createPlanCompany != null) {
            this.createPlanSelectModalRef = this.modalService.show(this.createPlanSelectCompanyModalTemplate);
        } else {
            this.createPlanSelectModalRef = this.modalService.show(this.createPlanSelectSectorModalTemplate);
        }
    }

    createPlanSubmit(form: NgForm) {
        const plan: Partial<WorkforcePlanResult> = {
            name: form.value.name,
            description: form.value.description,
            type: form.value.type,
            status: WorkforcePlanStatus.Draft
        };

        if (this.createPlanCompany != null) {
            // company
            plan.companyId = this.createPlanCompany.id;
            plan.sectorId = this.createPlanCompany.sectorId;
        } else {
            // sector
            plan.sectorId = this.createPlanSector.id;
        }

        this.workforcePlanService.create(plan, form.value.copyTemplate).subscribe(data => {
            this.createPlanModalRef.hide();
            this.updatePlanList();
        });
    }

    private updatePlanList() {
        const sectorId = this.selectedSector ? this.selectedSector.id : null;
        const companyId = this.selectedCompany ? this.selectedCompany.id : null;
        this.workforcePlanService.list(sectorId, companyId).subscribe(plans => {
            this.plans = plans;
            this.filterPlanList();
        });
    }

    private filterPlanList() {
        this.filteredPlans = this.plans.filter(plan => {
            if (this.planType && plan.type != this.planType) {
                return false;
            }

            if (this.planStatus && plan.status != this.planStatus) {
                return false;
            }

            return true;
        });
    }
}
