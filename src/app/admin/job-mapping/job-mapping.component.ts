import { Component, OnInit } from '@angular/core';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Observable, of as observableOf, forkJoin } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { CareerResult, CareersService } from '../../services/careers.service';
import { CompanySearchResult, CompanyService } from '../../services/company.service';
import { SectorSearchResult, SectorService } from '../../services/sector.service';
import { WorkforcePlanService, JobFamilyMappingResult } from '../../services/workforce-plan.service';

@Component({
    selector: 'app-job-mapping',
    templateUrl: './job-mapping.component.html',
    styleUrls: ['./job-mapping.component.scss']
})
export class JobMappingComponent implements OnInit {
    // sector typeahead
    sectorFilterText = '';
    sectorTypeahead: Observable<SectorSearchResult[]>;
    selectedSector?: SectorSearchResult = null;

    // company typeahead
    companyFilterText = '';
    companyTypeahead: Observable<CompanySearchResult[]>;
    selectedCompany?: CompanySearchResult = null;

    // titles to map to
    careers: CareerResult[] = [];

    // families to map from
    jobFamilies: string[] = [];

    mappings: {[id: number]: JobFamilyMappingResult} = {};

    constructor(private careerService: CareersService, private companyService: CompanyService, private sectorService: SectorService,
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
    }

    sectorSelected(event: TypeaheadMatch) {
        this.selectedSector = event.item;
        this.loadData();
    }

    sectorChange() {
        if (this.selectedSector != null && this.sectorFilterText == '') {
            this.selectedSector = null;
            this.loadData();
        }
    }

    companySelected(event: TypeaheadMatch) {
        this.selectedCompany = event.item;
        this.loadData();
    }

    companyChange() {
        if (this.selectedCompany != null && this.companyFilterText == '') {
            this.selectedCompany = null;
            this.loadData();
        }
    }

    saveChanges() {
        for (const careerId of Object.keys(this.mappings)) {
            const mapping = this.mappings[careerId];

            if (mapping.jobFamily == '') {
                continue;
            }

            if (mapping.id == 0) {
                this.workforcePlanService.createJobFamilyMapping(mapping).subscribe(
                    m => this.mappings[m.careerId] = m
                );
            } else {
                this.workforcePlanService.updateJobFamilyMapping(mapping.id, {jobFamily: mapping.jobFamily}).subscribe(
                    m => this.mappings[m.careerId] = m
                );
            }
        }
    }

    private loadData() {
        if (!this.selectedSector) {
            this.careers = [];
            this.jobFamilies = [];
            this.mappings = {};
            return;
        }

        const companyId = this.selectedCompany ? this.selectedCompany.id : null;

        this.workforcePlanService.listDistinctJobFamilies(this.selectedSector.id, companyId).subscribe(
            jobFamilies => this.jobFamilies = jobFamilies
        );

        forkJoin(
            this.careerService.list(this.selectedSector.id),
            this.workforcePlanService.listJobFamilyMappings(this.selectedSector.id, companyId)
        ).subscribe(([careers, mappings]) => {
            this.careers = careers;
            this.mappings = {};

            for (const career of careers) {
                const mapping = mappings.find(m => m.careerId == career.id);

                if (mapping) {
                    this.mappings[career.id] = mapping;
                } else {
                    this.mappings[career.id] = {
                        id: 0,
                        jobFamily: '',

                        careerId: career.id,
                        careerTitle: career.title,

                        companyId,
                        sectorId: this.selectedSector.id
                    };
                }
            }
        });
    }
}
