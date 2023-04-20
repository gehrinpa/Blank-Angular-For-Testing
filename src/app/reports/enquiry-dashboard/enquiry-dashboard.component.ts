import { Component, OnInit } from '@angular/core';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Observable, of as observableOf, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { SectorSearchResult, SectorService } from '../../services/sector.service';
import { WorkforcePlanService, WorkforcePlanStatus, WorkforcePlanRoleResult, WorkforcePlanType
} from '../../services/workforce-plan.service';

interface SingleSeriesChartItem {
    name: string;
    value: number;
 }

interface MultiSeriesChartItem {
   name: string;
   series: {
       name: string;
       value: number;
   }[];
}

@Component({
    selector: 'app-enquiry-dashboard',
    templateUrl: './enquiry-dashboard.component.html',
    styleUrls: ['./enquiry-dashboard.component.scss']
})
export class EnquiryDashboardComponent implements OnInit {
    // sector typeahead
    sectorFilterText = '';
    sectorTypeahead: Observable<SectorSearchResult[]>;
    selectedSector?: SectorSearchResult = null;

    dateGroup = 'month';

    enquirySummaryChartData: SingleSeriesChartItem[] = [];
    enquiriesByMonthChartData: MultiSeriesChartItem[] = [];
    headcountByEnquiryChartData: MultiSeriesChartItem[] = [];

    constructor(private sectorService: SectorService, private workforcePlanService: WorkforcePlanService) { }

    ngOnInit() {
        this.sectorTypeahead = Observable.create(observer => {
            observer.next(this.sectorFilterText);
        }).pipe(
            switchMap((token: string) => this.sectorService.search(token)),
            catchError(e => observableOf([]))
        );

        this.loadData();
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

    dateGroupingChanged() {
        console.log(this.dateGroup);
        this.loadData();
    }

    private loadData() {
        const sectorId = this.selectedSector ? this.selectedSector.id : null;
        this.workforcePlanService.list(sectorId).pipe(
            map(plans => plans.filter(p => p.type == WorkforcePlanType.Enquiry))
        ).subscribe(plans => {
            // get some counts (TODO: add api for this)

            const planCountByStatus = {
                [WorkforcePlanStatus.Live]: 0,
                [WorkforcePlanStatus.Draft]: 0,
                [WorkforcePlanStatus.Archived]: 0
            };

            const planCountByMonth = {};

            for (const plan of plans) {
                planCountByStatus[plan.status]++;

                let yearMonth;
                const date = new Date(plan.targetDate);

                if (this.dateGroup == 'month') {
                    yearMonth = date.toISOString().split('-').slice(0, 2).join('-');
                } else {
                    yearMonth = `${date.getFullYear()} Q${Math.floor(date.getMonth() / 3) + 1}`;
                }

                if (!(yearMonth in planCountByMonth)) {
                    planCountByMonth[yearMonth] = {
                        statuses: {
                            [WorkforcePlanStatus.Live]: 0,
                            [WorkforcePlanStatus.Draft]: 0,
                            [WorkforcePlanStatus.Archived]: 0
                        },
                        total: 0
                    };
                }

                planCountByMonth[yearMonth].statuses[plan.status]++;
                planCountByMonth[yearMonth].total++;
            }

            // map to charts
            this.enquirySummaryChartData = Object.keys(planCountByStatus).map(status =>
                ({name: status, value: planCountByStatus[status]})
            );

            this.enquiriesByMonthChartData = [];

            for (const month of Object.keys(planCountByMonth)) {
                const item = {name: month, series: []};
                for (const status of Object.keys(planCountByMonth[month].statuses)) {
                    item.series.push({name: status, value: planCountByMonth[month].statuses[status]});
                }

                this.enquiriesByMonthChartData.push(item);
            }

            // sort months
            this.enquiriesByMonthChartData.sort((a, b) => a.name.localeCompare(b.name));

            // role counts
            // TODO: also needs an api
            forkJoin(plans.map(plan => this.workforcePlanService.listRolesForPlan(plan.id))).pipe(
                map(roleLists => Array.prototype.concat(...roleLists))
            ).subscribe((allRoles: WorkforcePlanRoleResult[]) => {
                const jobFamilyHeadcountByMonth = {};

                for (const role of allRoles) {
                    const plan = plans.find(p => p.id == role.planId);

                    if (!role.jobFamily) {
                        continue;
                    }

                    let yearMonth;
                    const date = new Date(plan.targetDate);

                    if (this.dateGroup == 'month') {
                        yearMonth = date.toISOString().split('-').slice(0, 2).join('-');
                    } else {
                        yearMonth = `${date.getFullYear()} Q${Math.floor(date.getMonth() / 3) + 1}`;
                    }

                    if (!(yearMonth in jobFamilyHeadcountByMonth)) {
                        jobFamilyHeadcountByMonth[yearMonth] = {};
                    }

                    if (!(role.jobFamily in jobFamilyHeadcountByMonth[yearMonth])) {
                        jobFamilyHeadcountByMonth[yearMonth][role.jobFamily] = 0;
                    }

                    jobFamilyHeadcountByMonth[yearMonth][role.jobFamily] += role.currentHeadcount;
                }

                // map to chart
                this.headcountByEnquiryChartData = [];
                for (const month of Object.keys(jobFamilyHeadcountByMonth)) {
                    const item = {name: month, series: []};
                    for (const jobFamily of Object.keys(jobFamilyHeadcountByMonth[month])) {
                        item.series.push({name: jobFamily, value: jobFamilyHeadcountByMonth[month][jobFamily]});
                    }

                    this.headcountByEnquiryChartData.push(item);
                }

                // sort months
                this.headcountByEnquiryChartData.sort((a, b) => a.name.localeCompare(b.name));
            });
        });
    }
}
